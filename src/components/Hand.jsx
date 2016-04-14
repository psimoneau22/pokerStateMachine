import React from "react"
import { connect } from "react-redux"
import { addPlayerToTable } from "../actions"
import HandPlayer from "./HandPlayer"
import Card from "./Card"

class Hand extends React.Component {
    constructor(props){
        super(props)
    }   
    render(){
        let { hand, onAddPlayerToTable } = this.props;
        if(!hand){
            return null;
        }
        
        return  <div>
                    <div>Hand: {hand._id}, Status: {hand.status}</div>
                    {hand.cards.map((card, index) => {
                        return <Card key={index} rank={card.rank} suit={card.suit} />
                    })}
                    {hand.players.map((player) => {
                        return <HandPlayer key={player._id} handId={hand._id} playerId={player._id}/>
                    })} 
                </div>
    }
}

function mapStateToProps(state, ownProps){
    return {
        hand: state.hands[ownProps.handId]
    }
}

function mapDispatchToProps(dispatch, ownProps){
    return {
        
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Hand)

