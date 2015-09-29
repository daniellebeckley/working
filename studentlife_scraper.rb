require 'nokogiri'
require 'mechanize'


#mechanize uses the nokogiri gem to parse
scraper = Mechanize.new

page = scraper.get('http://studentlife.osu.edu/calendar.aspx/')
html_doc = Nokogiri::HTML(page.body)

#get all of the events
listed_info =  html_doc.css('li.confirmed')

#putting raw information in document named 'entire_list'
File.open('entire_list', 'w'){ |f|
f.puts listed_info
}

#creating array of arrays with information stored
INFO = []
INFO <<['Website', 'Time', 'Name', 'Presenters']

listed_info.each do |eachEvent|
	#grabs link, removes <a href=", and adds the first part of url
	link =  eachEvent.css('a').to_s.slice(9, eachEvent.css('a').to_s.length)
	separatingLink =  link.split ">"
	link = 'http://studentlife.osu.edu/calendar.aspx' + separatingLink[0]
	name = eachEvent.css('a').text.strip
	presented_by = eachEvent.css('span.departments').text.strip
	time = eachEvent.css('span.time').text.strip

	INFO << [link, time, name, presented_by]

end

#opens a file named scraped text and puts in the scraped information
begin
File.open('scraped_text', 'w'){|x|
x.puts INFO
x.puts
}
end


