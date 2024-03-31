const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Standings schema
const StandingsSchema = new Schema({
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true
  },
  teams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  }],
  standings: [{
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true
    },
    wins: {
      type: Number,
      default: 0
    },
    losses: {
      type: Number,
      default: 0
    },
    draws: {
      type: Number,
      default: 0
    },
    goalsFor: {
        type: Number,
        default: 0
      },
      goalsAgainst: {
        type: Number,
        default: 0
    },
    points: {
      type: Number,
      default: 0
    }
  }]
});

// Create the Standings model
const Standings = mongoose.model('Standings', StandingsSchema);

module.exports = Standings;
