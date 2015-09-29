
require 'nokogiri'
require 'mechanize'

#mechanize uses the nokogiri gem to parse
scraper = Mechanize.new

page = scraper.get('http://studentlife.osu.edu/calendar.aspx/')
html_doc = Nokogiri::HTML(page.body)
#gets all of the list objects, will eventually strip down to just the event lists

listed_info =  html_doc.css('li.confirmed')
File.open('entire_list', 'w'){ |f|
f.puts listed_info
}
text = []
text <<['Time', 'Name', 'Presenters']
text << listed_info[0].text
stuff = text[1].split("\n")

puts stuff

File.open('scraped_text', 'w'){|x|
x.puts stuff
}


