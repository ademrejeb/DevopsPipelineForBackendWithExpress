const mongoose = require('mongoose');
const { Schema } = mongoose;

const LineupSchema = new Schema({
    name: String,
    logo: String,
    players: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team'
    },
    matches: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'match'
    },
    team_manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    playerNames: [
        {
          id: {
            type: String,
            required: true
          },
          fullname: {
            type: String,
            required: true
          },
          jersyNumber: {
            type: Number,
            required: true
          },
          position: {
            type: String,
            required: true
          }
        }
      ]
});

module.exports = mongoose.model('Lineup', LineupSchema);