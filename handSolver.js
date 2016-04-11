var HandSolver = (function() {
    
    function getResults(hand) {
        var rankResults = determineWinners(hand);
        var result = {};
        rankResults.forEach(function(group){
            var sorted = group.sort(function(a, b){
                return hand.players.find(function(player){return player._id == b.playerId}).potential - hand.players.find(function(player){return player._id == a.playerId}).potential; 
            }).map(function(item){ 
                return Object.assign({}, item, { potential: hand.players.find(function(player){return player._id == item.playerId}).potential}) 
            });
            
            while(sorted.length > 0){
                
                var sharedPot = Math.floor(sorted[0].potential / sorted.length);
                sorted.forEach(function(handResult){
                    handResult.potential -= sorted[0].potential;
                    
                    if(!result[handResult.playerId]){
                        result[handResult.playerId] = Object.assign({}, handResult, {winnings: 0});
                    }
                    
                    result[handResult.playerId].winnings += sharedPot;
                });
                sorted.shift();
            }
        });
        return result;
    }
    
	function determineWinners(hand) {
		var result = [];
		for(var player of hand.players) {
            if(player.hasFolded) {
                continue;
            }
			result.push(Object.assign({}, { playerId: player._id }, solveHand(hand.cards.concat(player.cards))));
		}
		result = result.sort(function(a, b){
			return b.score - a.score;
		});
        
        var prevScore = 0;
        result = result.reduce(function(prev, curr){            
            if(prevScore == curr.score){
                prev[prev.length - 1].push(curr);
            }
            else {
                 prev.push([curr]);
            }
            prevScore = curr.score;
            return prev;
        }, []);      
        
        return result;
	}
	
    
    // todo:
    //  - deal with ties (kickers, second kickers, etc)
    //  - straight flush
    //  - straight with low ace
	function solveHand(cards){
		cards.sort(function(a, b){
			return (b.rank * 10 + b.suit) - (a.rank * 10 + a.suit);
		});
		
		var handResult = straightFlush(cards);
		if(handResult) {
			return {
                score: 90 * 1000 + handResult,
                name: "straight flush" 
            }
		}
		
		handResult = fourOfAKind(cards);
		if(handResult){
			return {
                score: 80 * 1000 + handResult,
                name: "four of a kind"
            }
		}
		
		handResult = fullHouse(cards);
		if(handResult){
			return {
                score: 70 * 1000 + handResult.high * 100 + handResult.low,
                name: "full house" 
            }
		}
		
		handResult = flush(cards);
		if(handResult){
			return {
                score: 60 * 1000 + handResult,
                name: "flush"
            }
		}
		
		handResult = straight(cards);
		if(handResult){
			return {
                score: 50 * 1000 + handResult,
                name: "straight"
            }
		}
		
		handResult = threeOfAKind(cards);
		if(handResult){
			return {
                score: 40 * 1000 + handResult,
                name: "three of a kind" 
            }
		}
		
		handResult = twoPair(cards);
		if(handResult){
			return {
                score: 30 * 1000 + handResult.high * 100 + handResult.low,
                name: "two pair" 
            }
		}
		
		handResult = pair(cards);
		if(handResult){
			return {
                score: 20 * 1000 + handResult,
                name: "pair"
            }
		}
		
		handResult = highCard(cards);
		if(handResult) {
			return {
                score: 10 * 1000 + handResult,
                name: "high card" 
            }
		}
	}
	
	function straightFlush(cards){
		return false;
	}
	
	function xOfAKind(x){
		return function(cards){
			for(var i = 0; i < cards.length; i++){
				var card = cards[i];
				var count = cards.reduce(function(prev, item){
					if(card.rank == item.rank){
						return prev + 1;
					}
                    return prev;
				}, 0);
				if(count >= x){
					return card.rank;
				}
			};
			
			return false;
		}
	}
	
	function fourOfAKind(cards){
		return xOfAKind(4)(cards);
	}
		
	function xOfAKindYofAKind(x, y){
	
		return function(cards){
			var xOfAKindResultRank = xOfAKind(x)(cards);
			if(xOfAKindResultRank){
				var cardsForLowCheck = cards.filter(function(card){
					return card.rank != xOfAKindResultRank.high;
				});
				var yOfAKindResultRank = xOfAKind(y)(cardsForLowCheck);
				if(yOfAKindResultRank) {
					return { high: xOfAKindResultRank, low: yOfAKindResultRank }
				}
			}
			return 0;
		}	
	}
	
	function fullHouse(cards){
		return xOfAKindYofAKind(3, 2)(cards);
	}
	
	function flush(cards){		
		var flushTrack = {}
		for(var i = 0; i < cards.length; i++){
			var card = cards[i];		
			if(flushTrack[card.suit]){
				continue;
			}
			
			var count = cards.reduce(function(prev, item){
				if(card.suit == item.suit){
					return prev + 1;
				}
                return prev;
			}, 0);
			
			if(count >= 5){
				return card.rank;
			}
			flushTrack[card.suit] = count;
		};	
		
		return false;
	}
	
	function straight(cards){
		var prevRank = 0;
		var count = 1;		
		for(var i = 0; i < cards.length; i++){
			var card = cards[i];
			if(card.rank == prevRank - 1){
				count++;				
			}
			else if(card.rank != prevRank){
				count = 1;
			}	
			
			if(count == 5){
				return card.rank + 4;				
			}			
			if(i > count + 1){
				return 0;
			}
			prevRank = card.rank;
		};
		
		return false;
	}
	
	function threeOfAKind(cards){
		return xOfAKind(3)(cards);
	}
	
	function twoPair(cards){
		return xOfAKindYofAKind(3, 2)(cards);
	}
	
	function pair(cards){
		return xOfAKind(2)(cards);
	}
	
	function highCard(cards){	
		return cards[0].rank;
	}
	
	return {
		solveHand: solveHand,
		determineWinner: determineWinners,
        getResults: getResults
	}
})();