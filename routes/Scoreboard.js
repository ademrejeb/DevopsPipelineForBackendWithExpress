const express=require("express")
const router=express.Router()
const ScoreboardController=require('../Controller/ScoreboardController')




router.post('/add',ScoreboardController.add);

router.get('/getall',ScoreboardController.getall);

router.get('/getbyid/:id',ScoreboardController.getbyid);

router.get('/getbyname/:name',ScoreboardController.getbyname);

router.put('/update/:id',ScoreboardController.update);

router.delete('/delete/:id',ScoreboardController.deleteScoreboard);

module.exports = router;



