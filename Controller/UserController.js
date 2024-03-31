const User = require('../models/User')
const jwt = require('jsonwebtoken')
require('dotenv').config();
const mailer = require('../config/nodemailer');
const bcrypt = require("bcrypt");
const asyncHandler = require('express-async-handler')
const templateMail = require('../config/templateMail.js');
const RoleRequest = require('../models/RoleRequest')
const Tournament = require('../models/Tournament');
const Team = require('../models/Team')
//                  =================================================
//                  ===================== AUTH ======================
//                  =================================================
const RequestedRole = {
    ACCEPTED:'ACCEPTED',
    REJECTED:'REJECTED',
    PENDING:'PENDING',
    NEW:'NEW'
};

// login a user
const loginUser = async (req, res) => {
    const {email, password} = req.body

    try {
        const user = await User.login(email, password)
        user.password = '';

        const accessToken = jwt.sign(
            {
                "user":
                    {
                        email: user.email,
                        fullname: user.fullname,
                        roles: user.roles,
                        phone: user.phone,
                        city: user.city,
                        country: user.country,
                        isBlocked: user.isBlocked,
                        isVerified: user.isVerified,
                        age: user.age,
                        avatar: user.avatar,
                        addressWallet:user.addressWallet

                    }
            },
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn: '60m'}
        )

        const refreshToken = jwt.sign(
            {
                "_id": user._id
            },
            process.env.REFRESH_TOKEN_SECRET,
            {expiresIn: '7d'}
        )

        // Create secure cookie with refresh token
        res.cookie('jwt', refreshToken, {
            sameSite: 'None',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })


        if (!user.verified) {
            await mailer.sendMail({
                from: 'moatazfoudhailii@gmail.com', // sender address
                to: email, // list of receivers
                subject: "Confirm account", // Subject line
                // text: "Please confirm", // plain text body
                html: templateMail, // html body
            });
        }

        res.json({accessToken})
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

// signup a user
const signupUser = async (req, res) => {
    const {email, password, age, phone, fullname} = req.body

    try {

        const user = await User.signup(email, password, phone, fullname, age)

        user.password = '';

        const accessToken = jwt.sign(
            {
                "user":
                    {
                        email: user.email,
                        fullname: user.fullname,
                        roles: user.roles,
                        phone: user.phone,
                        city: user.city,
                        country: user.country,
                        isBlocked: user.isBlocked,
                        isVerified: user.isVerified,
                        age: user.age,
                        avatar: user.avatar
                    }
            },
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn: '60m'}
        )

        // Create a refresh token
        const refreshToken = jwt.sign(
            {
                "_id": user._id
            },
            process.env.REFRESH_TOKEN_SECRET,
            {expiresIn: '7d'}
        )

        // Create cookie with refresh token
        res.cookie('jwt', refreshToken, {
            sameSite: 'None',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        // Send email verification
        await mailer.sendMail({
            from: 'moatazfoudhailii@gmail.com',
            to: email,
            subject: "Confirm account",
            html: "<b>Hello, confirm please</b>",
        });

        res.status(200).json({accessToken})
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

const refresh = (req, res) => {
    const cookies = req.cookies
    if (!cookies || !cookies.jwt) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!cookies.jwt) return res.status(401).json({message: 'You need to login'})

    const refreshToken = cookies.jwt

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        asyncHandler(async (err, decoded) => {
            if (err) return res.status(403).json({message: 'Forbidden'})

            const user = await User.findById(decoded.id).exec()

            if (!user) return res.status(401).json({message: 'Unauthorized'})

            const accessToken = jwt.sign(
                {
                    "user":
                        {
                            email: user.email,
                            fullname: user.fullname,
                            roles: user.roles,
                            phone: user.phone,
                            city: user.city,
                            country: user.country,
                            isBlocked: user.isBlocked,
                            isVerified: user.isVerified,
                            age: user.age,
                            avatar: user.avatar
                        }
                },
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn: '60m'}
            )

            res.json({accessToken})
        })
    )
}
//get the user's roles
const checkRoles = async (req, res) => {

    const cookies = req.cookies
    if (!cookies || !cookies.jwt) {
        return res.status(401).json({ message: 'You need to login' });
    }
    jwt.verify(
        cookies.jwt,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if (err) return res.status(403).json({message: 'Forbidden'})
            res.status(200).json({roles: decoded.user.roles})
        }
    )
}

