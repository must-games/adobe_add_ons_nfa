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
    #puts    RbConfig::CONFIG['host_os']
    #puts RUBY_PLATFORM
    if RbConfig::CONFIG['host_os'] == "mingw32"
        return true
    end
    
    return false
end

def show_alert_and_exit(msg, exit_code=false)
    log("ERROR!!! #{msg}")
    exit exit_code
end

def generate_unique_key(category, filename)
  name_only = File.basename(filename, File.extname(filename))
  #puts name_only
  puts "#{category}-#{name_only}"
  return Digest::MD5.hexdigest("#{category}-#{name_only}")
end

def add_directory_contents(directory, category_path, category, entry)
  entries = Dir.entries(directory).reject { |entry| entry == '.' || entry == '..' || entry.start_with?('_') }
  directories, files = entries.partition { |entry| File.directory?(File.join(directory, entry)) }

  sorted_files = files.sort_by do |file|
    match = file.match(/^\d+/)
    match ? [match[0].to_i, file] : [Float::INFINITY, Digest::MD5.hexdigest(file)]
  end

  sorted_files.each do |file|
    unique_key = generate_unique_key(entry, file)
    data = {"key"=> "#{unique_key}", 
    "path"=> "#{category_path}/#{file}"}
    category.push(data)
  end

  # Dir.entries(directory).each do |entry|
  #     next if entry == '.' || entry == '..'

  #     full_path = File.join(directory, entry)
  #     if File.directory?(full_path)
  #       next
  #     else
  #       category.push("#{category_path}/#{entry}")
  #     end

  # end    
end

def list_directory_contents(directory, categories)
    return unless Dir.exist?(directory)
  
    Dir.entries(directory).each do |entry|
      next if entry == '.' || entry == '..'
      
      full_path = File.join(directory, entry)
      if File.directory?(full_path)
        puts "[Directory] #{full_path} / #{entry}"

        categories[entry] = []
        add_directory_contents(full_path, entry, categories[entry], entry) # 재귀 호출로 하위 디렉토리 탐색
      else
        #puts "  - #{entry}"
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
