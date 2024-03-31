//je change le nom de l'entité ici et partout
const Scoreboard = require('../models/Scoreboard')

async function add (req,res){
    console.log(req.body)
    try{
    const scoreboard= new Scoreboard(req.body)
    await scoreboard.save();
    res.status(200).send("Add");
    } catch (err){
        res.status(400).json({error:err})
    }
}

async function getall (req,res){
    try{
        const data = await Scoreboard.find()
        res.status(200).send(data)

    }catch(err){
        res.status(400).json({error:err});


    }

}

async function getbyid (req,res){
    try{
        const data = await Scoreboard.findById(req.params.id)
        res.status(200).send(data)
    }catch(err){
        res.status(400).json({error:err});
    }

}

async function getbyname (req,res){
    try{
        let name=req.params.nameClass
        //toujours avec {} pour connaitre les parametres seulement l id le connait
        const data = await Scoreboard.findOne({name});
        res.status(200).send(data)
    }catch(err){
        res.status(400).json({error:err});


    }

}


async function update (req,res){
    try{
        await Scoreboard.findByIdAndUpdate(req.params.id,req.body)
        res.status(200).send('updated')

    }catch(err){
        res.status(400).json({error:err});


    }

}

async function deleteScoreboard (req,res){
    try{
        await Scoreboard.findByIdAndDelete(req.params.id)
        res.status(200).send('deleted')

    }catch(err){
        res.status(400).json({error:err});


    }

}

module.exports={add,getall,getbyid,getbyname,update,deleteScoreboard}