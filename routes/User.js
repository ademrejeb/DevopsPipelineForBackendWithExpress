const express=require("express")
const router=express.Router()
const UserController=require('../Controller/UserController')
const tokenVerif = require('../middlewares/tokenVerification')
const upload = require('../config/multer')

//Auth
router.post('/signup',UserController.signupUser);

router.post('/request',tokenVerif.requireAuth,UserController.requestRole);

router.put('/reject',tokenVerif.requireAdmin,UserController.rejectRoleRequest);

router.put('/accept',tokenVerif.requireAdmin,UserController.acceptRoleRequest);

router.get('/requests',tokenVerif.requireAdmin,UserController.getRoleRequests);

router.get('/check-request',tokenVerif.requireAuth,UserController.getUserRoleRequest);

router.get('/player-tournaments',tokenVerif.requireAuth,UserController.getPlayerTournaments);

router.get('/player-teams/:id',tokenVerif.requireAuth,UserController.getTeamsByTournament);

router.post('/login',UserController.loginUser);

router.put('/verify',UserController.verifyEmail);

router.put('/reset',UserController.resetPassword);

router.get('/roles',UserController.checkRoles)

router.post('/refresh',UserController.refresh)

router.put('/toggle-block',tokenVerif.requireAdmin,UserController.toggleBlockUser)

router.put('/profile',tokenVerif.requireAuth,UserController.updateUserProfile)

router.put('/change-password',tokenVerif.requireAuth,UserController.changePassword)

router.get('/email/:email',UserController.getUserByEmail)


router.get('/for-chat',tokenVerif.requireAuth,UserController.getUsersForChat)

router.put('/avatar',tokenVerif.requireAuth,upload.single('avatar'),UserController.saveAvatar)

router.get("/getAllReferees" ,UserController.getAllReferees );

//CRUD
router.post('/add',UserController.add);

router.get('/getall',tokenVerif.requireAdmin,UserController.getall);

router.get('/getbyid/:id',UserController.getbyid);

router.get('/getbyname/:name',tokenVerif.requireCoachAndPlayer,UserController.getbyname);

router.put('/update/:id',UserController.update);

router.delete('/delete/:id',UserController.deleteUser);

router.get('/getallPlayers',UserController.getallPlayers);

router.get('/getbyemail', UserController.getByEmail);

router.get('/getPlayersByIds/:id',UserController.getPlayersByIds);

router.get('/getallPlayersWithNoTeam',UserController.getallPlayersWithNoTeam);

router.get('/getallCoachesWithNoTeam',UserController.getallCoachesWithNoTeam);

module.exports = router;