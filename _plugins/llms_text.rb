# Support for /llms-full.txt, a plain-Markdown copy of the site for language models.
#
# llms-full.txt embeds the prose of other pages, so it must render after them
# (their `content` is then converted HTML), and that HTML is turned back into
# lightweight Markdown by the `llm_markdown` filter.

require "cgi"

module LlmsText
  LAST_PAGES = ["llms-full.txt"].freeze

  Jekyll::Hooks.register :site, :pre_render do |site|
    last, others = site.pages.partition { |page| LAST_PAGES.include?(page.name) }
    site.pages.replace(others + last)
  end

  module Filters
    # Converts the simple HTML produced by kramdown into compact Markdown.
    # Headings are demoted by `shift` levels so pages nest under a section.
    def llm_markdown(html, shift = 1)
      site_url = @context.registers[:site].config["url"].to_s
      text = html.to_s.dup

      text.gsub!(/<(script|style|button|template)\b.*?<\/\1>/m, "")
      text.gsub!(/<h([1-6])\b[^>]*>(.*?)<\/h\1>/m) do
        "\n\n#{'#' * [Regexp.last_match(1).to_i + shift, 6].min} #{Regexp.last_match(2).strip}\n\n"
      end
      text.gsub!(/<a\b[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/m) do
        href = Regexp.last_match(1)
        href = site_url + href if href.start_with?("/")
        "[#{Regexp.last_match(2).strip}](#{href})"
      end
      text.gsub!(/<\/?(strong|b)\b[^>]*>/, "**")
      text.gsub!(/<\/?(em|i)\b[^>]*>/, "*")
      text.gsub!(/<\/?code\b[^>]*>/, "`")
      text.gsub!(/\s*<li\b[^>]*>\s*(<p>)?/, "\n- ")
      text.gsub!(/<br\s*\/?>/, "\n")
      text.gsub!(/<\/(p|div|ul|ol|blockquote|h\d)>/, "\n\n")
      text.gsub!(/<[^>]+>/, "")
      text = CGI.unescapeHTML(text)

      text.lines.map(&:strip).join("\n").gsub(/\n{3,}/, "\n\n").strip
    end
  end
end

Liquid::Template.register_filter(LlmsText::Filters)
