const mongo = require('mongoose');
const User = require('./User');
const Chat = require('./Chat');
const { default: mongoose } = require('mongoose');
const  ObjectId  = mongoose.Types.ObjectId;

const Schema = mongo.Schema

const Message = new Schema({
    
    chat : Chat,
    content : String,
    sendDay : Number,
    sendMonth : Number,
    sendYear : Number,
    sender : [{
        type: ObjectId,
        ref:'User'
    }],
    receiver : [{
        type: ObjectId,
        ref:'User'
    }]
})

module.exports = mongo.model('message',Message);