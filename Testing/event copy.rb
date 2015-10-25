# Author: Jason Almeida
# Contributors: Justin Forsthoefel (zeta497), 10/1/15
#                 - Added fields, cleaned up code, created flexibility
class Event

  attr_accessor :name,        # Name of event
                :time,        # Date and time of event
                :description, # Optional
                :location     # Optional

  # Basic event only requires a name and date
  def initialize(**fields)
    raise ArgumentError, "Event must have a name" unless fields[:name] != nil
    raise ArgumentError, "Event must have a time" unless fields[:time] != nil
    fields.each do |key, val|
      case key
      when :name
        @name = val
      when :time
        @time = val
      when :description
        @description = val
      when :location
        @location = val
      else
        raise ArgumentError, "No event field with the name (#{key})"
      end
    end
  end

end
