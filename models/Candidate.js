const mongoose = require('mongoose');

// Define the schema
const candidateSchema = new mongoose.Schema({
    logo: {
        type: String,
        required: true,
    },
    candidateID: {
        type: Number,
        required: true,
        unique: true,
    },
    symbol: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    campaignID: {
        type: Number, // Adjusted to Number type for campaignID
        required: true,
    },
    votes: {
        type: Number,
        required: true,
    },
});

// Create the model
const Candidate = mongoose.model('Candidate', candidateSchema);

// Export the model
module.exports = Candidate;
