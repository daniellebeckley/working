#File: "Studentlife_scraper.rb"
#Author: Danielle Beckley(daniellebeckley)


require 'mechanize'
require 'date'


		@dates = []
days = 5;
	@today = Date.today
	days.times do |num|
		@dates << @today+num
	end

	

	@dates.each do |date|
	Mechanize.new.get("http://studentlife.osu.edu/calendar.aspx/#{date.year}/#{date.month}/#{date.day}").parser.css("li.confirmed").each do |event|
	link =  event.css('a').to_s.slice(9, event.css('a').to_s.length)
	separatingLink =  link.split ">"
	link = 'http://studentlife.osu.edu' + separatingLink[0]
	name = event.css('a').text.strip
	presented_by = event.css('span.departments').text.strip
	time = event.css('span.time').text.strip
	puts name
	puts date
	puts time
	puts link
	end
	end

