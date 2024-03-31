const express=require("express")
const router=express.Router()
const ChatController=require('../Controller/ChatController')
const tokenVerification = require("../middlewares/tokenVerification");


router.post('/',tokenVerification.requireAuth,ChatController.createNewChat)

router.get('/',tokenVerification.requireAuth,ChatController.getUserChats)

router.post('/add',ChatController.add);

router.get('/getall',ChatController.getall);

router.get('/getbyid/:id',ChatController.getbyid);

router.get('/getbyname/:name',ChatController.getbyname);

router.put('/update/:id',ChatController.update);

router.delete('/delete/:id',ChatController.deletechat);

module.exports = router;



