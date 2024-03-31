const express = require('express');
const router = express.Router();
const Lineup = require('../models/Lineup'); // Assuming you have a Lineup model
const Match = require('../models/Match'); // Assuming you have a Lineup model

// POST request to save lineup data
async function add(req, res)  {

    try{
        const lineup= new Lineup(req.body)
        lineup.team=req.body.team ;
        lineup.players=req.body.players;
        const savedLineup = await lineup.save();
        /* console.log(savedLineup) */
        res.status(201).json({ success: true, lineup: savedLineup });
        } catch (err){
            console.log(err)
        }
    
}


// Fetch lineup by team ID
async function getLineup(req, res) {
    const teamId = req.params.teamId;

    try {
        // Assuming Lineup is the model for lineup data
        const lineup = await Lineup.findOne({ team: teamId });
        if(lineup){
            res.status(200).json({ success: true, lineup });
        }else{
            res.status(400).json({ success: false, lineup });
        }
        
    } catch (error) {
        console.error('Error fetching lineup:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch lineup' });
    }
}

// Update lineup by team ID
async function updateLineup(req, res) {
    const teamId = req.params.teamId;
    const lineupData = req.body;

    try {
        // Assuming Lineup is the model for lineup data
        const updatedLineup = await Lineup.findOneAndUpdate({ team: teamId }, lineupData, { new: true });
        res.status(200).json({ success: true, lineup: updatedLineup });
    } catch (error) {
        console.error('Error updating lineup:', error);
        res.status(500).json({ success: false, error: 'Failed to update lineup' });
    }
}

async function getTeamsByMatch(req, res) {
    const matchId = req.params.matchId;

    try {
        const match = await Match.findById(matchId);

        if (!match) {
            return res.status(404).json({ success: false, error: 'Match not found' });
        }

        const team1Id = match.team1;
        const team2Id = match.team2;

        const team1Lineup = await Lineup.findOne({ team: team1Id });
        const team2Lineup = await Lineup.findOne({ team: team2Id });

        res.status(200).json({  team1Lineup, team2Lineup });
    } catch (error) {
        console.error('Error fetching teams by match:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch teams by match' });
    }
}

module.exports ={add,getLineup,updateLineup,getTeamsByMatch};
