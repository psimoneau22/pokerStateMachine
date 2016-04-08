var HandSolver = (function(){
	function determineWinner(hand){
		var result = [];
		for(var playerId in hand.players) {
			result.push({ playerId: playerId, score: getHandRank(hand.cards.concat(hand.players[playerId].cards)) });
		}
		result.sort(function(a, b){
			return a.score - b.score;
		});
		return result;
	}
	
	function getHandRank(cards){
		cards.sort(function(a, b){
			return (a.rank * 10 + a.suit) - (b.rank * 10 + a.suit);
		});
		
		var handResult = straightFlush(cards);
		if(handRank){
			return 90 * 1000 + handResult;
		}
		
		handResult = fourOfAKind(cards);
		if(handResult){
			return 80 * 1000 + handResult;
		}
		
		handResult = fullHouse(cards);
		if(handResult){
			return 70 * 1000 + handResult.high * 100 + handResult.low;
		}
		
		handResult = flush(cards);
		if(handResult){
			return 60 * 1000 + handResult;
		}
		
		handResult = straight(cards);
		if(handResult){
			return 50 * 1000 + handResult;
		}
		
		handResult = threeOfAKind(cards);
		if(handResult){
			return 40 * 1000 + handResult;
		}
		
		handResult = twoPair(cards);
		if(handResult){
			return 30 * 1000 + handResult.high * 100 + handResult.low;;
		}
		
		handResult = pair(cards);
		if(handResult){
			return 20 * 1000 + handResult;
		}
		
		handResult = highCard(cards);
		if(handResult){
			return 10 * 1000 + handResult;
		}
	}
	
	function straightFlush(cards){
		var prevCard = {rank: 0, suit: 0};
		var count = 1;		
		for(var i = 0; i < cards.length; i++){
			var card = cards[i];
			if(card.rank == prevCard.rank - 1 && card.suit == prevCard.suit){
				count++;
			}
			else if(card.rank != prevCard.rank && card.suit != prevCard.suit){
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
		
		return 0;
	}
	
	function xOfAKind(x){
		return function(cards){
			for(var i = 0; i < cards.length; i++){
				var card = cards[i];
				var count = cards.reduce(function(prev, item){
					if(card.rank == item.rank){
						return prev + 1;
					}
				}, 1);
				if(count >= x){
					return card.rank;
				}
			};
			
			return 0;
		}
	}
	
	function fourOfAKind(cards){
		return xOfAKind(4)(cards);
	}
		
	function xOfAKindYofAKind(x, y){
	
		return function(cards){
			var highRank = xOfAKind(x)(cards);
			if(highRank){
				var cardsForLowCheck = cards.filter(function(card){
					return card.rank != high.rank;
				});
				var lowRank = xOfAKind(y)(cardsForLowCheck);
				if(lowRank) {
					return { high: highRank, low: lowRank }
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
			}, 1);
			
			if(count >= 5){
				return card.rank;
			}
			flushTrack[card.suit] = count;
		};	
		
		return 0;
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
		
		return 0;
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
		solveHand: getHandRank,
		determineWinner: determineWinner
	}
})();