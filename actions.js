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
                players({type: "joinTable", payload: { tableId: table._id, playerId: action.payload.playerId }});
				break;
            case "removePlayer":
				var table = state.tables[action.payload.tableId];
                var index = table.players.indexOf(action.payload.playerId);
                if(index >= 0){
                    table.players.splice(index, 1);
                    players({type: "leaveTable", payload: { playerId: action.payload.playerId }});
                }				
				break;
			default :			
				return state;
		}
	}
	
	function hands(action){
        var handEligible = function(playerId){
            return state.players[playerId].coins > state.tables[state.players[playerId].currentTableId].blind * 2;
        }
        
        var getPlayer = function(hand, playerId){
            return hand.players.find(function(handPlayer){
                return handPlayer._id == playerId; 
            });
        }
        
		switch(action.type){
			case "add":
				var table = state.tables[action.payload.tableId];
				var id = Utils.getId("hnd");
				var hand = state.hands[id] = {
					_id: id,
                    tableId: table._id,
					status: "pending",                    					
					rounds: [],
					players: table.players.filter(handEligible).map(function(playerId) {
                        return {
                            _id: playerId,
                            cards: [],
                            bet: 0,
                            hasFolded: false,
                            isAllIn: false
                        }
					}),
					deck: []
				};
				
				table.handId = hand._id;
                hands({type: "next", payload: { handId: hand._id}});
				return hand._id;
			case "deal":
				var hand = state.hands[action.payload.handId];
				hand.deck = Deck.shuffle();
				hand.players.forEach(function(handPlayer){
					handPlayer.cards.push(hand.deck.shift());
					handPlayer.cards.push(hand.deck.shift());
                });
				hand.status = "preFlop";
                hand.rounds.push(rounds({type: "add", payload: { handId: hand._id }}));
				break;
			case "flop":
				var hand = state.hands[action.payload.handId];
				hand.cards.push(hand.deck.shift());
				hand.cards.push(hand.deck.shift());
				hand.cards.push(hand.deck.shift());
				hand.status = "flop";
                hand.rounds.push(rounds({type: "add", payload: { handId: hand._id }}));
				break;
			case "turn":
				var hand = state.hands[action.payload.handId];
				hand.cards.push(hand.deck.shift());
				hand.status = "turn";
                hand.rounds.push(rounds({type: "add", payload: { handId: hand._id }}));
				break;
			case "river":
				var hand = state.hands[action.payload.handId];
				hand.cards.push(hand.deck.shift());
				hand.status = "river";
                hand.rounds.push(rounds({type: "add", payload: { handId: hand._id }}));
				break;
            case "addPlayerBet":
                var hand = state.hands[action.payload.handId];
                var player = getPlayer(hand, action.payload.playerId); 
                player.bet += action.payload.amount;
            case "foldPlayer":
                var hand = state.hands[action.payload.handId];
                var player = getPlayer(hand, action.payload.playerId); 
                player.hasFolded = true;
            case "close":
                var hand = state.hands[action.payload.handId];
                hand.status = "closed";
                // do transfers
            case "next":
                var hand = state.hands[action.payload.handId];
                var action = { payload: { handId: hand._id }};
                switch(hand.status){
                    case "pending":
                        action.type = "deal";
                        break;
                    case "preFlop":
                        action.type = "flop";
                        break;
                    case "flop":
                        action.type = "turn";
                        break;
                    case "turn":
                        action.type = "deal";
                        break;
                    case "river":
                        action.type = "river";
                        break;
                    default :
                        action.type = "close";
                }
                hands(action);
			default :			
				return state;
		}
	}
    
    function rounds(action){
        var next = function(roundId){
            var round = state.rounds[roundId];
            var hand = state.hands[round.handId];
            var nextPlayer = Utils.nextWrap(round.players, round.players.findIndex(function(roundPlayer){
                return roundPlayer._id == round.actionPlayerId;
            }), function(roundPlayer){
                var handPlayer = hand.players.find(function(handPlayer) {
                    return handPlayer._id == roundPlayer._id
                });
                
                var maxBet = getMaxBet(roundId);
                
                // if everyone has folded, went all in or called, then we are done with the betting round
                return !handPlayer.hasFolded && !handPlayer.isAllIn && handPlayer.bet != maxBet; 
            });
            
            if(nextPlayer == null) {
                return rounds({type: "close", payload:{ roundId: roundId }});
            }
            round.actionPlayerId = nextPlayer._id;
        }
        
        var getMaxBet = function(roundId) {
            var round = state.rounds[roundId];
            return round.players.reduce(function(prev, curr){
                return Math.max(curr.bet, prev); 
            }, 0);
        }
        
        var currentPlayer = function(roundId){
            var round = state.rounds[roundId];
            return round.players[indexFromId(round.players, round.actionPlayerId)];            
        }
        
        var indexFromId = function(players, playerId){
            return players.findIndex(function(roundPlayer){ 
                return roundPlayer._id == playerId;
            });
        }
            
        switch(action.type){
			case "add":
				var hand = state.hands[action.payload.handId];
                var table = state.tables[hand.tableId];
				var id = Utils.getId("rnd");
                
                // only include players who have not folded
                var roundPlayers = hand.players.filter(function(handPlayer){
                    return !handPlayer.hasFolded && !handPlayer.isAllIn
                }).map(function(handPlayer) {
                    return { 
                        _id: handPlayer._id,
                        bet: 0
                    };
                });
                
                // initial bettor
                var actionPlayerId = Utils.nextWrap(table.players, table.dealer, function(playerId){
                    return indexFromId(roundPlayers, playerId) >= 0;
                });
                
				var round = state.rounds[id] = {
					_id: id,
                    handId: hand._id,
					status: "open",          
					players: roundPlayers,
                    actionPlayerId: actionPlayerId
				};
                
                // blinds
                if(Object.keys(state.rounds).length == 1) {
                    rounds({type: "bet", payload: { roundId: round._id, amount: table.blind }});
                    rounds({type: "bet", payload: { roundId: round._id, amount: table.blind }});
                }
                
				return round._id;
            case "fold":
                var round = state.rounds[action.payload.roundId];
                hands({ type: "foldPlayer", payload: { handId: round.handId, playerId: round.actionPlayerId }});
                next(round._id);
                break;
            case "check":
                next(action.payload.roundId);
                break;
            case "call":
                var round = state.rounds[action.payload.roundId];
                var player = currentPlayer(action.payload.roundId);
                player.bet += players({ type: "transferFrom", payload: { playerId: round.actionPlayerId, amount: getMaxBet(round._id) - player.bet}});
                next(round._id);
                break;
            case "bet":
                var round = state.rounds[action.payload.roundId];
                var player = currentPlayer(action.payload.roundId);
                player.bet += players({ type: "transferFrom", payload: { playerId: round.actionPlayerId, amount: getMaxBet(round._id) + action.payload.amount}});
                next(round._id);
                break;
            case "allIn":
                var round = state.rounds[action.payload.roundId];
                currentPlayer(action.payload.roundId).bet += players({ type: "transferAll", payload: { playerId: round.actionPlayerId }});
                next(round._id);
                break;
            case "close":
                var round = state.rounds[action.payload.roundId];
                round.status = "closed";
                
                // transfer from round bets to hand pot and track 
                round.players.forEach(function(roundPlayer){
                    hands({type: "addPlayerBet", payload: { handId: round.handId, playerId: roundPlayer._id, amount: roundPlayer.bet }});
                });
                
                // go to the next state in the hand
                hands({type: "next", payload: { handId: round.handId }});
                break
            default: 
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
					coins: 5000,
                    currentTableId: null                    
				}
				return player._id;
            case "joinTable": 
                var player = state.players[action.payload.playerId];
                player.status = "table";
                player.currentTableId = action.payload.tableId;
                break;
            case "leaveTable": 
                var player = state.players[action.payload.playerId];
                player.status = "lobby";
                player.currentTableId = null;
                break;
            case "transferFrom":					
				var player = state.players[action.payload.playerId];
                if(player.coins >= action.payload.amount){
                    player.coins -= action.payload.amount;
                    return action.payload.amount;  
                }
            case "transferAll":					
				var player = state.players[action.payload.playerId];
                var coins = player.coins;
                player.coins = 0;
                return coins;                
			default :			
				return state;
		}
	}
	
	return {
		tables: tables,
		players: players,
		hands: hands,
        rounds: rounds
	}
})();