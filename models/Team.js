const mongoose = require('mongoose');
const { Schema } = mongoose;

const TeamSchema = new Schema({
    name: String,
    logo: String,
    players: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    coach: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    staff: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    matches: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'match'
    }],
    team_manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    rating:Number,
});

module.exports = mongoose.model('Team', TeamSchema);