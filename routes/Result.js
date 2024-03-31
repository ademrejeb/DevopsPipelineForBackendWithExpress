const express=require("express")
const router=express.Router()
const ResultController=require('../Controller/ResultController')




router.post('/add',ResultController.add);

router.get('/getall',ResultController.getall);

router.get('/getbyid/:id',ResultController.getbyid);

router.get('/getbyname/:name',ResultController.getbyname);

router.put('/update/:id',ResultController.update);

router.delete('/delete/:id',ResultController.deleteResult);

module.exports = router;



