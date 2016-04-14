import React from "react"
import { connect } from "react-redux"
import { addPlayerToTable } from "../actions"

export default class Card extends React.Component {
    constructor(props){
        super(props)
    }   
    render(){
        let {rank, suit} = this.props;
        return  <div>Rank: {rank}, Suit: {suit}</div>                   
    }
}

