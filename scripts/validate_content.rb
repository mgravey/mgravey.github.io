#!/usr/bin/env ruby

require "date"
require "yaml"

ROOT = File.expand_path("..", __dir__)
errors = []

def load_yaml(name)
  YAML.load_file(File.join(ROOT, "_data", name))
rescue Psych::SyntaxError => error
  abort "#{name}: #{error.message}"
end

person = load_yaml("person.yml")
cv = load_yaml("cv.yml")
portfolio = load_yaml("portfolio.yml")
publications = load_yaml("publications.yml")
taxonomy = load_yaml("taxonomy.yml")

experience_ids = cv.fetch("experience", []).map { |item| item["id"] }
education_ids = cv.fetch("education", []).map { |item| item["id"] }
unless experience_ids.include?(person["current_experience_id"])
  errors << "person.current_experience_id does not reference cv.experience"
end
Array(person["featured_experience_ids"]).each do |id|
  errors << "Unknown featured experience: #{id}" unless experience_ids.include?(id)
end
unless education_ids.include?(person["featured_education_id"])
  errors << "person.featured_education_id does not reference cv.education"
end

known_tags = taxonomy.fetch("tags", []).map { |item| item["key"] }
portfolio_ids = portfolio.map { |item| item["id"] }
duplicates = portfolio_ids.tally.select { |_id, count| count > 1 }.keys
errors << "Duplicate portfolio IDs: #{duplicates.join(', ')}" unless duplicates.empty?

portfolio.each do |item|
  errors << "Portfolio #{item['id']} has no description" if item["description"].to_s.strip.empty?
  errors << "Portfolio #{item['id']} has no type" if Array(item["types"]).empty?
  (Array(item["tags"]) + Array(item["status"])).each do |tag|
    errors << "Portfolio #{item['id']} uses unknown tag #{tag}" unless known_tags.include?(tag)
  end
  Array(item["links"]).each do |link|
    errors << "Portfolio #{item['id']} contains a placeholder URL" if link["url"].to_s.match?(/example\.(com|org)/)
  end
end

dois = publications.map { |item| item["doi"].to_s.downcase }
duplicate_dois = dois.tally.select { |_doi, count| count > 1 }.keys
errors << "Duplicate publication DOIs: #{duplicate_dois.join(', ')}" unless duplicate_dois.empty?
publications.each do |publication|
  %w[doi title year venue authors].each do |field|
    value = publication[field]
    errors << "Publication #{publication['doi']} is missing #{field}" if value.nil? || (value.respond_to?(:empty?) && value.empty?)
  end
  Array(publication["flags"]).each do |flag|
    errors << "Publication #{publication['doi']} uses unknown flag #{flag}" unless known_tags.include?(flag)
  end
end

page_files = Dir.glob(File.join(ROOT, "*.md"))
page_files.each do |path|
  content = File.read(path)
  next unless content.start_with?("---")
  front_matter = content.split("---", 3)[1]
  data = YAML.safe_load(front_matter, permitted_classes: [Date], aliases: true) || {}
  errors << "#{File.basename(path)} is missing a description" if data["description"].to_s.strip.empty?
end

if errors.empty?
  puts "Content validation passed."
else
  warn errors.map { |error| "- #{error}" }.join("\n")
  exit 1
end
