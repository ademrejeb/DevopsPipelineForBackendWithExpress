
const Tournament = require('../models/Tournament');
const Team = require('../models/Team');
const Match = require('../models/Match');
const User = require("../models/User");
const MatchController=require('../Controller/MatchController');
const fs = require('fs');
const path = require('path');
const templateMail = require('../config/templateMail.js');
const mailer = require("../config/nodemailer");
const Standing = require('../models/Standings');
const ResultController=require('../Controller/ResultController');
const Result = require('../models/Result.js');
const StadiumModel = require('../models/Stadium.js')

async function add(req, res) {
    
    const user = req.user;
    try {
        const tournamentData = { ...req.body, user: user.id };


        const base64Image = req.body.logo.split(';base64,').pop();
        const filename = 'tournament_' + Date.now() + '.png'; 
        const filePath = path.join(__dirname, '..', 'uploads', 'tournament', filename); 
        fs.writeFileSync(filePath, base64Image, { encoding: 'base64' });

        tournamentData.logo = 'http://localhost:3000/uploads/tournament/' + filename;

        const tournament = new Tournament(tournamentData);
        await tournament.save();
        res.status(201).json({ tournamentId: tournament._id });
    } catch (err) {
        res.status(400).json({ error: err });
        console.log(err.message);
    }
}

async function getall (req,res){
    try{
        const data = await Tournament.find()
        res.status(200).send(data)

    }catch(err){
        res.status(400).json({error:err});


    }

}

async function getbyid (req,res){
    try{
        const data = await Tournament.findById(req.params.id)
        res.status(200).send(data)
    }catch(err){
        res.status(400).json({error:err});
    }

}

async function getbyname (req,res){
    try{
        let name=req.params.nameClass
        const data = await Tournament.findOne({name});
        res.status(200).send(data)
    }catch(err){
        res.status(400).json({error:err});
    }
}


async function update (req,res){
    try{
        await Tournament.findByIdAndUpdate(req.params.id,req.body)
        res.status(200).send('updated')

    }catch(err){
        res.status(400).json({error:err});


    }

}

async function deleteTournament (req,res){
    try{
        await Tournament.findByIdAndDelete(req.params.id)
        res.status(200).send('deleted')

    }catch(err){
        res.status(400).json({error:err});


    }

}

async function generateRoundRobinSchedule(req, res) {
    try {
        const tournament = await Tournament.findById(req.params.id).populate('teams');
        if (!tournament) {
            throw new Error("Tournament not found");
        }

        const teams = tournament.teams;
        const numTeams = teams.length;


        if (numTeams % 2 !== 0) {
            teams.push(new Team({ name: "Dummy Team" }));
        }

        const numRounds = numTeams - 1;
        const halfNumTeams = numTeams / 2;
        const schedule = [];

        for (let round = 1; round <= numRounds; round++) {
            const roundSchedule = [];
            for (let i = 0; i < halfNumTeams; i++) {
                const match = new Match({
                    team1: teams[i],
                    team2: teams[numTeams - 1 - i],
                    round: round,
                    tournament: req.params.id
                });
                roundSchedule.push(match);
                await match.save();
            }
            schedule.push(roundSchedule);


            teams.splice(1, 0, teams.pop());
        }

        await Tournament.findByIdAndUpdate(
            req.params.id,
            { matches: schedule },
            { new: true }
        );

        console.log(schedule);
    } catch (error) {
        throw error;
    }
}

