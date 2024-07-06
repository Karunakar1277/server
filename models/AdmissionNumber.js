const mongoose = require('mongoose');

// Define the schema
const admissionNumberSchema = new mongoose.Schema({
    admissionNumber: {
        type: Number,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    }
});

// Create the model
const AdmissionNumber = mongoose.model('AdmissionNumber', admissionNumberSchema);

// Export the model
module.exports = AdmissionNumber;
