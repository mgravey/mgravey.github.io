require 'json'
require 'yaml'
require 'open-uri'
require 'net/http'
require 'uri'

DOI_FILE = 'assets/dois.json'
OUTPUT_FILE = '_data/publications.yml'

# Follow redirects
def fetch_with_redirect(uri, limit = 5)
  raise "Too many redirects" if limit == 0

  req = Net::HTTP::Get.new(uri)
  req['Accept'] = 'application/vnd.citationstyles.csl+json'

  res = Net::HTTP.start(uri.host, uri.port, use_ssl: true) { |http| http.request(req) }

  case res
  when Net::HTTPSuccess
    res
  when Net::HTTPRedirection
    new_uri = URI(res['location'])
    fetch_with_redirect(new_uri, limit - 1)
  else
    raise "HTTP error: #{res.code} #{res.message}"
  end
end

def clean_orcid(orcid)
  return nil unless orcid
  orcid.split('/').last
end

def extract_year(data)
  parts = data.dig('published-online', 'date-parts') ||
          data.dig('published-print', 'date-parts') ||
          data.dig('issued', 'date-parts')
  parts&.first&.first
end

dois = JSON.parse(File.read(DOI_FILE))
publications = []

dois.each do |doi|
  url = URI("https://doi.org/#{doi}")

  begin
    res = fetch_with_redirect(url)
    data = JSON.parse(res.body)

    pub = { doi: doi }

    pub[:title]   = data['title'] if data['title']
    pub[:journal] = data['container-title'] if data['container-title']
    pub[:volume]  = data['volume'] if data['volume']
    pub[:issue]   = data['issue'] if data['issue']
    pub[:page]    = data['page'] if data['page']

    year = extract_year(data)
    pub[:year] = year if year

    # Authors
    if data['author']
      pub[:authors] = data['author'].map do |a|
        author = {
          name: {
            first: a['given'],
            family: a['family']
          }
        }
        orcid = clean_orcid(a['ORCID'])
        author[:orcid] = orcid if orcid
        author
      end
    end

    publications << pub
    puts "✅ Parsed: #{doi}"
  rescue => e
    puts "❌ Error with DOI #{doi}: #{e.message}"
  end
end

def deep_stringify_keys(obj)
  case obj
  when Hash
    obj.each_with_object({}) do |(k, v), result|
      result[k.to_s] = deep_stringify_keys(v)
    end
  when Array
    obj.map { |e| deep_stringify_keys(e) }
  else
    obj
  end
end

# Write to YAML
File.open(OUTPUT_FILE, 'w') do |f|
  f.write(deep_stringify_keys(publications).to_yaml)
end

puts "\n✅ Done. Wrote #{publications.size} publications to #{OUTPUT_FILE}"
