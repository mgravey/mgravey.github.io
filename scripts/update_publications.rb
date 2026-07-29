#!/usr/bin/env ruby

require "json"
require "net/http"
require "optparse"
require "uri"
require "yaml"

ROOT = File.expand_path("..", __dir__)
PUBLICATIONS_FILE = File.join(ROOT, "_data/publications.yml")
LEGACY_FILE = File.join(ROOT, "_data/dois.yml")

options = { refresh: false, migrate_legacy: false }
OptionParser.new do |parser|
  parser.banner = "Usage: ruby scripts/update_publications.rb [options] [DOI ...]"
  parser.on("--refresh", "Refresh metadata for every publication") { options[:refresh] = true }
  parser.on("--migrate-legacy", "Import the former DOI catalog once") { options[:migrate_legacy] = true }
end.parse!

def normalize_doi(value)
  value.to_s.strip.sub(%r{\Ahttps?://(?:dx\.)?doi\.org/}i, "").downcase
end

def load_records(options)
  records = File.exist?(PUBLICATIONS_FILE) ? (YAML.load_file(PUBLICATIONS_FILE) || []) : []
  if options[:migrate_legacy]
    legacy = File.exist?(LEGACY_FILE) ? (YAML.load_file(LEGACY_FILE) || []) : []
    legacy.each do |entry|
      item = entry.is_a?(Hash) ? entry : { "doi" => entry }
      doi = normalize_doi(item["doi"] || item["id"] || item["ref"])
      next if doi.empty? || records.any? { |record| normalize_doi(record["doi"]) == doi }

      records << {
        "doi" => doi,
        "flags" => Array(item["flags"]),
        "rank" => item["rank"] || 9999
      }
    end
  end
  records
end

def fetch_crossref(doi, attempts: 3)
  uri = URI("https://api.crossref.org/works/#{URI.encode_www_form_component(doi)}")
  attempts.times do |attempt|
    request = Net::HTTP::Get.new(uri)
    request["Accept"] = "application/json"
    request["User-Agent"] = "mgravey.github.io publication updater (https://www.mgravey.com/contact/)"
    response = Net::HTTP.start(
      uri.host,
      uri.port,
      use_ssl: true,
      open_timeout: 10,
      read_timeout: 20
    ) { |http| http.request(request) }
    return JSON.parse(response.body).fetch("message") if response.is_a?(Net::HTTPSuccess)

    warn "Crossref returned #{response.code} for #{doi}"
    sleep(2**attempt) if attempt + 1 < attempts
  rescue StandardError => error
    warn "Crossref request failed for #{doi}: #{error.message}"
    sleep(2**attempt) if attempt + 1 < attempts
  end
  nil
end

def publication_year(message)
  date = message["published-print"] || message["published-online"] || message["issued"] || {}
  date.dig("date-parts", 0, 0)
end

def metadata_for(message)
  {
    "title" => Array(message["title"]).first.to_s.strip,
    "year" => publication_year(message),
    "venue" => Array(message["container-title"]).first.to_s.strip,
    "authors" => Array(message["author"]).map do |author|
      {
        "given" => author["given"].to_s.strip,
        "family" => author["family"].to_s.strip,
        "orcid" => author["ORCID"]&.split("/")&.last
      }.compact
    end
  }
end

records = load_records(options)
ARGV.each do |raw_doi|
  doi = normalize_doi(raw_doi)
  next if doi.empty? || records.any? { |record| normalize_doi(record["doi"]) == doi }

  records << { "doi" => doi, "flags" => [], "rank" => 9999 }
end

if records.empty?
  warn "No publications found. Add a DOI argument or use --migrate-legacy."
  exit 1
end

failed = []
records.each do |record|
  record["doi"] = normalize_doi(record["doi"])
  complete = record["title"] && record["year"] && record["venue"] && Array(record["authors"]).any?
  next if complete && !options[:refresh]

  message = fetch_crossref(record["doi"])
  if message
    record.merge!(metadata_for(message))
    puts "Updated #{record['doi']}"
  elsif !complete
    failed << record["doi"]
  end
end

unless failed.empty?
  warn "No metadata was written because these DOI records are incomplete: #{failed.join(', ')}"
  exit 1
end

records.sort_by! do |record|
  [-record.fetch("year", 0).to_i, record.fetch("rank", 9999).to_i, record.fetch("title", "").downcase]
end

temporary = "#{PUBLICATIONS_FILE}.tmp"
File.write(temporary, records.to_yaml(line_width: -1))
File.rename(temporary, PUBLICATIONS_FILE)
puts "Wrote #{records.length} publications to _data/publications.yml"
