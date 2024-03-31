//je change le nom de l'entité ici et partout
const Notification = require('../models/Notification')

async function add (req,res){
    console.log(req.body)
    try{
        const notification= new Notification(req.body)
        await notification.save();
        res.status(200).send("Add");
    } catch (err){
        res.status(400).json({error:err})
    }
}

async function getall (req,res){
    try{
        const data = await Notification.find()
        res.status(200).send(data)

    }catch(err){
        res.status(400).json({error:err});


    }

}

async function getbyid (req,res){
    try{
        const data = await Notification.findById(req.params.id)
        res.status(200).send(data)


    }catch(err){
        res.status(400).json({error:err});


    }

}

async function getbyname (req,res){
    try{
        let name=req.params.nameClass
        const data = await Notification.findOne({name});
        res.status(200).send(data)


    }catch(err){
        res.status(400).json({error:err});


    }

}


async function update (req,res){
    try{
        await Notification.findByIdAndUpdate(req.params.id,req.body)
        res.status(200).send('updated')

    }catch(err){
        res.status(400).json({error:err});


    }

}

async function deleteNotification (req,res){
    try{
        await Notification.findByIdAndDelete(req.params.id)
        res.status(200).send('deleted')

    }catch(err){
        res.status(400).json({error:err});


    }

}

async function getByUserId(req, res) {
    try {
        const userId = req.params.userId;

        const data = await Notification.find({ receiver: userId });

        res.status(200).json(data);
    } catch (err) {
        res.status(400).json({ error: err });
    }
}

async function hideNotification(req, res) {
    try {
        const notificationId = req.params.id;

        const notification = await Notification.findById(notificationId);

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found.' });
        }

        notification.isHidden = true;

        await notification.save();

        res.status(200).json({ message: 'Notification hidden successfully.' });
    } catch (error) {
        console.error('Error hiding notification:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
}

async function getNotificationCountByUserId(req, res) {
    try {
        const userId = req.params.userId;

        const notificationCount = await Notification.countDocuments({ receiver: userId });

        res.status(200).json({ notificationCount });
    } catch (error) {
        console.error('Error getting notification count:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
}


module.exports={add,getall,getbyid,getbyname,update,deleteNotification,getByUserId,hideNotification,getNotificationCountByUserId}