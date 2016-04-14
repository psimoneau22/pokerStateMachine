import React from "react"
import { connect } from "react-redux"
import { addTable, addPlayer } from "../actions"
import Table from "./Table"
import Player from "./Player"

class App extends React.Component {
    constructor(props){
        super(props)
    }   
    render(){
        let { tables, players } = this.props
        return  <div>
                    {Object.keys(tables).map((tableId) => {
                        return <Table key={tableId} tableId={tableId} />
                    })}
                    {Object.keys(players).map((playerId) => {
                        return <Player key={playerId} playerId={playerId} />
                    })}
                    <button onClick={this.props.onAddTable}>Add Table</button>
                    <button onClick={this.props.onAddPlayer}>Add Player</button>
                </div>
    }
}

function mapStateToProps(state, ownProps){
    return {
        tables: state.tables,
        players: state.players
    }
}

function mapDispatchToProps(dispatch, ownProps){
    return {
        onAddTable: () => {
            dispatch(addTable())
        },
        onAddPlayer: () => {
            dispatch(addPlayer())
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)