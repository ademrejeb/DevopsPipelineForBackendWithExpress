const express=require("express")
const router=express.Router()
const NotificationController=require('../Controller/NotificationController')




router.post('/add',NotificationController.add);

router.get('/getall',NotificationController.getall);

router.get('/getbyid/:id',NotificationController.getbyid);

router.get('/getbyname/:name',NotificationController.getbyname);

router.get('/getbyUserId/:userId',NotificationController.getByUserId);

router.get('/getNotificationCountByUserId/:userId',NotificationController.getNotificationCountByUserId);

router.put('/update/:id',NotificationController.update);

router.delete('/delete/:id',NotificationController.deleteNotification);

router.put('/hide/:id', NotificationController.hideNotification);


module.exports = router;



