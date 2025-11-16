require 'json'
require 'net/http'
require 'uri'

module Publications
  class Generator < Jekyll::Generator
    safe true
    priority :low

    def generate(site)
      dois = site.data['dois'] || []
      return if dois.nil? || dois.empty?

      author_name = site.config['author_name'] || ''
      author_last = site.config['author_last'] || (author_name.split.last || '')

      pubs = []
      dois.each do |entry|
        doi = entry.is_a?(Hash) ? (entry['doi'] || entry['id'] || entry['ref']) : entry
        flags = entry.is_a?(Hash) ? (entry['flags'] || []) : []
        rank  = entry.is_a?(Hash) ? (entry['rank'] || 9999) : 9999
        rec = fetch_crossref(doi)
        next unless rec

        m = rec['message'] || {}
        title = (m['title'] || []).first.to_s
        year = extract_year(m)
        venue = (m['container-title'] || []).first.to_s
        authors = format_authors(m['author'] || [])
        authors_html = highlight_author(authors, author_name, author_last)

        pubs << {
          'doi' => doi,
          'title' => title,
          'year' => year,
          'venue' => venue,
          'authors' => authors,
          'authors_html' => authors_html,
          'flags' => flags,
          'rank' => rank
        }
      end

      pubs.sort_by! { |p| [-(p['year'] || 0), (p['rank'] || 9999), (p['title'] || '').downcase] }
      site.data['publications'] = pubs
    end

    private

    def fetch_crossref(doi)
      url = URI.parse("https://api.crossref.org/works/#{URI.encode_www_form_component(doi)}")
      begin
        Net::HTTP.start(url.host, url.port, use_ssl: true, read_timeout: 8, open_timeout: 5) do |http|
          req = Net::HTTP::Get.new(url)
          req['User-Agent'] = 'Jekyll Publications Plugin (mailto:me@example.com)'
          res = http.request(req)
          return JSON.parse(res.body) if res.is_a?(Net::HTTPSuccess)
        end
      rescue => _e
        return nil
      end
      nil
    end

    def extract_year(message)
      date = message['published-print'] || message['published-online'] || message['issued'] || {}
      parts = date['date-parts']&.first || []
      parts[0]
    end

    def format_authors(authors)
      authors.map do |a|
        given = (a['given'] || '').strip
        family = (a['family'] || '').strip
        initials = given.split.map { |p| p[0] }.join('. ')
        initials += '.' unless initials.empty?
        if family.empty?
          given
        else
          initials.empty? ? family : "#{family}, #{initials}"
        end
      end
    end

    def highlight_author(formatted_authors, author_name, author_last)
      last_down = (author_last || '').downcase
      name_down = (author_name || '').downcase
      formatted_authors.map do |s|
        sd = s.downcase
        if !last_down.empty? && sd.start_with?(last_down + ',')
          "<strong>#{s}</strong>"
        elsif !name_down.empty? && sd.include?(name_down)
          "<strong>#{s}</strong>"
        else
          s
        end
      end.join('; ')
    end
  end
end
