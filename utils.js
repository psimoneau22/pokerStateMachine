var Utils = (function(){
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	}
	function guid() {	  
	  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
	}	
	function getId(prefix) {
	  return prefix + "_" + s4() + s4();
	}

	return {
		getId: getId
	}
})();
	