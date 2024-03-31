const mongo = require('mongoose');

const Schema = mongo.Schema;

const Complaint = new Schema({
    user: {
        type: mongo.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['ANSWERED', 'IN_PROGRESS'],
        default: 'IN_PROGRESS'
    },
    adminResponse: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongo.model('complaint', Complaint);
