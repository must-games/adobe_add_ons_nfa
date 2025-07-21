require 'fileutils'
require 'roo'
require 'json'
require 'digest'

def executeCommand(cmd)
  puts "execute [#{cmd}]"
  system(cmd)
end

def log(msg)
  puts "#{Time.now.to_s} #{msg}"
end

def is_windows
  if RbConfig::CONFIG['host_os'] == "mingw32"
    return true
  end
  return false
end

def show_alert_and_exit(msg, exit_code=false)
  log("ERROR!!! #{msg}")
  exit exit_code
end

def generate_unique_key(category, name)
  Digest::MD5.hexdigest("#{category}-#{name}")
end

def group_file_name(file)
  # "Brown Bear_1.png" → "Brown Bear"
  name_only = File.basename(file, File.extname(file))
  base_name = name_only.sub(/_\d+$/, '')  # 뒤의 _숫자 제거
  base_name
end

def add_directory_contents(directory, category_path, grouped_category, entry)
  entries = Dir.entries(directory).reject { |entry| entry == '.' || entry == '..' || entry.start_with?('_') }
  directories, files = entries.partition { |entry| File.directory?(File.join(directory, entry)) }

  sorted_files = files.sort_by { |file| file.downcase }

  grouped = {}

  sorted_files.each do |file|
    base_name = group_file_name(file)
    grouped[base_name] ||= []

    unique_key = generate_unique_key(entry, base_name)
    data = {
      "key" => unique_key,
      "path" => "#{category_path}/#{file}"
    }

    grouped[base_name] << data
  end

  # grouped_category 에 push
  grouped.each do |base_name, items|
    grouped_category << {
      "group" => base_name,
      "items" => items
    }
  end
end

def list_directory_contents(directory, categories)
  return unless Dir.exist?(directory)

  Dir.entries(directory).each do |entry|
    next if entry == '.' || entry == '..'

    full_path = File.join(directory, entry)
    if File.directory?(full_path)
      puts "[Directory] #{full_path} / #{entry}"

      categories[entry] = []
      add_directory_contents(full_path, entry, categories[entry], entry)
    end
  end
end

image_path = '../../Client/src/assets/images'
categories = {}
categories['category_list'] = [
  'Common',
  'Endangered',
]

list_directory_contents(image_path, categories)
File.write("./category.json", JSON.pretty_generate(categories, ensure_ascii: false), encoding: 'utf-8')
File.write("../../Client/src/assets/category.json", JSON.pretty_generate(categories, ensure_ascii: false), encoding: 'utf-8')
