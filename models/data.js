const mongoose = require('mongoose');

const mediaSchema = mongoose.Schema({
    Image: { 
        type: String,
        required: true
    },
    url: {
        type: String, 
        required: true
    },
    owner: {
        type: String,
        required: true   
    }
});

module.exports = mongoose.model('Media', mediaSchema);