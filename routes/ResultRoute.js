const express=require("express")
const router=express.Router()
const Match=require('../models/Match');
const Result=require('../models/Result');
const Team=require('../models/Team')



// Add Team endpoint
router.post('/team', async (req, res) => {
  try {
    const { name } = req.body;
    const team = new Team({ name });
    await team.save();
    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Add Match endpoint
router.post('/matches', async (req, res) => {
  try {
    const { team1Id, team2Id } = req.body;
    const match = new Match({ team1: team1Id, team2: team2Id });
    await match.save();
    res.status(201).json(match);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Add Result endpoint
router.post('/results', async (req, res) => {
  try {
    const { matchId } = req.body;

    // Check if the match exists
    const match = await Match.findById(matchId);


    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Create a new result for the match
    const result = new Result({ match: matchId, team1Goals:0, team2Goals:0, team1Red:0, team2Red:0,team1Yellow:0,team2Yellow:0,team1Corners:0,team2Corners:0,team1Offsides:0,team2Offsides:0 });

    // result.team1Goals=0;
    // result.team2Goals=0;

    await result.save();

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Route to get the result by match ID
router.get('/result/:matchId', async (req, res) => {
  const { matchId } = req.params;

  try {
    // Find the result by match ID
    const result = await Result.findOne({ match: matchId }).populate('match');

    if (!result) {
      return res.status(404).json({ message: 'Result not found for the given match ID' });
    }

    // Send the result as JSON response
    res.json(result);
  } catch (error) {
    console.error('Error fetching result:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Route to get the two teams playing in the match by match ID
router.get('/teams/:matchId', async (req, res) => {
  const { matchId } = req.params;

  try {
    // Find the match by match ID
    const team1 = await Match.findById(matchId).populate('team1');
    const team2 = await Match.findById(matchId).populate('team2');

    if (!team1 && !team2) {
      return res.status(404).json({ message: 'Match not found for the given match ID' });
    }

    // Extract the team information from the match
  

    // Send the teams as JSON response
    res.json({team1,team2});
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;



