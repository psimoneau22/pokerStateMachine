import Utils from "../utils/utils"
import update from "react-addons-update"

export default function players(state = {}, action){
    switch(action.type){
        case "addPlayer":	
            var id = Utils.getId("plr");
            var player = {
                _id: id,
                status: "lobby",
                coins: 5000,
                currentTableId: null                    
            }
            return update(state, { [id]: { $set: player } });
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
        case "transferTo":					
            var player = state.players[action.payload.playerId];                
            player.coins += action.payload.amount;
            break;
        case "transferFrom":					
            var player = state.players[action.payload.playerId];
            if(player.coins >= action.payload.amount){
                player.coins -= action.payload.amount;
                return action.payload.amount;  
            }
            break;
        case "transferAll":					
            var player = state.players[action.payload.playerId];
            var coins = player.coins;
            player.coins = 0;
            return coins;                
        default :			
            return state;
    }
}