async function generateDoubleLegSchedule(req, res) {
    try {
        const tournament = await Tournament.findById(req.params.id).populate('teams');
        if (!tournament) {
            throw new Error("Tournament not found");
        }

        const teams = tournament.teams;
        const numTeams = teams.length;


        shuffleArray(teams);


        if (numTeams % 2 !== 0) {
            teams.push(new Team({ name: "Dummy Team" }));
        }

        const numRounds = numTeams - 1;
        const halfNumTeams = numTeams / 2;
        const schedule = [];

        for (let leg = 1; leg <= 2; leg++) { 
            for (let round = 1; round <= numRounds; round++) {
                const roundSchedule = [];
                for (let i = 0; i < halfNumTeams; i++) {
                    let team1, team2;
                    if (leg === 1) {
                        team1 = teams[i];
                        team2 = teams[numTeams - 1 - i];
                    } else { 
                        team1 = teams[numTeams - 1 - i];
                        team2 = teams[i];
                    }
                    const match = new Match({
                        team1,
                        team2,
                        round,
                        leg,
                        tournament: req.params.id
                    });
                    roundSchedule.push(match);
                    await match.save();
                }
                schedule.push(roundSchedule);

                
                teams.splice(1, 0, teams.pop());
            }
        }

    
        await Tournament.findByIdAndUpdate(
            req.params.id,
            { matches: schedule },
            { new: true }
        );

        console.log(schedule);
    } catch (error) {
        throw error;
    }
}



async function addTeams(req, res) {
    try {
        
        const tournamentId = req.params.id;
        const teamsToAdd = req.body.teams;


        const tournament = await Tournament.findById(tournamentId);

        if (!tournament) {
            return res.status(404).json({ error: "Tournament not found" });
        }

        tournament.teams.push(...teamsToAdd);

      
        const updatedTournament = await tournament.save();

        res.status(200).json({ message: "Teams added to tournament successfully", tournament: updatedTournament });
    } catch (error) {
        console.error("Error adding teams:", error);
        res.status(500).json({ error: "Failed to add teams" });
    }
}

async function generateLeagueMatchFixtures (req,res)  {
    try {
        const tournament = await Tournament.findById(req.params.id).populate('teams');


        if ( 'League'===tournament.TournamentType ) {
          
            const teams = tournament.teams;


            const fixtures = [];
            for (let i = 0; i < teams.length; i++) {
                for (let j = i + 1; j < teams.length; j++) {
                    const match = new Match({
                        tournament: req.params.id,
                        homeTeam: Team.findById(teams[i]),
                        awayTeam: teams.findById(teams[j])
                    });
                    await MatchController.add(match)
                    await match.save();
                    fixtures.push(match);
                }
            }

            return fixtures;
        } else {
            throw new Error('Tournament is not of type League');
        }
    } catch (error) {
        console.error('Error generating match fixtures:', error);
        throw error;
    }
};

