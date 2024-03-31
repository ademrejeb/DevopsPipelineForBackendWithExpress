const express=require("express")
const router=express.Router()
const StadiumController=require('../Controller/StadiumController')




router.post('/add',StadiumController.add);

router.get('/getall',StadiumController.getall);

router.get('/getbyid/:id',StadiumController.getbyid);

router.get('/getbyname/:name',StadiumController.getbyname);

router.put('/update/:id',StadiumController.update);

router.delete('/delete/:id',StadiumController.deleteStadium);

module.exports = router;



