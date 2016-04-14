function handEligible(playerId) {
    return state.players[playerId].coins > state.tables[state.players[playerId].currentTableId].blind * 2;
}
    
function getPlayer(hand, playerId){
    return hand.players.find(function(handPlayer){
        return handPlayer._id == playerId; 
    });
}

export default function hands(state = {}, action){    
    
    switch(action.type){
        case "addHand":
            var table = state.tables[action.payload.tableId];
            var id = Utils.getId("hnd");
            var hand = state.hands[id] = {
                _id: id,
                tableId: table._id,
                status: "pending",                    					
                rounds: [],
                cards: [],
                players: table.players.filter(handEligible).map(function(playerId) {
                    return {
                        _id: playerId,
                        cards: [],
                        bet: 0,
                        hasFolded: false,
                        isAllIn: false,
                        potential: 0
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
            player.potential += action.payload.potential;
            break;
        case "foldPlayer":
            var hand = state.hands[action.payload.handId];
            var player = getPlayer(hand, action.payload.playerId); 
            player.hasFolded = true;
            break;
        case "close":
            var hand = state.hands[action.payload.handId];
            hand.status = "closed";
            var results = HandSolver.getResults(hand);
            for(var playerId in results){
                players({ type: "transferTo", payload: { playerId: playerId, amount: results[playerId].winnings }});
            }
            hand.result = results;  
            printResults(hand, results);              
            hands({type: "add", payload: { tableId: hand.tableId }});
            break;
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
                    action.type = "river";
                    break;
                case "river":
                    action.type = "close";
                    break;
                default :
                    action.type = "close";
            }
            hands(action);
            break;
        default :			
            return state;
    }
}