
function findPlayerById(hand, id){
    return hand.players.find(function(player){
        return player._id == id;
    });
}

function getResults(hand) {
    
    var rankResults = determineWinners(hand);
    var pot = hand.players.reduce(function(total, player){ return total + player.bet}, 0);
    var result = {};
    
    // loop through each winning group, players are grouped by hand rank
    // until the entire pot is dispersed
    for(group of rankResults){
        
        // sort the winners for this group by thier pot potential
        // we will disperse least pot potential first, then repeat 
        // until the pot is dispersed
        var sorted = group.sort(function(a, b){
            var bPotential = findPlayerById(hand, b.playerId).potential;
            var aPotential = findPlayerById(hand, a.playerId).potential;
            return bPotential - aPotential;
        }).map(function(item){ 
            return Object.assign({}, item, { potential: findPlayerById(hand, item.playerId).potential}) 
        });
        
        // loop through each player in this group (for ties), and disperse their pot
        // potential divided by the number of players in the tie/group, 
        // each player in the may have different pot potentials            
        while(sorted.length > 0){
            var amountToDisperseForTie = sorted[0].potential;
            var sharedPot = Math.floor(amountToDisperseForTie / sorted.length);
            
            // fractions that cannot be dispersed are discarded                
            pot -= amountToDisperseForTie;                
            
            // disperse
            sorted.forEach(function(handResult){
                handResult.potential -= amountToDisperseForTie;
                
                if(!result[handResult.playerId]){
                    result[handResult.playerId] = Object.assign({}, handResult, {winnings: 0});
                }
                
                result[handResult.playerId].winnings += sharedPot;
            });
            
            // remove players who have had their pot potential dispersed
            // and move on to other players who had higher pot potentials
            // in the tie group
            sorted = sorted.filter(function(handResult){
                return handResult.potential > 0;
            });
        }
        
        // stop looking at winners after everything is dispersed
        if(pot == 0){
            break;
        }
    }        
    
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
//  - deal with ties (kickers, second kickers, etc), need to handle weighting out to 5 cards
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
                return card.rank != xOfAKindResultRank;
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
    return xOfAKindYofAKind(2, 2)(cards);
}

function pair(cards){
    return xOfAKind(2)(cards);
}

function highCard(cards){	
    return cards[0].rank;
}

export default {
    solveHand: solveHand,
    determineWinner: determineWinners,
    getResults: getResults
}

