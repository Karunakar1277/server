const mongoose = require('mongoose');

// Define the schema
const voteSchema = new mongoose.Schema({
    admissionNumber: {
        type: Number,
        required: true,
        unique: true,
    },
    votes: [{
        campaignId: {
            type: Number,
            required: true,
        },
        candidateId: {
            type: Number,
            required: true,
        },
    }],
});

// Create the model
const Vote = mongoose.model('Vote', voteSchema);

// Export the model
module.exports = Vote;
