var Deck = (function(){
	
	function shuffle(){
		var result = []
		for(var rank in Rank) {
			for(var suit in Suit) {
				result.push({rank: Rank[rank], suit: Suit[suit]});
			}
		}
		
		for (var i = result.length - 1; i > 0; i--) {
			var j = Math.floor(Math.random() * (i + 1));
			var temp = result[i];
			result[i] = result[j];
			result[j] = temp;
		}
		
		return result;
	}
	
	return {
		shuffle: shuffle
	};
})();