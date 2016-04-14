import update from "react-addons-update"
import Utils from "../utils/utils"

export default function tables(state = {}, action){
    switch(action.type){
        case "addTable":
            var id = Utils.getId("tbl");
            var table = {
                _id: id,
                handId: null,
                status: "open",
                blind: 10,
                dealer: 0,					
                players: []					
            }
            return update(state, { [id]: { $set: table } });
        case "addPlayerToTable":
            return update(state, {
                [action.payload.tableId]: {
                    players: { $push: [action.payload.playerId] }
                }
            })
            
            //players({type: "joinTable", payload: { tableId: table._id, playerId: action.payload.playerId }});
            break;
        case "removePlayerFromTable":
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