const express=require("express")
const router=express.Router()
const MessageController=require('../Controller/MessageController')




router.post('/add',MessageController.add);

router.get('/getall',MessageController.getall);

router.get('/getbyid/:id',MessageController.getbyid);

router.get('/getbyname/:name',MessageController.getbyname);

router.put('/update/:id',MessageController.update);

router.delete('/delete/:id',MessageController.deleteMessage);

module.exports = router;



