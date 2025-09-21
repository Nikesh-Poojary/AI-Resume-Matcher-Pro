const mongoose = require('mongoose');

// --- DATABASE SCHEMA ---
const candidateSchema = new mongoose.Schema({
    candidateName: { type: String, required: true },
    jobTitle: { type: String, required: true, index: true },
    location: { type: String, index: true },
    relevanceScore: { type: Number, required: true, index: true },
    verdict: String,
    summary: String,
    missingSkills: [String],
    matchedSkills: [String],
    savedAt: { type: Date, default: Date.now }
});

const SavedCandidate = mongoose.model('SavedCandidate', candidateSchema);

// Export the model so it can be used in other files
module.exports = SavedCandidate;