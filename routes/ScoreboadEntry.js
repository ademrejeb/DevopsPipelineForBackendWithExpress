const express=require("express")
const router=express.Router()
const ScoreboadEntryController=require('../Controller/ScoreboadEntryController')




router.post('/add',ScoreboadEntryController.add);

router.get('/getall',ScoreboadEntryController.getall);

router.get('/getbyid/:id',ScoreboadEntryController.getbyid);

router.get('/getbyname/:name',ScoreboadEntryController.getbyname);

router.put('/update/:id',ScoreboadEntryController.update);

router.delete('/delete/:id',ScoreboadEntryController.deleteScoreboadEntry);

module.exports = router;



