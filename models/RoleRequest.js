const mongo = require('mongoose');

const Schema = mongo.Schema

const RequestedRole = {
    ACCEPTED:'ACCEPTED',
    REJECTED:'REJECTED',
    PENDING:'PENDING',
    NEW:'NEW'
};

const Role = {
    COACH: 12,
    PLAYER: 11,
    REFEREE: 20,
    ORGANIZER : 13,
    USER : 10,
    ADMIN : 30,
    TEAM_MANAGER: 21
};

const RoleRequest = new Schema({
    requestedRole: {
        type : Number,
        enum : Object.values(Role),
        default : Role.USER
    },
    result:{
        type : String,
        enum : Object.values(RequestedRole),
        default : RequestedRole.PENDING
    },
    user : {
        type: mongo.Schema.Types.ObjectId,
        ref: 'User'
    }
})

module.exports = mongo.model('role-request',RoleRequest);