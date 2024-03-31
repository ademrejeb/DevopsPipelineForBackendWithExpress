const mongoose = require('mongoose');
const { Schema } = mongoose;
const Team = require('./Team');
const Match = require('./Match');


const FriOrComp = {
    Competitive: 'Competitive',
    Friendly: 'Friendly',
  };

  const TournamentType = {
    Knockout: 'Knockout',
    League: 'League',
    Championship:'Championship',
  };

  const TournamentStatus = {
    Pending: 'Pending',
    Finished: 'Finished',
    OnGoing:'OnGoing',
    
  };

  const access = {
    Private: 'Private',
    Public: 'Public',
  };

const TournamentSchema = new Schema({
    title: String,
    startDay: Number,
    startMonth: Number ,
    startYear: Number,
    endDay : Number,
    endMonth : Number , 
    endYear : Number,
    Country: String,
    City : String,
    trophy: String,
    numberOfPlayers: Number,
    numberOfTeams:Number,
    logo: String,
    TournamentType: {
        type : String,
        enum : Object.values(TournamentType),
        default : TournamentType.League
    },
    TournamentStatus : {
        type : String,
        enum : Object.values(TournamentStatus),
        default : TournamentStatus.Pending
    },
    access : {
        type : String,
        enum : Object.values(access),
        default : access.Private
    },
    FriOrComp : {
        type : String,
        enum : Object.values(FriOrComp),
        default : FriOrComp.Competitive
    },
    teams: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team'
    }],
    matches: [[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match'
    }]],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    rounds: [{
        title: String,
        fixtures: [{
            match: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'Match' },   
        }]
    }],
    groupsWithMatches: [{
        teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
        matches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Match' }],
        standings: { type: mongoose.Schema.Types.ObjectId, ref: 'Standing' }
    }],
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    rating: {
        type: Schema.Types.Mixed,
        default: {
            '5 stars': 0,
            '4 stars': 0,
            '3 stars': 0,
            '2 stars': 0,
            '1 star': 0,
        }
    },
    winners: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team'
    }],
    referees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    Staduims: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stadium'
    }],
});

module.exports = mongoose.model('Tournament', TournamentSchema);