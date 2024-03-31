const jwt = require('jsonwebtoken')
const User = require('../models/User')


const requireAuth = async (req, res, next) => {
    const { authorization } = req.headers

    if (!authorization) {
        return res.status(401).json({error: 'Authorization token required'})
    }
    const token = authorization.split(' ')[1]
    try {
        const { user } = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        req.user = await User.findOne({email : user.email})
        next()

    } catch (error) {
        res.status(401).json({error: error.message})
    }
}

const requireAdmin = async (req,res,next) => {
    const { authorization } = req.headers

    if (!authorization) {
        res.status(401).json({error: "Authorization is required!"})
   }

    const token = authorization.split(' ')[1]
    try{
        let authorized=false;
        const  {user}  = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        // const user = await User.findById(u._id);
        user.roles.forEach(role=>{
            if(role === 30){
                authorized = true;
            }
        })
        if(!authorized){
            res.status(403).json({error:"Unauthorized"});
        }else{
            req.user = user;
            next()
        }
    }catch(err){
        res.status(401).json({error : err.message});
    }
}

const requireCoach = async (req,res,next) =>{
    const { authorization } = req.headers

    if (!authorization) {
        res.status(401).json({error: "Authorization is required!"})
    }

    const token = authorization.split(' ')[1]
    try{
        let authorized=false;
        const { _id } = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(_id);
        user.roles.forEach(role=>{
            if(role === 12){
                authorized = true;
            }
        })
        if(!authorized){
            res.status(403).json({error:"Unauthorized"});
        }else{
            req.user = user;
            next()
        }
    }catch(err){
        res.status(401).json({error : err.message});
    }
}

const requireOrganizer = async (req,res,next)=>{
    const { authorization } = req.headers

    if (!authorization) {
        res.status(401).json({error: "Authorization is required!"})
    }

    const token = authorization.split(' ')[1]
    try{
        let authorized=false;
        const { _id } = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(_id);
        user.roles.forEach(role=>{
            if(role === 13){
                authorized = true;
            }
        })
        if(!authorized){
            res.status(403).json({error:"Unauthorized"});
        }else{
            req.user = user;
            next()
        }
    }catch(err){
        res.status(401).json({error : err.message});
    }
}

const requirePlayer = async (req,res,next) => {
    const { authorization } = req.headers

    if (!authorization) {
        res.status(401).json({error: "Authorization is required!"})
    }

    const token = authorization.split(' ')[1]
    try{
        let authorized=false;
        const  u = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(u._id);
        user.roles.forEach(role=>{
            if(role === 11){
                authorized = true;
            }
        })
        if(!authorized){
            res.status(403).json({error:"Unauthorized"});
        }else{
            req.user = user;
            next()
        }
    }catch(err){
        res.status(401).json({error : err.message});
    }
}

const requireCoachAndPlayer = async (req,res,next) => {
    const { authorization } = req.headers

    if (!authorization) {
        res.status(401).json({error: "Authorization is required!"})
    }

    const token = authorization.split(' ')[1]
    try{
        let authorized=false;
        const { _id } = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(_id);
        user.roles.forEach(role=>{
            if(role === 12 || role === 11){
                authorized = true;
            }
        })
        if(!authorized){
            res.status(403).json({error:"Unauthorized"});
        }else{
            req.user = user;
            next()
        }
    }catch(err){
        res.status(401).json({error : err.message});
    }
}

const requireReferee = async (req,res,next) => {
    const { authorization } = req.headers

    if (!authorization) {
        res.status(401).json({error: "Authorization is required!"})
    }

    const token = authorization.split(' ')[1]
    try{
        let authorized=false;
        const {user}  = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const u = await User.findById(user._id);
        console.log(u);
        console.log(user);
        user.roles.forEach(role=>{
            if(role === 20){
                authorized = true;
            }
        })
        if(!authorized){
            res.status(403).json({error:"Unauthorized"});
        }else{
            req.user = user;
            next()
        }
    }catch(err){
        res.status(401).json({error : err.message});
    }
}



module.exports = {requireAuth,requireCoach,requirePlayer,requireOrganizer,requireCoachAndPlayer,requireReferee,requireAdmin}