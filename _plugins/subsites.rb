# Reads what each sub-site in _data/subsites.yml publishes, at build time:
#
# - `lastmod`:     the page's Last-Modified header, used in /sitemap-pages.xml.
# - `description`: its <meta name="description">, used in /llms.txt.
# - `sitemap`:     <url>sitemap.xml if it exists; the /sitemap.xml index then
#                  references it instead of listing the URL as a single page.
# - `llms`:        <url>llms.txt if it exists; linked from /llms.txt.
#
# Values set by hand in the data file win. Unreachable sites (e.g. offline
# builds) keep only what the data file provides.

require "cgi"
require "net/http"
require "time"
require "uri"

module Subsites
  class Generator < Jekyll::Generator
    priority :highest

    def generate(site)
      Array(site.data["subsites"]).each do |item|
        page = URI(item["url"])
        if (response = request(page, :get)).is_a?(Net::HTTPSuccess)
          item["lastmod"] ||= Time.httpdate(response["last-modified"]).iso8601 if response["last-modified"]
          item["description"] ||= meta_description(response.body)
        end

        { "sitemap" => ["sitemap.xml", "xml"], "llms" => ["llms.txt", "text/"] }.each do |key, (file, type)|
          next if item[key]

          candidate = URI.join(page, file)
          response = request(candidate, :head)
          item[key] = candidate.to_s if response.is_a?(Net::HTTPSuccess) && response["content-type"].to_s.include?(type)
        end
      end
    end

    private

    def request(uri, method)
      Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == "https", open_timeout: 5, read_timeout: 5) do |http|
        method == :head ? http.head(uri.request_uri) : http.get(uri.request_uri)
      end
    rescue StandardError => error
      Jekyll.logger.warn "Subsites:", "could not reach #{uri} (#{error.class})"
      nil
    end

    def meta_description(html)
      tag = html.to_s.force_encoding("UTF-8")[/<meta\s[^>]*name=["']description["'][^>]*>/mi]
      content = tag && tag[/content=["']([^"']*)["']/m, 1]
      content && CGI.unescapeHTML(content.gsub(/\s+/, " ").strip)
    end
  end
end
