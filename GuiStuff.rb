
require 'green_shoes'

Shoes.app :title => "The Game of Set", 
width: 1000, height: 750 do
background green
fill white
class Actions
		@myApp
		
		def initialize(myApp)
			@myApp = myapp
		end

		def replace(slotID, card)
			cardID  = "img#{slotID}.png"
			@cardList[slotID] = cardID
			@imageList[slotID].path = card
		end
		
end
#variable setup
	@cardList, @imageList, @checkList = [], [], []
	@player1score, @player2score = 0
	@cardsOnTable = 12
	18.times do |i| #iterable card file names
		@cardList << "img#{i}.png"
	end

#Display Settings	
	border(white)	
	title("The Game of Set", size: 50, stroke: rgb(255, 255, 255), align: 'center')
	inscription('Brought to you by Team: Redacted', emphasis: 'italic', align: 'center')
	caption('SCORES', align: 'left', underline: 'single', weight: "bold")
	caption("Player One: #{@player1score}                       Player Two: #{@player2score}", weight: "ultralight")
	rect(left: 700, top: 200, width: 100, fill: rgb(0, 191, 255))
	rect(left: 710, top: 200, width: 100, fill: rgb(0, 191, 255))
	rect(left: 720, top: 200, width: 100, fill: rgb(0, 191, 255))
#begin display logic
	flow do #outer flow
		slot = 0
		4.times do #12 cards for now, add 3 functionality will come later
			flow do #inner flow 1, 2, 3
				3.times do 
					
					@i = image @cardList[slot] #displays card image, add numbers later	
					@imageList << @i
					@checkList << check;
					#image @cardList[slot], height: 55, width:50
					slot += 1
					#both adds a new check to array and displays a check in-line with flow layout
				end 	
			end #inner flow 1
		end
			
		flow do #inner flow 4
			button "Replace Set" do
				string = ""
				x = @imageList.length
				alert("#{x}")	
				i = 0
				x.times do
					if @checkList[i].checked? 
					#if card checked, corresponding card name from array is pulled
						@imageList[i].path = "img#{(i+1)*3}.png" #temporary replacement code
						@checkList[i].checked =false
					end
					i+=1			
	 		   end
			end
		#when no set is found on the board, three additional cards will be dealt 
			button "No Set On Board" do
			if(@cardsOnTable < 18)
				slot = @cardsOnTable
				over = 0			
				3.times do
					@i = image @cardList[slot]
					@imageList << @i
					@checkList << check;
					slot += 1
				image @cardList[slot], height: 55, width:50, top:300, left:0+over
				over +=65
				end
			@cardsOnTable += 3
			para @cardsOnTable		
			end
			end
		end #inner flow 4
	end
	
