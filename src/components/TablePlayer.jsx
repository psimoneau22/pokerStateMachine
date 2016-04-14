import React from "react"
import { connect } from "react-redux"
import { addPlayerToTable } from "../actions"

export default class TablePlayer extends React.Component {
    constructor(props){
        super(props)
    }   
    render(){
        let {playerId} = this.props;
        return  <div>Player: {playerId}</div>                   
    }
}

