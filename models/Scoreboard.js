const mongo = require('mongoose');
const Team = require('./Team');
const ScoreboadEntry = require('./ScoreboadEntry');

const Schema = mongo.Schema

const Scoreboard = new Schema({

    tournament : Tournament,
    teams : [[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'scoreboardEntry'
    }]]
})

module.exports = mongo.model('scoreboard',Scoreboard);