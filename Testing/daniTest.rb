
require './eventAgg'
require 'date'

#@thisWeekEvents = Array.new
x = EventAgg.new()
days = 2;
x.getEvents(days)
puts x.thisWeekEvents[0].length
=begin
i = 1;
#checking Deparment Dates
4.times do |site|
	howManyEvents = x.allEvents[site].length
	howManyEvents.times do |event|
		if((x.allEvents[site][event].date >= Date.today) && (x.allEvents[site][event].date <= Date.today+7))
			i+=1
			@thisWeekEvents<< x.allEvents[site][event]
		end
	end
end
puts i;
=end
puts x.allEvents[0].length
puts x.allEvents[1].length
puts x.allEvents[2].length
puts x.allEvents[3].length
#puts @thisWeekEvents.length