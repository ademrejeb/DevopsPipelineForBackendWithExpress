
const Result = require('../models/Result')
const Match = require('../models/Match');


async function add (req,res){
    console.log(req.body)
    try{
    const result= new Result(req.body)
    await result.save();
    res.status(200).send("Add");
    } catch (err){
        res.status(400).json({error:err})
    }
}

async function getall (req,res){
    try{
        const data = await Result.find()
        res.status(200).send(data)

    }catch(err){
        res.status(400).json({error:err});


    }

}

async function getbyid (req,res){
    try{
        const data = await Result.findById(req.params.id)
        res.status(200).send(data)
    }catch(err){
        res.status(400).json({error:err});
    }

}

async function getbyname (req,res){
    try{
        let name=req.params.nameClass
        //toujours avec {} pour connaitre les parametres seulement l id le connait
        const data = await Result.findOne({name});
        res.status(200).send(data)
    }catch(err){
        res.status(400).json({error:err});


    }

}


async function update (req,res){
    try{
        await Result.findByIdAndUpdate(req.params.id,req.body)
        res.status(200).send('updated')

    }catch(err){
        res.status(400).json({error:err});


    }

}

async function deleteResult (req,res){
    try{
        await Result.findByIdAndDelete(req.params.id)
        res.status(200).send('deleted')

    }catch(err){
        res.status(400).json({error:err});


    }

}


async function getResultByMatch (matchId){
    try{
  
        const result = await Result.findOne({ match: matchId });
        return result ; 


    }catch(err){
        console.log(err);


    }

}




const getMatchWinner = async (matchId) => {
    try {
        const result = await Result.findOne({ match: matchId });
        if (!result) {
            throw new Error('Result not found for the match');
        }
        const match = await Match.findById(matchId);
        if (!match) {
            throw new Error('Match not found');
        }
        let winner = null;
        if (result.team1Goals > result.team2Goals) {
            winner = match.team1;
        } else if (result.team2Goals > result.team1Goals) {
            winner = match.team2;
        } 
        if (result.team1Goals === result.team2Goals) {
            return { winner: null, draw: [match.team1, match.team2] };
        }

        return { winner: winner };
    } catch (error) {
        console.error('Error getting match winner:', error);
        throw new Error('Internal server error');
    }
};





module.exports={add,getall,getbyid,getbyname,update,deleteResult,
    getResultByMatch,
    getMatchWinner}