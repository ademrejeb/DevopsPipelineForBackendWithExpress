const mongo = require('mongoose');

const Schema = mongo.Schema

const Stadium = new Schema({
    name : String ,
    location : String,
    startResDay : Number,
    startResMonth : Number,
    startResYear : Number,
    capacity : Number
})

module.exports = mongo.model('stadium',Stadium);