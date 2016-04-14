
function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}
function guid() {	  
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}	
function getId(prefix) {
    return prefix + "_" + s4() + s4();
}

function nextWrap(arr, start, condition){
    var count = 0;
    
    do {
        var current = start >= arr.length - 1 ? 0 : start + 1;            
        if(!condition || condition(arr[current])){
            return arr[current];
        }
        count++;
        current++;
    }
    while(count < arr.length);
    
    return null;
}

export default {
    getId: getId,
    nextWrap: nextWrap
}

	