var Actions = (function(){
	
	function tables(action){
		switch(action.type){
			case "add":
				var id = Utils.getId("tbl");
				var table = state.tables[id] = {
					_id: id,
					players: [],
					status: "open",
					blind: 10,
					dealer: 0,
					hand: null
				}
				return table._id;
			case "addPlayer":
				var table = state.tables[action.payload.tableId];
				table.players.push(action.payload.playerId);
				break;				
			default :			
				return state;
		}
	}
	
	function hands(action){
		switch(action.type){
			case "add":
				var table = state.tables[action.payload.tableId];
				var id = Utils.getId("hnd");
				var hand = state.hands[id] = {
					_id: id,
					status: "pending",					
					cards: [],
					deck: [],
					players: table.players.reduce(function(prev, curr){
						prev[curr] = {
							_id: curr,
							cards: [],
							bet: 0,
							hasFolded: false,
							isAllIn: false,
						}
						return prev;
					}, {})
				};
				
				table.handId = hand._id;
				return hand._id;
			case "deal":
				var hand = state.hands[action.payload.handId];
				hand.deck = Deck.shuffle();
				for(var playerId in hand.players){
					var handPlayer = hand.players[playerId];
					handPlayer.cards.push(hand.deck.shift());
					handPlayer.cards.push(hand.deck.shift());
				};
				hand.status = "preFlop";
				break;
			case "flop":
				var hand = state.hands[action.payload.handId];
				hand.cards.push(hand.deck.shift());
				hand.cards.push(hand.deck.shift());
				hand.cards.push(hand.deck.shift());
				hand.status = "flop";
				break;
			case "turn":
				var hand = state.hands[action.payload.handId];
				hand.cards.push(hand.deck.shift());
				hand.status = "turn";
				break;
			case "river":
				var hand = state.hands[action.payload.handId];
				hand.cards.push(hand.deck.shift());
				hand.status = "river";
				break;
			default :			
				return state;
		}
	}
	
	function players(action){
		switch(action.type){
			case "add":	
				var id = Utils.getId("plr");
				var player = state.players[id] = {
					_id: id,					
					status: "lobby",
					coins: 5000
				}
				return player._id;
			default :			
				return state;
		}
	}
	
	return {
		tables: tables,
		players: players,
		hands: hands
	}
})();