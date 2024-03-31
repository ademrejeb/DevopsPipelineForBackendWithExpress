const express = require('express');
const { createComplaint,updateComplaintStatus,getAllComplaints,respondToComplaint, deleteComplaint } = require('../Controller/ComplaintController');
const router = express.Router();

router.post('/complaints', createComplaint);

router.get('/AllComplaints', getAllComplaints);

router.put('/complaints/update-status', updateComplaintStatus);

router.put('/complaints/respond',respondToComplaint);

router.delete('/complaints/:complaintId', deleteComplaint);


module.exports = router;
