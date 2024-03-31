//je change le nom de l'entité ici et partout
const Team = require('../models/Team');
const User = require('../models/User');
const Role = require('../models/User');
const Coach=require('../models/User');

const { getPlayersByIds } = require("../Controller/UserController")
async function add(req, res) {
    //console.log(req.body);
    try {
        const team = new Team();
        console.log("\n testtss ..........."+req.file.filename +"\n")
        team.name = req.body.name;
        team.logo = "http://localhost:3000/uploads/team/"+req.file.filename ;
        team.players =  [];
        //team.coach = req.params.id;
        team.team_manager = req.params.id;
        team.staff = [];
        team.matches = [];

        await team.save(); 

        /* const coach = await Coach.findById(req.params.id)
        coach.currentTeam = team._id;
        await coach.save(); */

        const teamManager = await Coach.findById(req.params.id)
        teamManager.currentTeam = team._id;
        teamManager.teams.push(team._id);
        await teamManager.save();
        
        res.status(200).send("Add");
    } catch (err) {
        res.status(400).json({ error: err });
        console.log(err)
    }
}

async function getall (req,res){
    try{
        const data = await Team.find()
        res.status(200).send(data)

    }catch(err){
        res.status(400).json({error:err});


    }

}

async function getbyid (req,res){
    try{
        const data = await Team.findById(req.params.id)
        res.status(200).send(data)
    }catch(err){
        res.status(400).json({error:err});
    }

}

async function getbyname (req,res){
    try{
        let name=req.params.nameClass
        //toujours avec {} pour connaitre les parametres seulement l id le connait
        const data = await Team.findOne({name});
        res.status(200).send(data)


    }catch(err){
        res.status(400).json({error:err});


    }

}


async function update (req,res){
    try{
        const team = await Team.findByIdAndUpdate(req.params.id,req.body)
        team.logo = req.file.filename;
        await team.save(); 
        res.status(200).send('updated')

    }catch(err){
        res.status(400).json({error:err});


    }

}

async function deleteTeam (req,res){
    try{
        await Team.findByIdAndDelete(req.params.id)
        res.status(200).send('deleted')

    }catch(err){
        res.status(400).json({error:err});


    }

}

