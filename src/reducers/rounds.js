export default function rounds(state = {}, action){
    var playerNeedsTurn = function(roundId) {            
        return function(roundPlayer){
            var round = state.rounds[roundId];
            var hand = state.hands[round.handId];
            var handPlayer = hand.players.find(function(handPlayer) {
                return handPlayer._id == roundPlayer._id
            });

            var maxBet = getMaxBet(roundId);

            // if everyone has folded, went all in or called, then we are done with the betting round
            // except for the big blind, they get the chance to bet again even if they are even with current max bet
            var result = !handPlayer.hasFolded && 
                        !handPlayer.isAllIn && 
                        (
                            roundPlayer.bet != maxBet || 
                            roundPlayer.isBlind ||
                            !roundPlayer.hasBet
                        )
            
            if(roundPlayer.isBlind){
                roundPlayer.isBlind = false;
            }
            
            return result;
        }
    }
    
    var next = function(roundId){
        var round = state.rounds[roundId];
        var nextPlayer = Utils.nextWrap(round.players, round.players.indexOf(currentPlayer(round._id)), playerNeedsTurn(roundId));            
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
    
    // after a bet/call if anyone is currently 'all-in', we need
    // to track the potential winnings of that player by adding the amount
    // of the next player's call/bet up to the amount that the 'all-in'
    // player is in for
    var setPotential = function(bettingPlayer, round) {  
        
        round.players.forEach(function(player){
            player.potential = round.players.reduce(function(prev, curr) {
                return prev + Math.min(curr.bet, player.bet);
            }, 0)                
        });
    }
        
    switch(action.type){
        case "addRound":
            var hand = state.hands[action.payload.handId];
            var table = state.tables[hand.tableId];
            var id = Utils.getId("rnd");
            
            // only include players who have not folded
            var roundPlayers = hand.players.filter(function(handPlayer){
                return !handPlayer.hasFolded && !handPlayer.isAllIn
            }).map(function(handPlayer) {
                return { 
                    _id: handPlayer._id,
                    bet: 0,
                    potential: 0,
                    isBlind: false,
                    hasBet: false
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
                actionPlayerId: actionPlayerId,          
                players: roundPlayers,                    
            };
            
            // blinds
            if(Object.keys(state.rounds).length == 1) {
                rounds({type: "bet", payload: { roundId: round._id, amount: table.blind }});
                rounds({type: "bet", payload: { roundId: round._id, amount: table.blind, isBlind: true }});   
            }
            
            return round._id;
        case "fold":
            var round = state.rounds[action.payload.roundId];
            hands({ type: "foldPlayer", payload: { handId: round.handId, playerId: round.actionPlayerId }});
            next(round._id);
            break;
        case "check":
            var round = state.rounds[action.payload.roundId];
            var player = currentPlayer(action.payload.roundId);
            player.hasBet = true;
            next(action.payload.roundId);
            break;
        case "call":
            var round = state.rounds[action.payload.roundId];
            var player = currentPlayer(action.payload.roundId);
            player.hasBet = true;
            player.bet += players({ type: "transferFrom", payload: { playerId: round.actionPlayerId, amount: getMaxBet(round._id) - player.bet}});
            setPotential(player, round);                
            next(round._id);
            break;
        case "bet":
            var round = state.rounds[action.payload.roundId];
            var player = currentPlayer(action.payload.roundId);
            player.hasBet = true;
            player.bet += players({ type: "transferFrom", payload: { playerId: round.actionPlayerId, amount: getMaxBet(round._id) - player.bet + action.payload.amount}});
            player.isBlind = action.payload.isBlind || player.isBlind;
            setPotential(player, round);                
            next(round._id);
            break;
        case "allIn":
            var round = state.rounds[action.payload.roundId];
            var player = currentPlayer(action.payload.roundId);
            player.bet += players({ type: "transferAll", payload: { playerId: round.actionPlayerId }});
            setPotential(player, round);
            next(round._id);
            break;
        case "closeRound":
            var round = state.rounds[action.payload.roundId];
            round.status = "closed";
            
            // transfer from round bets to hand pot and track 
            round.players.forEach(function(roundPlayer){
                hands({type: "addPlayerBet", payload: { handId: round.handId, playerId: roundPlayer._id, amount: roundPlayer.bet, potential: roundPlayer.potential }});
            });
            
            // go to the next state in the hand
            hands({type: "next", payload: { handId: round.handId }});
            break
        default: 
        return state;            
    }
}