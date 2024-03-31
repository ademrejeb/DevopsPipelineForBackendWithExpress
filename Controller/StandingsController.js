const Standing = require('../models/Standings');
const Tournament = require('../models/Tournament');
const ResultController=require('../Controller/ResultController')
const Match = require('../models/Match');
const createInitialStandings = async (req,res) => {
  try {
    tournamentId  =req.params.id
    const tournament = await Tournament.findById(tournamentId).populate('teams').exec();

    // Extract teams from the tournament
    const teams = tournament.teams;

    // Initialize standings data with zero matches played
    const initialStandings = teams.map((team) => ({
      team: team._id,
      matchesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
    }));

    // Sort the initial standings array alphabetically based on team names
    initialStandings.sort((a, b) => {
        const nameA = (a.team && a.team.name) || '';
        const nameB = (b.team && b.team.name) || '';
        return nameA.localeCompare(nameB);
      });

    // Create and save the initial standings to the database
    const createdStandings = await Standing.create({ tournament: tournamentId, standings: initialStandings });

    console.log('Initial standings created successfully:', createdStandings);

    return createdStandings; 

    
  } catch (error) {
    console.error('Error creating initial standings:', error);
  }
};




const getStandingsByTournamentId = async (req, res) => {
  const tournamentId = req.params.id; 
  try {
    const standings = await Standing.findOne({ tournament: tournamentId });
    
    if (!standings) {
      return res.status(404).json({ error: 'Standings not found for the specified tournament ID' });
    }
    res.json(standings);
    console.log("work")
  } catch (error) {
    console.error('Error fetching standings by tournament ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const getStandingsById = async (req, res) => {
    const SID = req.params.id; 
    try {
      const standings = await Standing.findById( SID );
      console.log(standings)
      if (!standings) {
        return res.status(404).json({ error: 'Standings not found for the specified tournament ID' });
      }
      res.json(standings);
      console.log("work")
    } catch (error) {
      console.error('Error fetching standings by tournament ID:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  

  const updateStanding = async (req, res) => {
    try {
        const tournamentId = req.params.id;
        const matchId = req.params.matchId;
        const tournament = await Tournament.findById(tournamentId).populate('teams').exec();
        const result = await ResultController.getResultByMatch(matchId);
        const winner = await ResultController.getMatchWinner(matchId);

        if (!tournament || !result || winner === null) {
            return res.status(404).json({ error: 'Invalid tournament or match result' });
        }

        const match = await Match.findById(matchId);
        const team1 = match.team1;
        const team2 = match.team2;

        const standings = await Standing.findOne({ tournament: tournamentId });
        if (!standings) {
            return res.status(404).json({ error: 'Standings not found for the tournament' });
        }

        const teamStandings = standings.standings;


        const team1Standing = teamStandings.find(team => team.team.equals(team1));
        const team2Standing = teamStandings.find(team => team.team.equals(team2));

     
        if (winner) {
            if (winner === team1) {
       
                team1Standing.wins += 1;
                team1Standing.points += 3;
                team2Standing.losses += 1;
            } else {
            
                team2Standing.wins += 1;
                team2Standing.points += 3;
                team1Standing.losses += 1;
            }
        } else {
          
            team1Standing.draws += 1;
            team1Standing.points += 1;

            team2Standing.draws += 1;
            team2Standing.points += 1;
        }

        
        await standings.save();

        res.status(200).json({ message: 'Standings updated successfully' });
    } catch (error) {
        console.error('Error updating standings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};









module.exports = { createInitialStandings ,getStandingsByTournamentId,
    getStandingsById,
    updateStanding
};