async function getFixtures(req, res) {
    const tournamentId = req.params.id;

    try {
    
        const tournament = await Tournament.findById(tournamentId).populate('matches');

        if (!tournament) {
            return res.status(404).json({ error: 'Tournament not found' });
        }

        const fixtures = tournament.matches;
console.log(fixtures)
        res.status(200).json({ fixtures });
    } catch (error) {
        console.error('Error fetching fixtures:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


async function getfixturesbyDay(req, res) {
    const tournamentId = req.params.id;
    const day = req.params.day;

    try {
        const tournament = await Tournament.findById(tournamentId).populate('matches');

        if (!tournament) {
            return res.status(404).json({ error: 'Tournament not found' });
        }

        const filteredFixtures = [];

        for (const dayFixtures of tournament.matches) {
            for (const fixtureId of dayFixtures) {
                const match = await Match.findById(fixtureId);
                if (match && match.startDay == day) {
                    filteredFixtures.push(match);
                }
            }
        }

        res.status(200).json({ fixtures: filteredFixtures });
    } catch (error) {
        console.error('Error fetching fixtures:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

async function getTournamentsByUserId(req, res) {
    const userId = req.user.id;
    

    try {

        const tournaments = await Tournament.find({ user: userId });

        res.status(200).json({ tournaments });
    } catch (error) {
        console.error('Error fetching tournaments by user ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const startTournament = async (req, res) => {
    const  tournamentId  = req.params.id;
    try {
  
        const tournament = await Tournament.findById(tournamentId);

        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        tournament.TournamentStatus = 'OnGoing';
        await tournament.save();

        return res.status(200).json({ message: 'Tournament status updated to OnGoing' });
    } catch (error) {
        console.error('Error starting tournament:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};




const KnockoutTournamentBuild = async (req, res) => {
    try {
        const tournamentId = req.params.id;
        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            throw new Error('Tournament not found');
        }
        if (tournament.TournamentType !== 'Knockout') {
            throw new Error('Tournament is not of type Knockout');
        }

        const teams = tournament.teams;

        if (teams.length < 2 || !Number.isInteger(Math.log2(teams.length))) {
            throw new Error('Number of teams must be a power of 2 and at least 2');
        }

        shuffleArray(teams);

        const fixtures = [];

        const numMatches = teams.length / 2;
        for (let i = 0; i < numMatches; i++) {
             const match = new Match({
                team1: teams [i * 2],
                team2:  teams[i * 2 + 1],
                tournament: tournamentId
             });
             await match.save();
            fixtures.push(match);
        }

        const initialRound = {
            title: 'Round 1',
            fixtures: fixtures,
        };

        const rounds = [initialRound];

        const numRounds = Math.log2(teams.length);

        for (let i = 2; i <= numRounds; i++) {
            const numMatches = teams.length / Math.pow(2, i);
            const fixtures = [];
        
            for (let j = 0; j < numMatches; j++) {
                const match = new Match({
                    tournament: tournamentId,
                    team1 : null ,
                    team2 : null,
                });
                await MatchController.saveMatch(match);
                console.log("m atch ",match);
                  fixtures.push(match);
                  console.log("this the match id " , match._id);
                  console.log("fixtures saved ",fixtures)
               
            }
        
            const round = { 
                title: `Round ${i}`, 
                fixtures: fixtures
            };
        console.log("round 2 " , round)
            rounds.push(round);
        }
        

        await Tournament.findByIdAndUpdate(
            req.params.id,
            { rounds: rounds },
            { new: true }
        );
        res.status(200).json({ rounds });
    } catch (error) {
        console.error('Error creating knockout fixtures:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const getTournamentRoundsById = async (req, res) => {
    try {
        // Fetch tournament details from the database
        const tournamentId = req.params.id;
        const tournament = await Tournament.findById(tournamentId);
        
        if (!tournament) {
            return res.status(404).json({ error: 'Tournament not found' });
        }

        // Extract rounds from the tournament
        const rounds = tournament.rounds;

        // Return rounds data
        res.status(200).json({ rounds });
    } catch (error) {
        console.error('Error fetching tournament rounds:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const generateInitialRoundFixtures = (teams) => {
    shuffleArray(teams);
    
    const fixtures = [];

    const numMatches = teams.length / 2;


    for (let i = 0; i < numMatches; i++) {
        fixtures.push({ homeTeam: teams[i * 2], awayTeam: teams[i * 2 + 1] });
    }

    return { title: 'Round 1', fixtures };
};


const generateKnockoutFixtures = (teams) => {
    shuffleArray(teams);
    
    const fixtures = [];

    const numMatches = teams.length / 2;

    for (let i = 0; i < numMatches; i++) {
         const match = new Match({
            team1: teams [i*2],
            team2:  teams[i * 2 + 1]
         });

        fixtures.push({ homeTeam: teams[i * 2], awayTeam: teams[i * 2 + 1] });
    }

    const match = new Match({
        team1: teams[i],
        team2: teams[numTeams - 1 - i],
        round: round,
        tournament: req.params.id
    });

    return fixtures;

   
};



async function createChampionshipGroupsAndMatches(req, res) {
    try {
        
        const tournamentId = req.params.id;
        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            throw new Error('Tournament not found');
        }
        if ('Championship' === tournament.TournamentType) {
            const teams = tournament.teams;

            if (teams.length < 4 || teams.length % 4 !== 0) {
                throw new Error('Number of teams must be divisible by 4 and at least 4');
            }

            shuffleArray(teams);

            const numTeams = teams.length;
            const numGroups = Math.ceil(numTeams / 4);
            const teamsPerGroup = Math.floor(numTeams / numGroups);

         
            const groups = [];
            for (let i = 0; i < numGroups; i++) {
                const groupTeams = teams.slice(i * teamsPerGroup, (i + 1) * teamsPerGroup);
                groups.push(groupTeams);
            }

            
            const matchesPromises = groups.map(group => {
                return generateRoundRobinGroupPhaseMatches(group, tournamentId);
            });

            const matches = await Promise.all(matchesPromises);

            const groupsWithStandingsPromises = groups.map(async (group) => {
                const GroupStandingId = await createInitialStandingsForGroups(group, tournamentId);
                return GroupStandingId;
            });
            
            const groupsWithStandings = await Promise.all(groupsWithStandingsPromises);

            
            const groupsWithMatches = groups.map((group, index) => {
                return {
                    teams: group,
                    matches: matches[index],
                    standings : groupsWithStandings[index]
                };
            });

            console.log({ groupsWithMatches });

            
            await Tournament.findByIdAndUpdate(
                tournamentId,
                { groupsWithMatches: groupsWithMatches },
                { new: true }
            );
        }
    } catch (error) {
        console.error('Error creating championship tournament:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const createInitialStandingsForGroups = async (group, tournamentId) => {
    try {
        

        const initialStandings = group.map((team) => ({
            team: team._id,
            matchesPlayed: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            points: 0,
        }));

        initialStandings.sort((a, b) => {
            const nameA = (a.team && a.team.name) || '';
            const nameB = (b.team && b.team.name) || '';
            return nameA.localeCompare(nameB);
        });

        const createdStandings = await Standing.create({ tournament: tournamentId, standings: initialStandings });
        const standingsForGroup = createdStandings._id;

        return standingsForGroup;
    } catch (error) {
        console.error('Error creating initial standings:', error);
        throw error; 
    }
};





const generateRoundRobinGroupPhaseMatches = async (teams, tournamentId) => {
    const numTeams = teams.length;
    const numRounds = numTeams - 1;
    const halfNumTeams = numTeams / 2;
    const schedule = [];
    const matchIds = [];

    for (let round = 1; round <= numRounds; round++) {
        const roundSchedule = [];
        for (let i = 0; i < halfNumTeams; i++) {
            const match = new Match({
                team1: teams[i],
                team2: teams[numTeams - 1 - i],
                round: round,
                tournament: tournamentId
            });
            await match.save();
            matchIds.push(match._id); 
            roundSchedule.push(match);

        }
        schedule.push(roundSchedule);

      
        teams.splice(1, 0, teams.pop());
    }
    return matchIds; 
};


async function addRateToTournament(req, res) {
    try {
        const tournamentId = req.params.id;
        const { rate } = req.body;
        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            return res.status(404).json({ error: 'Tournament not found' });
        }
        if (rate < 1 || rate > 5) {
            return res.status(400).json({ error: 'Invalid rate. Rate must be between 1 and 5' });
        }
        
        const key = rate === 1 ? '1 star' : `${rate} stars`;
        const ratingTable = tournament.rating ;
        ratingTable[key] = ratingTable[key] + 1 ; 
        await Tournament.findByIdAndUpdate(
            tournamentId,
            { rating: ratingTable },
            { new: true }
        );

        
        res.status(200).json({ message: 'Rate added successfully' });
    } catch (error) {
        console.error('Error adding rate to tournament:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



async function FollowTournament(req,res) {
    

try {
    const tournamentId = req.params.id; 
    const user = req.user;
    const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            return res.status(404).json({ error: 'Tournament not found' });
        }
const organizer = await User.findById(tournament.user)
    const newFollowers = tournament.followers ; 
    newFollowers.push(user._id) ; 
    await Tournament.findByIdAndUpdate(
        tournamentId,
        { followers: newFollowers },
        { new: true }
    );
    await mailer.sendMail({
        from: "rejebadem99@gmail.com" ,
        to: user.email , 
        subject: "follow",
        
        
    });
    res.status(200).json({ message: 'follower added successfully' });
} catch (error) {
    console.error('Error adding follower to tournament:', error);
        res.status(500).json({ error: 'Internal server error' });
}



}


async function UnfollowTournament(req, res) {
    try {
        const tournamentId = req.params.id;
        const user = req.user;

        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            return res.status(404).json({ error: 'Tournament not found' });
        }

        if (!tournament.followers.includes(user._id)) {
            return res.status(400).json({ error: 'User is not following this tournament' });
        }

        const newFollowers = tournament.followers.filter(userId => userId.toString() !== user._id.toString());

        await Tournament.findByIdAndUpdate(
            tournamentId,
            { followers: newFollowers },
            { new: true }
        );

        res.status(200).json({ message: 'User unfollowed the tournament successfully' });
    } catch (error) {
        console.error('Error unfollowing tournament:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

//////gahhdfjqsdfq
async function KnockoutUpdateTournamentRounds(req, res) {
    try {
        const tournamentId = req.params.id;
        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            return res.status(404).json({ error: 'Tournament not found' });
        }

        const matchId = req.params.matchId;
        const result = await ResultController.getResultByMatch(matchId);
        if (!result) {
            return res.status(404).json({ error: 'Result not found for the match' });
        }

        let roundIndex = -1;
        let matchIndex = -1;
        let matchFound = false;
        
  
        tournament.rounds.forEach((round, rIndex) => {
            round.fixtures.forEach((fixture, mIndex) => {
                if (fixture._id==matchId) {
                    roundIndex = rIndex;
                    matchIndex = mIndex;
                    matchFound = true;
                }
            });
        });

        if (!matchFound) {
            
            return res.status(404).json({ error: 'Match not found in any round' });
            
        }

        const nextRoundIndex = roundIndex + 1;
       

        const nextRound = tournament.rounds[nextRoundIndex];

        const targetMatchIndex = Math.floor(matchIndex / 2);

        
        const winner = await ResultController.getMatchWinner(matchId);
        if (nextRoundIndex >= tournament.rounds.length) {
            const NewWinnersList = tournament.winners; 
            NewWinnersList.push(winner.winner);
            console.log("team with id" ,winner.winner,"won the tournament");
            await Tournament.findByIdAndUpdate(
                tournamentId,
                { winners: NewWinnersList },
                { new: true }
            );
            return res.status(404).json({ error: 'No next round found' });
        }
        
       
  const TheMatchToBeUpdated = await Match.findById(nextRound.fixtures[targetMatchIndex]._id);
  if (!TheMatchToBeUpdated) {
    return res.status(404).json({ error: 'Match not found for next round fixture' });
}
if (matchIndex % 2 === 0) {
    TheMatchToBeUpdated.team1 = winner.winner;
} else {
    TheMatchToBeUpdated.team2 = winner.winner;
}


   await TheMatchToBeUpdated.save();
        await tournament.save();

        res.status(200).json({ message: 'Next round fixtures updated successfully' });
    } catch (error) {
        console.error('Error updating next round fixtures:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}




async function generateKnockoutChampionshipMatches(req,res) {
    const tournamentId = req.params.id;
    const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            return res.status(404).json({ error: 'Tournament not found' });
        };
    


    const groupsWithMatches = tournament.groupsWithMatches;

   
    const AllgroupWinners = [];


    for (const group of groupsWithMatches) {
        const groupStandingsId = group.standings;
        const winners = await determineGroupWinners(groupStandingsId);
        AllgroupWinners.push(winners[0], winners[1]);
    }

 const teams = AllgroupWinners;

        if (teams.length < 2 || !Number.isInteger(Math.log2(teams.length))) {
            throw new Error('Number of teams must be a power of 2 and at least 2');
        }

        shuffleArray(teams);

        const fixtures = [];

        const numMatches = teams.length / 2;
        for (let i = 0; i < numMatches; i++) {
             const match = new Match({
                team1: teams [i * 2],
                team2:  teams[i * 2 + 1],
                tournament: tournamentId
             });
             await match.save();
            fixtures.push(match);
        }

        const initialRound = {
            title: 'Round 1',
            fixtures: fixtures,
        };

        const rounds = [initialRound];

        const numRounds = Math.log2(teams.length);

        for (let i = 2; i <= numRounds; i++) {
            const numMatches = teams.length / Math.pow(2, i);
            const fixtures = [];
        
            for (let j = 0; j < numMatches; j++) {
                const match = new Match({
                    tournament: tournamentId,
                });
                await MatchController.saveMatch(match);
                console.log("m atch ",match);
                  fixtures.push(match);
                  console.log("this the match id " , match._id);
                  console.log("fixtures saved ",fixtures)
               
            }
        
            const round = { 
                title: `Round ${i}`, 
                fixtures: fixtures
            };
        console.log("round 2 " , round)
            rounds.push(round);
        }
        

        await Tournament.findByIdAndUpdate(
            tournamentId,
            { rounds: rounds },
            { new: true }
        );





};




const determineGroupWinners = async (standingsId) => {
    try {
        
        const groupStanding = await Standing.findById(standingsId).populate('standings').exec();
        if (!groupStanding) {
            throw new Error('Standing not found');
        }

        const groupWinners = {};

        
        
          
            const groupStandings = groupStanding.standings;

        
            const sortedStandings = groupStandings.sort((a, b) => b.points - a.points);

       
            const groupWinner1 = sortedStandings[0].team;
            const groupWinner2 = sortedStandings[1].team;

      
            groupWinners[groupStanding._id] = [groupWinner1, groupWinner2];
        

        return groupWinners;
    } catch (error) {
        console.error('Error determining group winners:', error);
        throw new Error('Failed to determine group winners');
    }
};


async function UpdateGroupStandingAfterMatch(req, res) {
    try {
        const resultId = req.params.id;

        const result = await Result.findById(resultId);
        if (!result) {
            return res.status(404).json({ error: 'Result not found' });
        }

        const matchId = result.match;
        const match = await Match.findById(matchId);
        if (!match) {
            return res.status(404).json({ error: 'Match not found' });
        }

        const tournamentId = match.tournament;
        const tournament = await Tournament.findById(tournamentId)
        if (!tournament) {
            return res.status(404).json({ error: 'Tournament not found' });
        };

        const groupsWithMatches = tournament.groupsWithMatches;

        let groupBelongedTo = null;
        for (const group of groupsWithMatches) {
            const matchesInGroup = group.matches.map(match => match.toString());
            if (matchesInGroup.includes(matchId.toString())) {
                groupBelongedTo = group;
                break;
            }
        }

        if (!groupBelongedTo) {
            return res.status(404).json({ error: 'Group for the match not found' });
        }

        const standingsId = groupBelongedTo.standings; // Retrieve standings from the group
        const standingsToUpdate = await Standing.findById(standingsId).populate('standings').exec();

        const team1 = match.team1;
        const team2 = match.team2;
        const teamStandings = standingsToUpdate.standings;

        const team1Standing = teamStandings.find(team => team.team.equals(team1));
        const team2Standing = teamStandings.find(team => team.team.equals(team2));

        const winner = await ResultController.getMatchWinner(matchId);

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

        await standingsToUpdate.save();

        res.status(200).json({ message: 'Group standings updated successfully' });

    } catch (error) {
        console.error('Error updating group standings after match:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};




const addRefereesAndStadiumsToTournament = async (req, res) => {
    const  tournamentId  = req.params.id;
    const { referees, stadiums } = req.body;
  
    try {
      
      const tournament = await Tournament.findById(tournamentId);
      if (!tournament) {
        return res.status(404).json({ error: 'Tournament not found' });
      }
  

      if (!referees || !stadiums) {
        return res.status(400).json({ error: 'Referees and stadiums are required' });
      }
  
      const validReferees = await Promise.all(
        referees.map(async (refereeId) => {
          const referee = await User.findById(refereeId);
          
          if (!referee) {
            throw new Error(`Referee with ID ${refereeId} not found`);
          }
          return referee;
        })
      );
      tournament.referees.push(...validReferees);
  
 
      const validStadiums = await Promise.all(
        stadiums.map(async (stadiumId) => {
          const stadium = await StadiumModel.findById(stadiumId);
          if (!stadium) {
            throw new Error(`Stadium with ID ${stadiumId} not found`);
          }
          return stadium;
        })
      );
      tournament.Staduims.push(...validStadiums);
  
      
      await tournament.save();
  
      res.status(200).json({ message: 'Referees and stadiums added to the tournament successfully' });
    } catch (error) {
      console.error('Error adding referees and stadiums to the tournament:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };


  const getRefereesAndStadiumsForTournament = async (req, res) => {
    const tournamentId = req.params.id;

    try {

        const tournament = await Tournament.findById(tournamentId);

        if (!tournament) {
            return res.status(404).json({ error: 'Tournament not found' });
        }

    
        const { referees, Staduims } = tournament;

       
        res.status(200).json({ referees, Staduims });
    } catch (error) {
        console.error('Error retrieving referees and stadiums for the tournament:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const getFixturesKnockout = async (req, res) => {
    try {
        // Fetch tournament details from the database
        const tournamentId = req.params.id;
        const tournament = await Tournament.findById(tournamentId);
        
        if (!tournament) {
            return res.status(404).json({ error: 'Tournament not found' });
        }

      
        const fixturesByRound = tournament.rounds.map(round => round.fixtures.map(fixture => fixture._id));

       
        res.status(200).json({ fixturesByRound });
    } catch (error) {
        console.error('Error fetching tournament fixtures:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getMatchesFromGroupsWithMatches = async (req, res) => {
    try {
        
        const tournamentId = req.params.id;
        const tournament = await Tournament.findById(tournamentId);
        
        if (!tournament) {
            return res.status(404).json({ error: 'Tournament not found' });
        }

       const gamesByGroup = tournament.groupsWithMatches.map(group => group.matches);


      
        res.status(200).json({ gamesByGroup });
    } catch (error) {
        console.error('Error fetching matches from groupsWithMatches:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

async function GetGroupsAndStandings(req,res) {
try {
     
    const tournamentId = req.params.id;
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
        return res.status(404).json({ error: 'Tournament not found' });
    }

    const StandingsByGroup = tournament.groupsWithMatches.map(group => group.standings);
    res.status(200).json({ StandingsByGroup });
} catch (error) {
    console.error('Error fetching matches from groupsWithMatches:', error);
        res.status(500).json({ error: 'Internal server error' });
}
};

async function FixturesByDayKnockout  (req, res)  {
        try {
            const tournamentId =req.params.id;
            const day = req.params.day;
    
            
            const tournament = await Tournament.findById(tournamentId);
    
            
            if (!tournament) {
                return res.status(404).json({ error: 'Tournament not found' });
            }
    
            
            const fixturesForDay = [];
    
           
            for (const round of tournament.rounds) {
             
                for (const fixture of round.fixtures) {

                    const match = await Match.findById(fixture);
                   
                    if (match && match.startDay == day) {
                    
                        fixturesForDay.push(match);
                    }
                }
            }
    
   
            res.status(200).json({ fixtures : fixturesForDay });
        } catch (error) {
            console.error('Error fetching fixtures for the day:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
    
    const getMatchesFromGroupsWithMatchesByday = async (req, res) => {
        try {
            const day = req.params.day;
            const tournamentId = req.params.id;
            const tournament = await Tournament.findById(tournamentId);
            
            if (!tournament) {
                return res.status(404).json({ error: 'Tournament not found' });
            }
            const fixturesForDay= [];
    
            const gamesByGroup = tournament.groupsWithMatches.map(group => group.matches).flat();
    for (const game of gamesByGroup){
        const match = await Match.findById(game);
        if (match && match.startDay == day) {
                    
            fixturesForDay.push(match);
        }

    }
    
          
            res.status(200).json({ fixtures : fixturesForDay});
        } catch (error) {
            console.error('Error fetching matches from groupsWithMatches:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };



module.exports={
    add,
    getall,
    getbyid,
    getbyname,
    update,
    deleteTournament,
    generateRoundRobinSchedule,
    addTeams,
    generateLeagueMatchFixtures,
    getFixtures,
    getfixturesbyDay,
    generateDoubleLegSchedule,
    getTournamentsByUserId,
    startTournament,
    KnockoutTournamentBuild,
    getTournamentRoundsById,
    createChampionshipGroupsAndMatches,
    addRateToTournament,
    FollowTournament,
    UnfollowTournament,
    KnockoutUpdateTournamentRounds,
    generateKnockoutChampionshipMatches,
    UpdateGroupStandingAfterMatch,
    addRefereesAndStadiumsToTournament,
    getRefereesAndStadiumsForTournament,
    getFixturesKnockout,
    getMatchesFromGroupsWithMatches,
    GetGroupsAndStandings,
    FixturesByDayKnockout,
    getMatchesFromGroupsWithMatchesByday
}