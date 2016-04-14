import { combineReducers } from "redux"
import tables from "./tables"
import players from "./players"
import hands from "./hands"
import rounds from "./rounds"
import selections from "./selections"

const app = combineReducers({
    tables,
    players,
    hands,
    rounds,
    selections
})
export default app