const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/tournament');
    },
    filename: function (req, file, cb) {
        const filename = uuidv4() + path.extname(file.originalname);
        cb(null, filename);
    }
});


module.exports =  multer({ storage }) ;