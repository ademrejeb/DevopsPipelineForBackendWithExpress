const mongoose = require('mongoose');
const matchSchema = new mongoose.Schema({
    team1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
    },
    team2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
    },
    date: {
        type: Date,
        default: Date.now
    },startDay : Number,
    startMonth : Number,
    startYear : Number,
    endDay : Number,
    endMonth : Number,
    endYear : Number,
    startHour: Number , 
    startMinutes: Number ,
    result : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MatchResult'
    },
    tournament: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tournament'
    },
    _ref: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default:null
    },
    stadium :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stadium'
    },
});

const Match = mongoose.model('Match', matchSchema);

module.exports = Match;