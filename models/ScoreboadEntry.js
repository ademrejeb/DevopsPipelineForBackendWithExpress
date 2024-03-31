const mongo = require('mongoose');
const Team = require('./Team');

const Schema = mongo.Schema

const ScoreboardEntry = new Schema({
    rank : Number,
    score : Number,
    team : Team,
    teamState : {
        type:String,
        enum:['PLAYING','QUIT','ENDED'],
        default:'PLAYING'
    }
    
})

module.exports = mongo.model('scoreboardEntry',ScoreboardEntry);