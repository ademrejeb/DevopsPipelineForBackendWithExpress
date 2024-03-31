const Complaint = require("../models/Complaint");
const Notification = require("../models/Notification");
const User = require("../models/User");

// Create a new complaint
const createComplaint = async (req, res) => {
    try {
        const { userId, title, description } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const complaint = new Complaint({
            user: userId,
            title,
            description,
        });

        const savedComplaint = await complaint.save();
        res.status(201).json(savedComplaint);
    } catch (error) {
        console.error('Error creating complaint:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get all complaints
const getAllComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find().populate('user');
        res.status(200).json({ complaints });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update the status of a complaint
const updateComplaintStatus = async (req, res) => {
    try {
        const { complaintId, status } = req.body;

        const complaint = await Complaint.findByIdAndUpdate(
            complaintId,
            { status },
            { new: true }
        );

        res.status(200).json({ complaint });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Admin responds to a complaint
const respondToComplaint = async (req, res) => {
    try {
        const { complaintId, response } = req.body;
        console.log('Request Payload:', req.body);

        const complaint = await Complaint.findById(complaintId);

        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found.' });
        }

        complaint.adminResponse = response;

        if (response !== null) {
            complaint.status = 'ANSWERED';
        }

        await complaint.save();

        if (complaint.user) {
            const notification = new Notification({
                title: 'Response to your complaint',
                description: `Your complaint "${complaint.title}" has been responded to by the administrator "${complaint.adminResponse}".`,
                receiver: complaint.user,
            });

            await notification.save();
        }


        const updatedComplaint = await Complaint.findById(complaintId);
        console.log('Updated Complaint:', updatedComplaint);

        return res.status(200).json({ complaint: updatedComplaint });
    } catch (error) {
        console.error('Error responding to complaint:', error);
        return res.status(500).json({ error: error.message });
    }
};


// Delete a complaint
const deleteComplaint = async (req, res) => {
    try {
        const { complaintId } = req.params;

        const complaint = await Complaint.findById(complaintId);

        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found.' });
        }

        await complaint.deleteOne(); // Use deleteOne instead of remove

        return res.status(200).json({ message: 'Complaint deleted successfully.' });
    } catch (error) {
        console.error('Error deleting complaint:', error);
        return res.status(500).json({ error: error.message });
    }
};



module.exports = {
    createComplaint,
    getAllComplaints,
    updateComplaintStatus,
    respondToComplaint,
    deleteComplaint
};
