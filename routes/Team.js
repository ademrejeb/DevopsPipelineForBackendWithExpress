const express=require("express")
const router=express.Router()
const TeamController=require('../Controller/TeamController')
const LineupController=require('../Controller/LineupController')
const  teamLogoUpload  = require('../config/multer_team');

router.post('/add/:id', teamLogoUpload.single('team'), TeamController.add);

router.get('/getall',TeamController.getall);

router.get('/getbyid/:id',TeamController.getbyid);

router.get('/getbyname/:name',TeamController.getbyname);

router.put('/update/:id',teamLogoUpload.single('TeamLogo'),TeamController.update);

router.delete('/delete/:id',TeamController.deleteTeam);

router.post('/addPlayer/:id',TeamController.addPlayerToTeam);

router.get('/checkTeam_manager/:id',TeamController.checkTeam_manager);

router.put('/updateXTeam/:id',TeamController.updateXTeam);

router.get('/getTeambyCoach/:id',TeamController.getTeambyCoach);

router.get('/getTeambyTeamManger/:id',TeamController.getTeambyTeamManger);

router.post('/addCoachToTeam/:id',TeamController.addCoachToTeam);

router.post('/addLineup',LineupController.add);

router.get('/getLineup/:teamId',LineupController.getLineup);

router.put('/updateLineup/:teamId',LineupController.updateLineup);

router.get('/getTeamRating/:id',TeamController.getTeamRating);

router.get('/getTeamsByMatch/:matchId',LineupController.getTeamsByMatch);

module.exports = router;