//verify email
const verifyEmail = async (req, res) => {
    const email = req.body.email
    const u = await User.findOne({email});
    if (!u) {
        res.status(400).json({error: "Invalid email"})
    }
    try {
        u.verified = true;
        await User.findByIdAndUpdate(u._id, u);
        res.status(200).json({
            message: 'Email verified succeessfully'
        })
    } catch (err) {
        res.status(400).json({
            error: err.message
        })
    }

}

const changePassword = async (req, res) => {
    try {
        const {currentPassword, newPassword} = req.body;
        const match = await bcrypt.compare(currentPassword, req.user.password)
        if (!match) {
            res.status(401).json({error: "Old password is incorrect!"})
        }
        if (match) {
            const salt = await bcrypt.genSalt(10)
            req.user.password = await bcrypt.hash(newPassword, salt);
            await User.findByIdAndUpdate(req.user._id, req.user);
            res.status(200).json('Password changed successfully!')
        }
    } catch (e) {
        res.status(401).json({error: e.message})
    }
}

const resetPassword = async (req, res) => {
    let Email = req.body.email
    const charset = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()-_=+';
    let password = '';

    for (let i = 0; i < 10; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }

    const user = await User.findOne({email: Email.toString()});
    if (!user._id) {
        Error('Invalid email');
    }
    try {
        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(password, salt);

        await User.findByIdAndUpdate(user._id, user);
        await mailer.sendMail({
            from: 'moatazfoudhailii@gmail.com',
            to: Email,
            subject: "Reset password request",
            html: "<p>Your password has been reset to: </p><b>" + password + "</b>",
        });
        res.status(200).json({message: "Password reset is sent to " + Email})
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

async function toggleBlockUser(req, res) {
    try {
        const _id = req.body._id;
        const userToBlock = await User.findById(_id);

        userToBlock.isBlocked = !userToBlock.isBlocked;

        await User.findByIdAndUpdate(userToBlock._id, userToBlock);

        res.status(200).json({message: "Updated user status successfully!"})
    } catch (e) {
        res.status(401).json({error: e.message})
    }
}


async function updateUserProfile(req, res)  {
    try {
        const u = req.body.user;
        const usr = req.user;
        usr.fullname = u.fullname;
        usr.age = u.age;
        usr.phone = u.phone;
        usr.country = u.country;
        usr.city = u.city;
        usr.addressWallet=u.addressWallet;

        await User.findByIdAndUpdate(usr._id,usr)

        const user = await User.findById(usr._id);

        const accessToken = jwt.sign(
            {
                "user":
                    {
                        email: user.email,
                        fullname: user.fullname,
                        roles: user.roles,
                        phone: user.phone,
                        city: user.city,
                        country: user.country,
                        isBlocked: user.isBlocked,
                        isVerified: user.isVerified,
                        age: user.age,
                        avatar: user.avatar,
                        addressWallet:user.addressWallet
                    }
            },
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn: '60m'}
        )
        // Create a refresh token
        const refreshToken = jwt.sign(
            {
                "_id": u._id
            },
            process.env.REFRESH_TOKEN_SECRET,
            {expiresIn: '7d'}
        )
        res.cookie('jwt', refreshToken, {
            sameSite: 'None',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        await User.findByIdAndUpdate(u._id, u);
        res.status(200).json({accessToken})

    } catch (err) {
        res.status(401).json({error: err.message})
    }
}

async function getUserByEmail(req, res) {
    try {
        const email = req.params.email;

        const user = await User.findOne({email});
        const accessToken = jwt.sign(
            {
                "user":
                    {
                        email: user.email,
                        fullname: user.fullname,
                        roles: user.roles,
                        phone: user.phone,
                        city: user.city,
                        country: user.country,
                        isBlocked: user.isBlocked,
                        isVerified: user.isVerified,
                        age: user.age,
                        avatar: user.avatar,
                        addressWallet:user.addressWallet

                    }
            },
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn: '60m'}
        )

        // Create a refresh token
        const refreshToken = jwt.sign(
            {
                "_id": user._id
            },
            process.env.REFRESH_TOKEN_SECRET,
            {expiresIn: '7d'}
        )

        // Create cookie with refresh token
        res.cookie('jwt', refreshToken, {
            sameSite: 'None',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        res.status(200).json({accessToken});
    } catch (e) {
        res.status(401).json({error: e.message})
    }

}


async function saveAvatar(req, res) {
    try {
        const u = req.user
        console.log(req.file.filename);
        u.avatar = "http://localhost:3000/uploads/avatar/"+req.file.filename;
        await User.findByIdAndUpdate(u._id, u);
        const user = await User.findById(u._id);
        const accessToken = jwt.sign(
            {
                "user":
                    {
                        email: user.email,
                        fullname: user.fullname,
                        roles: user.roles,
                        phone: user.phone,
                        city: user.city,
                        country: user.country,
                        isBlocked: user.isBlocked,
                        isVerified: user.isVerified,
                        age: user.age,
                        avatar: user.avatar,
                        addressWallet:user.addressWallet

                    }
            },
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn: '60m'}
        )
        res.status(200).json({accessToken})

    } catch (error) {
        console.error('Error uploading avatar:', error.message);
        res.status(401).send({error: error.message});
    }
}

async function saveGoogleAvatar(user,pic) {
    try {
        user.avatar = pic;
    } catch (error) {
        console.log("In method userController.saveGoogleAvatar : ",error.message);
    }
}
async function getUserRoleRequest(req, res) {
    try {
        const user = req.user;
        const requests = await RoleRequest.find();
        const userRequests = requests.filter(r => {
            return r.user.equals(user._id);
        });
        if (!requests) {
            res.status(200).json({ notfound: true });
            return;
        }

        if (userRequests.length > 0) {
            const request = userRequests.find(r => r.result === 'PENDING');
            if (request && (request.result === 'PENDING')) {
                res.status(200).json({ request });
            } else {
                res.status(200).json({ notfound: true });
            }
        } else {
            res.status(200).json({ notfound: true });
        }
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
}


async function requestRole(req,res){
    try{
        const user = req.user;
        const requestedRole = req.body.requestedRole;
        const roleRequest = await RoleRequest.create({
            user:user,
            requestedRole:requestedRole,
        });
        res.status(200).json(roleRequest);
    }catch(e){
        res.status(400).json({error:e.message})
    }
}

async function acceptRoleRequest(req,res){
    try{
        let roleRequest = req.body;
        roleRequest.result = RequestedRole.ACCEPTED;
        const user = await User.findById(roleRequest.user);
        user.roles.push(roleRequest.requestedRole);
        await User.findByIdAndUpdate(user._id,user);
        roleRequest.user=await User.findById(user._id);
        await RoleRequest.findByIdAndUpdate(roleRequest._id,roleRequest);
        const result = await RoleRequest.findById(roleRequest._id);
        res.status(200).json(result);
    }catch(e){
        res.status(400).json({error:e.message})
    }
}

async function rejectRoleRequest(req,res){
    try{
        const roleRequest = req.body;
        console.log(roleRequest);
        roleRequest.result = RequestedRole.REJECTED;
        await RoleRequest.findByIdAndUpdate(roleRequest._id,roleRequest);
        const result = await RoleRequest.findById(roleRequest._id);
        res.status(200).json(result);
    }catch(e){
        console.log("Error: "+e.message);
        res.status(400).json({error:e.message})
    }
}

async function getRoleRequests(req,res){
    try{
        const requests = await RoleRequest.find();
        let reqs = [];
        for(const request of requests){
            const user = await User.findById(request.user)
            const newRequest ={
                _id: request._id,
                requestedRole: request.requestedRole,
                result: request.result,
                user: user,
            }
            reqs.push(newRequest);
        }
        res.status(200).json(reqs);
    }catch(e){
        res.status(400).json({error:e.message})
    }
}


//                  =================================================
//                  ===================== CRUD ======================
//                  =================================================


async function getPlayerTournaments(req,res){
    try{
        const user = req.user;
        const data = await Tournament.find();
        const myTournaments = data.filter(tournament=>tournament.teams.some(team=>team._id && user.currentTeam && team._id.equals(user.currentTeam)));
        res.status(200).json(myTournaments);
    }catch(e){
        res.status(400).json({error:e.message})
    }
}

async function getTeamsByTournament(req,res){
    try{
        const user = req.user;
        const id = req.params.id;
        const tournament = await Tournament.findById(id);
        let myTeam = {};
        let teams = [];
                for (const t of tournament.teams){
                    try {
                        const team = await Team.findById(t);
                        if (team) {
                            if(user.currentTeam.equals(t)){
                                myTeam = team;
                                teams.push(team)
                            }else{
                                teams.push(team);
                            }
                        } else {
                            console.log(`Team with ID ${t} not found.`);
                        }
                    } catch (error) {
                        console.error('Error fetching team:', error);
                    }
                }
                res.status(200).json({teams,myTeam})
    }catch(e){
        res.status(400).json({error:e.message})
    }
}

async function getUsersForChat(req,res){
    try{
        const current = req.user;
        const users = await User.find();
        const resp = users.filter((user)=>user._id!==current._id).map((user) => ({
            email: user.email,
            fullname: user.fullname,
        }));

        res.status(200).json({data:resp});

    }catch (e){
        res.status(400).json({error:e.message})
    }
}

async function add(req, res) {
    try {
        console.log(req.body);
        const user = new User(req.body);
        const savedUser = await user.save();
        res.status(200).json(savedUser);
    } catch (err) {
        console.error(err);
        res.status(400).json({error: err.message});
    }
}


async function getall(req, res) {
    try {
        const data = await User.find()
        res.status(200).send(data)

    } catch (err) {
        res.status(400).json({error: err});


    }

}

async function getbyid(req, res) {
    try {
        const data = await User.findById(req.params.id)
        res.status(200).send(data)
    } catch (err) {
        res.status(400).json({error: err});
    }

}

async function getbyname(req, res) {
    try {
        let name = req.params.nameClass
        //toujours avec {} pour connaitre les parametres seulement l id le connait
        const data = await User.findOne({name});
        res.status(200).send(data)
    } catch (err) {
        res.status(400).json({error: err});
    }
}


async function update(req, res) {
    try {
        await User.findByIdAndUpdate(req.params.id, req.body)
        res.status(200).send('updated')

    } catch (err) {
        res.status(400).json({error: err});


    }

}

async function deleteUser(req, res) {
    try {
        await User.findByIdAndDelete(req.params.id)
        res.status(200).send('deleted')

    } catch (err) {
        res.status(400).json({error: err});


    }

}


async function getallPlayers(req, res) {
    try {
        const data = await User.find({role: 'PLAYER'});
        res.status(200).send(data);
    } catch (err) {
        res.status(400).json({error: err});
    }
}


async function getPlayersByIds(playerIds) {
    try {
        const players = await User.find({ _id: { $in: playerIds } }).select('fullname position jersyNumber');
        return players.map(player => ({
            id :player._id,
            fullname: player.fullname,
            jersyNumber: player.jersyNumber,
            position: player.position,
            
        }));
        
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function getByEmail(req, res) {
    const {email} = req.query;
    try {
        const user = await User.findOne({email});

        if (!user) {
            return res.status(404).json({error: 'User not found'});
        }

        // Return the user details without sensitive information (e.g., password)
        const {_id, fullname, age, phone, roles, teams, games, rate, position, jersyNumber, value,currentTeam} = user;
        res.status(200).json({
            _id,
            fullname,
            email,
            age,
            phone,
            roles,
            teams,
            games,
            rate,
            position,
            jersyNumber,
            value,
            currentTeam
        });
    } catch (error) {
        console.error('Error fetching user by email:', error.message);
        res.status(500).json({error: 'Internal Server Error'});
    }
}
async function getallPlayersWithNoTeam(req, res) {
    try {
        const data = await User.find({ roles: 11, currentTeam: null});
        res.status(200).send(data);
    } catch (err) {
        res.status(400).json({error: err});
    }
}

async function getallCoachesWithNoTeam(req, res) {
    try {
        const data = await User.find({ roles: 12, currentTeam: null});
        res.status(200).send(data);
    } catch (err) {
        res.status(400).json({error: err});
    }
};

async function getAllReferees (req, res) {
    try {
        
        const referees = await User.find({ roles: 20 });

        if (!referees) {
            return res.status(404).json({ message: 'mafamesh ' });
        }

        res.status(200).json(referees);
    } catch (error) {
        console.error('Error getting referees:', error);
        res.status(500).json({ message: 'Server error' });
    }
};



module.exports = {
    add,
    getall,
    getbyid,
    getbyname,
    update,
    deleteUser,
    loginUser,
    signupUser,
    verifyEmail,
    resetPassword,
    refresh,
    checkRoles,
    toggleBlockUser,
    updateUserProfile,
    getUserByEmail,
    changePassword,
    saveAvatar,
    getallPlayers,
    getPlayersByIds,
    getByEmail,
    saveGoogleAvatar,
    getallCoachesWithNoTeam,
    getallPlayersWithNoTeam,
    getUsersForChat,
    requestRole,
    acceptRoleRequest,
    rejectRoleRequest,
    getRoleRequests,
    getUserRoleRequest,
    getPlayerTournaments,
    getTeamsByTournament,
    getAllReferees,
}
