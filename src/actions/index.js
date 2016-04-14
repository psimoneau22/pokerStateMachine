import update from "react-addons-update"

function createActionCreator(type, ...argNames){
    return function(...args){
        let action = { type }
        action.payload = {}
        argNames.forEach((arg, index) => {
            action.payload[argNames[index]] = args[index]
        })
        return action
    }
}
// tables
export const addTable = createActionCreator("addTable")
export const addPlayerToTable = createActionCreator("addPlayerToTable", "tableId", "playerId");
export const removePlayerFromTable = createActionCreator("removePlayerFromTable", "tableId", "playerId"); 

// players
export const addPlayer = createActionCreator("addPlayer"); 
export const joinTable = createActionCreator("joinTable", "tableId", "playerId"); 
export const leaveTable = createActionCreator("leaveTable", "playerId"); 
export const transferTo = createActionCreator("transferTo", "playerId", "amount"); 
export const transferFrom = createActionCreator("transferFrom", "playerId", "amount"); 
export const transferAll = createActionCreator("transferAll", "playerId"); 


// hands
export const addHand = createActionCreator("addHand", "tableId");
export const deal = createActionCreator("deal", "handId");
export const flop = createActionCreator("flop", "handId");
export const turn = createActionCreator("turn", "handId");
export const river = createActionCreator("river", "handId");
export const addPlayerBet = createActionCreator("addPlayerBet", "playerId", "handId");
export const foldPlayer = createActionCreator("foldPlayer", "playerId", "handId");
export const close = createActionCreator("close", "handId");
export const next = createActionCreator("next", "handId");

// rounds
export const addRound = createActionCreator("addRound", "handId");
export const fold = createActionCreator("fold", "roundId");
export const check = createActionCreator("check", "roundId");
export const call = createActionCreator("call", "roundId");
export const bet = createActionCreator("bet", "roundId", "amount");
export const allIn = createActionCreator("allIn", "roundId");
export const closeRound = createActionCreator("closeRound", "roundId");