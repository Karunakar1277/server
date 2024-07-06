const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const AdmissionNumber = require("./models/AdmissionNumber");
const Campaign = require("./models/Campaign");
const Candidate = require("./models/Candidate");
const Vote = require("./models/Vote");
const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect("mongodb+srv://itsjdk:CjQxHGcxSfv09VEV@studco.qa1r8jd.mongodb.net/?retryWrites=true&w=majority&appName=StudCo")
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((err) => {
        console.log(err);
    });


app.post("/add-admission", (req, res) => {
    const { admissionno, name } = req.body;
    const newAdmission = new AdmissionNumber({
        admissionNumber: admissionno,
        name : name
    })
    newAdmission.save()
        .then(() => {
            res.json("Admission Number Added")
        })
        .catch(err => {
            console.log(err);
        })
})

app.get('/all-admissions', async (req, res) => {
    try {
        const admissions = await AdmissionNumber.find({}, 'admissionNumber');
        const admissionNumbers = admissions.map(admission => admission.admissionNumber);
        res.json(admissionNumbers);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

app.get('/get-admission/:admissionno', async (req, res) => {
    try {
        const {admissionno}=req.params;
        AdmissionNumber
        .findOne({admissionNumber:admissionno})
        .then(admission=>{if (admission)
            {res.json(admission)}
            else{
                res.status(404).json("Admission Not Found")
            }
        })
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

app.post('/create-campaign', async (req, res) => {
    try {
        const { name, campaignID, totalVotes, noOfVotes } = req.body;
        if (!name || !campaignID || totalVotes == null || noOfVotes == null) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const newCampaign = new Campaign({
            name,
            campaignID,
            totalVotes,
            noOfVotes,
        });
        await newCampaign.save();
        res.status(201).json({ message: 'Campaign created successfully', campaign: newCampaign });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

app.post('/create-candidate', async (req, res) => {
    try {
        const { logo, candidateID, symbol, name, campaignID, votes } = req.body;
        if (!logo || !candidateID || !symbol || !name || !campaignID || votes == null) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const campaign = await Campaign.findOne({ campaignID });
        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }
        const newCandidate = new Candidate({
            logo,
            candidateID,
            symbol,
            name,
            campaignID,
            votes,
        });
        await newCandidate.save();
        res.status(201).json({ message: 'Candidate created successfully', candidate: newCandidate });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

app.get('/campaigns', async (req, res) => {
    try {
        const campaigns = await Campaign.find({}).exec();
        const formattedCampaigns = await Promise.all(campaigns.map(async (campaign) => {
            const candidates = await Candidate.find({ campaignID: campaign.campaignID }).exec();
            const formattedCandidates = candidates.map(candidate => ({
                name: candidate.name,
                id: candidate.candidateID,
                logo: candidate.logo,
                symbol: candidate.symbol,
                votes: candidate.votes,
            }));
            return {
                name: campaign.name,
                id: campaign.campaignID,
                totalVotes: campaign.totalVotes,
                noOfVotes: campaign.noOfVotes,
                candidates: formattedCandidates,
            };
        }));
        res.json({ campaigns: formattedCampaigns });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});
app.post('/record-vote', async (req, res) => {
    try {
        const { admissionNumber, campaignID, candidateID } = req.body;
        const admissionExists = await AdmissionNumber.findOne({ admissionNumber });
        if (!admissionExists) {
            return res.status(404).json({ message: 'Admission number not found or invalid' });
        }
        const voteExists = await Vote.findOne({ admissionNumber, 'votes.campaignId': campaignID });
        if (voteExists) {
            return res.status(400).json({ message: 'Already voted for this campaign' });
        }
        const campaign = await Campaign.findOne({ campaignID });
        const candidate = await Candidate.findOne({ candidateID });
        if (!campaign || !candidate) {
            return res.status(404).json({ message: 'Campaign or candidate not found' });
        }
        campaign.noOfVotes += 1;
        candidate.votes += 1;
        await campaign.save();
        await candidate.save();
        let vote = await Vote.findOne({ admissionNumber });
        if (!vote) {
            vote = new Vote({ admissionNumber, votes: [] });
        }
        vote.votes.push({ campaignId: campaignID, candidateId: candidateID }); // Corrected variable names
        await vote.save();
        res.status(200).json({ message: 'Vote recorded successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});


app.get('/get-votes/:admissionNumber', async (req, res) => {
    try {
        const admissionNumber = req.params.admissionNumber;
        const admissionExists = await AdmissionNumber.findOne({ admissionNumber });
        if (!admissionExists) {
            return res.status(404).json({ message: 'Admission number not found or invalid' });
        }
        const votes = await Vote.find({ admissionNumber }).select('-_id').exec();
        if (!votes || votes.length === 0) {
            return res.status(404).json({ message: 'No votes found for this admission number' });
        }
        res.json(votes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});


app.get('/voted-admissions', async (req, res) => {
    try {
        const votedAdmissions = await Vote.distinct('admissionNumber').exec();
        if (!votedAdmissions || votedAdmissions.length === 0) {
            return res.status(404).json({ message: 'No admission numbers have voted yet' });
        }
        res.json(votedAdmissions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

app.get('/campaigns/:campaignID/candidates', async (req, res) => {
    const { campaignID } = req.params;
    try {
        const candidates = await Candidate.find({ campaignID }).exec();
        if (!candidates || candidates.length === 0) {
            return res.status(404).json({ message: 'No candidates found for this campaign' });
        }
        res.json({ candidates });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

//Create a route to fetch the results of a campaign
//results json should be
//campaign id
//campaign name 
//candidates
//candidates votes with respect to campaign

app.get('/campaigns/results', async (req, res) => {
    try {
        const campaigns = await Campaign.find({}).exec();
        if (!campaigns || campaigns.length === 0) {
            return res.status(404).json({ message: 'No campaigns found' });
        }

        const results = await Promise.all(campaigns.map(async (campaign) => {
            const candidates = await Candidate.find({ campaignID: campaign.campaignID }).exec();
            const formattedCandidates = candidates.map(candidate => ({
                logo: candidate.logo,
                votes: candidate.votes,
            }));

            return {
                campaignID: campaign.campaignID,
                campaignName: campaign.name,
                candidates: formattedCandidates,
            };
        }));

        res.json({ campaigns: results });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});










app.listen(5000, () => {
    console.log("Server started on port 5000");
})
