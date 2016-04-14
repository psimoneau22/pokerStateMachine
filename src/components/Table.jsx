import React from "react"
import { connect } from "react-redux"
import { addPlayerToTable, addHand } from "../actions"
import Hand from "./Hand"
import TablePlayer from "./TablePlayer"

class Table extends React.Component {
    constructor(props){
        super(props)
    }   
    render(){
        let { table, onAddPlayerToTable, onAddHand } = this.props;
        
        return  <div>
                    <div>Table: {table._id}, Status: {table.status}</div>     
                    {table.players.map((playerId) => {
                        return <TablePlayer key={playerId} tableId={table._id} playerId={playerId} />
                    })}
                    <Hand handId={table.handId} />
                    <button onClick={onAddPlayerToTable}>Add Player</button>
                    <button onClick={onAddHand}>Add Hand</button>
                </div>
    }
}

function mapStateToProps(state, ownProps){
    return {
        table: state.tables[ownProps.tableId],
        selectedPlayer: state.selections.player
    }
}

function mapDispatchToProps(dispatch, ownProps){
    return {
        onAddPlayerToTable: () => {
            dispatch(addPlayerToTable(ownProps.tableId, "needPID"))
        },
        onAddHand: () => {
            dispatch(addHand(ownProps.tableId))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Table)