const mongoose = require('mongoose');

// Define the schema
const campaignSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    campaignID: {
        type: Number,
        required: true,
        unique: true,
    },
    totalVotes: {
        type: Number,
        required: true,
    },
    noOfVotes: {
        type: Number,
        required: true,
    },
});

// Create the model
const Campaign = mongoose.model('Campaign', campaignSchema);

// Export the model
module.exports = Campaign;
