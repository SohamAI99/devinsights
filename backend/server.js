const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// Initialize app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/devinsight', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));

// Define Analysis schema
const analysisSchema = new mongoose.Schema({
  githubUsername: String,
  linkedinUrl: String,
  leetcodeUsername: String,
  codeforcesHandle: String,
  scores: {
    overall: Number,
    github: Number,
    linkedin: Number,
    leetcode: Number,
    codeforces: Number,
  },
  strengths: [String],
  weaknesses: [String],
  recommendations: [String],
  createdAt: { type: Date, default: Date.now },
});

const Analysis = mongoose.model('Analysis', analysisSchema);

// Dummy AI analysis function
async function analyzeProfile({ githubUsername, linkedinUrl, leetcodeUsername, codeforcesHandle }) {
  // TODO: Replace with real API calls and AI logic
  return {
    scores: {
      overall: 75,
      github: 82,
      linkedin: 70,
      leetcode: 75,
      codeforces: 68,
    },
    strengths: [
      'Consistent Contributions',
      'Project Diversity',
      'Problem Solving',
      'Documentation',
    ],
    weaknesses: [
      'Collaborations',
      'Profile Completeness',
      'Advanced Challenges',
      'Project Showcasing',
    ],
    recommendations: [
      'Pin your best repositories and add descriptive READMEs.',
      'Complete your LinkedIn profile with skills and endorsements.',
      'Participate in more coding contests.',
      'Contribute to open source projects.',
    ],
  };
}

// POST /analyze - submit profile info and get analysis
app.post('/analyze', async (req, res) => {
  const { githubUsername, linkedinUrl, leetcodeUsername, codeforcesHandle } = req.body;
  if (!githubUsername || !linkedinUrl || !leetcodeUsername || !codeforcesHandle) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const aiResult = await analyzeProfile({ githubUsername, linkedinUrl, leetcodeUsername, codeforcesHandle });

    const analysis = new Analysis({
      githubUsername,
      linkedinUrl,
      leetcodeUsername,
      codeforcesHandle,
      scores: aiResult.scores,
      strengths: aiResult.strengths,
      weaknesses: aiResult.weaknesses,
      recommendations: aiResult.recommendations,
    });

    await analysis.save();

    res.json({ id: analysis._id, ...aiResult });
  } catch (error) {
    console.error('Error during analysis:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /analysis/:id - fetch previous analysis
app.get('/analysis/:id', async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);
    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }
    res.json(analysis);
  } catch (error) {
    console.error('Error fetching analysis:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