async function addPlayerToTeam(req, res) {
    try {
        const coach = await Coach.findById(req.params.id);
//         if (coach && coach.roles === 'COACH') {
 //            // Check if the player already exists in the database
            const existingPlayer = await User.findOne({ email: req.body.email });
            if (existingPlayer) {
                // Check if the existing player is already part of a team
                const existingTeam = await Team.findOne({ players: existingPlayer._id });
                if (existingTeam) {
                    // Remove the player from the existing team
                    existingTeam.players.pull(existingPlayer._id);
                    await existingTeam.save();
                }
                existingPlayer.currentTeam=coach.currentTeam;
                existingPlayer.teams.push(coach.currentTeam)
                await existingPlayer.save();
                const team = await Team.findOne({ team_manager: coach._id });
                team.players.push(existingPlayer._id);
                await team.save();
            } else {
                // Create a new player if they don't exist
                const player = new User(req.body);
                //console.log(player)
                player.roles=[10,11] 
                player.currentTeam=coach.currentTeam
                player.teams.push(coach.currentTeam)
                //console.log(player+"\n"+player.roles)
                await player.save();
                //existingPlayer = player;
                const team = await Team.findOne({ team_manager: coach._id });
                team.players.push(player._id);
                await team.save();
            }

            // Find the team associated with the coach
        //const team = await Team.findOne({ coach: coach._id });

        //console.log("coach._id : "+coach._id+"\nteam :\n"+team)

            // Add the new player's ID to the team's players array
        //team.players.push(player._id);
        
            // Save the updated team to the database
        //await team.save();

        return res.status(200).json({ message: 'Player added to the team successfully' });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
}



async function checkTeam_manager(req, res) {
    try {
        const team = await Team.findOne({ team_manager: req.params.id });
        if (team) {
            //the coach is part of a team
            res.status(200).json({ exists: true });
        } else {
            //the coach dosen't currently have a team 
            res.status(200).json({ exists: false });
        }
    } catch (err) {
        res.status(400).json({ error: err });
    }
}

async function updateXTeam (req,res){
    try{
        const team = await Team.findOne({ coach: req.params.id });
        team.coach= null;
        
        await team.save() ;
        res.status(200).send('coach is resigned from this team!')
    }catch(err){
        res.status(400).json({error:err});
    }
}


async function getTeambyCoach (req,res){
    try {
        const team = await Team.findOne({ coach: req.params.id });
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }
        const playerNames = await getPlayersByIds(team.players);
        const teamWithPlayerNames = { ...team.toObject(), playerNames };
        res.status(200).json(teamWithPlayerNames);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function getTeambyTeamManger (req,res){
    try {
        const team = await Team.findOne({ team_manager: req.params.id });
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }
        const playerNames = await getPlayersByIds(team.players);
        const coachName = await getPlayersByIds(team.coach);
        const teamWithPlayerNames = { ...team.toObject(), playerNames ,coachName };
        res.status(200).json(teamWithPlayerNames);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function addCoachToTeam(req, res) {
     try {
        const Tmanager = await Coach.findById(req.params.id);
            const existingCoach = await User.findOne({ email: req.body.email });
            existingCoach.currentTeam=Tmanager.currentTeam;
            existingCoach.teams.push(Tmanager.currentTeam)
            await existingCoach.save();
                const team = await Team.findOne({ team_manager: Tmanager._id });
                team.coach=existingCoach._id;
                await team.save();
        } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
}
}


async function getTeamRating(req, res) {
    try {
        const teamId = req.params.id;

        // Fetch team data from the database
        const team = await Team.findById(teamId);

        // Perform calculations to determine the team's rating
        let teamRating = 0;
        let sumteamRating = 0;

        // Example: Calculate average player rating
        if (team.players && team.players.length > 0) {
            // Fetch player objects based on their IDs
            const playerPromises = team.players.map(async playerId => {
                const playerResponse = await fetch(`http://localhost:3000/User/getbyid/${playerId}`);
                return playerResponse.json();
            });
        
            // Wait for all player fetch requests to resolve
            const players = await Promise.all(playerPromises);
        
            // Calculate total player rating and average player rating
            const totalPlayerRating = players.reduce((acc, player) => {
                // Check if player.value exists and is a valid number
                const playerValue = parseFloat(player.value);
                if (!isNaN(playerValue)) {
                    // Add the player's value to the accumulator
                    return acc + playerValue;
                } else {
                    // Treat it as 0 if player.value is missing or not a number
                    return acc + 0;
                }
            }, 0);
            
            const averagePlayerRating = totalPlayerRating / players.length;
            // You can adjust the weight of player ratings based on your preference
            teamRating += (averagePlayerRating * 0.2); // Assuming player ratings contribute 50% to the team's rating
            sumteamRating = sumOfDigits(teamRating)/team.players.length;
            sumteamRating = Math.min(sumteamRating, 5);
        }
        

        /* // Example: Add points based on the number of trophies
        if (team.trophies && team.trophies.length > 0) {
            // You can define the points awarded for each type of trophy
            const trophyPoints = {
                'League Title': 10,
                'Cup Win': 5,
                // Add more trophy types and points as needed
            };
            team.trophies.forEach(trophy => {
                teamRating += trophyPoints[trophy.type];
            });
        } */

        // You can include other factors such as team performance, market value of players, etc.

        // Return the team's rating
        console.log(sumteamRating+"....")
        team.rating=sumteamRating ;
        await team.save();
        
        res.status(200).json({ rating: sumteamRating });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

function sumOfDigits(number) {
    // Convert number to string
    const numberString = number.toString();

    // Split the string into an array of characters, convert each character to a number, and sum them up
    const sum = numberString.split('').map(Number).reduce((acc, digit) => acc + digit, 0);

    return sum;
}

module.exports={add,getall,getbyid,getbyname,update,deleteTeam,addPlayerToTeam,checkTeam_manager,updateXTeam,getTeambyCoach,getTeambyTeamManger,addCoachToTeam,getTeamRating}