const express = require("express");
const multer = require("multer");
const pdf = require("pdf-parse");
const mammoth = require("mammoth");
const cors = require("cors");
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const connectDB = require("./config/db");
const SavedCandidate = require("./models/Candidate");

connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
const PORT = 3001;

// A dictionary of common skills to look for
const SKILLS_DICTIONARY = [
  "Python",
  "Java",
  "JavaScript",
  "C++",
  "Ruby",
  "Go",
  "SQL",
  "NoSQL",
  "React",
  "Angular",
  "Vue",
  "Node.js",
  "Express",
  "Django",
  "Flask",
  "MongoDB",
  "PostgreSQL",
  "MySQL",
  "Git",
  "Docker",
  "Kubernetes",
  "AWS",
  "Azure",
  "Google Cloud",
  "GCP",
  "CI/CD",
  "Agile",
  "Scrum",
  "Machine Learning",
  "Deep Learning",
  "TensorFlow",
  "PyTorch",
  "Pandas",
  "NumPy",
];

// Initialize the Google AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to perform LLM-based semantic analysis
async function performSemanticMatch(jdText, resumeText) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });

    const prompt = `
  You are an expert HR tech recruiter. Analyze the following resume against the provided job description.
  Provide your output in a clean JSON format. Do not include any text outside of the JSON object.

  The JSON object must have these exact keys: "job_title", "candidate_location", "relevance_score", "verdict", "missing_skills", "summary".
  - "job_title": Extract the specific job title from the job description (e.g., "Senior Python Developer").
  - "candidate_location": Extract the candidate's city from the resume (e.g., "Bangalore", "Pune"). If not found, return "Not Found".
  - "relevance_score": An integer from 0 to 100 representing how well the resume matches the job.
  - "verdict": A string which is one of "High Fit", "Medium Fit", or "Low Fit".
  - "missing_skills": An array of strings listing key skills from the job description that are missing from the resume.
  - "summary": A brief, 2-3 sentence explanation of the candidate's fit.

  **Job Description:**
  ---
  ${jdText}
  ---

  **Resume:**
  ---
  ${resumeText}
  ---
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean the text to ensure it's valid JSON
    const jsonText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error with Gemini API:", error);
    return null; // Return null or a default error object
  }
}

// Helper function to extract text from a file buffer
async function extractText(file) {
  if (file.mimetype === "application/pdf") {
    const data = await pdf(file.buffer);
    return data.text;
  } else if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value;
  } else {
    console.log("Unsupported file type:", file.mimetype);
    return null;
  }
}

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Helper function to escape special characters for regex
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Function to perform a hard match for keywords and calculate a score
async function performHardMatch(jdText, resumeText) {
  const requiredSkills = [];
  const matchedSkills = [];

  SKILLS_DICTIONARY.forEach((skill) => {
    // USE THE ESCAPE FUNCTION HERE
    const escapedSkill = escapeRegex(skill);
    if (new RegExp(escapedSkill, "i").test(jdText)) {
      requiredSkills.push(skill);
    }
  });

  if (requiredSkills.length === 0) {
    return { score: 0, requiredSkills: [], matchedSkills: [] };
  }

  requiredSkills.forEach((skill) => {
    // AND USE IT AGAIN HERE
    const escapedSkill = escapeRegex(skill);
    if (new RegExp(escapedSkill, "i").test(resumeText)) {
      matchedSkills.push(skill);
    }
  });

  const score = (matchedSkills.length / requiredSkills.length) * 100;

  return {
    score: Math.round(score),
    requiredSkills,
    matchedSkills,
  };
}

// Function to calculate the final hybrid score
function calculateHybridScore(hardMatchScore, semanticMatchScore) {
  // Weights can be tuned. 30% hard match, 70% semantic match.
  const hardWeight = 0.3;
  const semanticWeight = 0.7;

  const hybridScore =
    hardMatchScore * hardWeight + semanticMatchScore * semanticWeight;
  return Math.round(hybridScore);
}

// Make the route handler async to use await
app.post(
  "/api/analyze",
  upload.fields([
    { name: "jd", maxCount: 1 },
    { name: "resumes", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const jdText = await extractText(req.files.jd[0]);
      const resumeFiles = req.files.resumes; // Get the full file objects
      let analysisResults = [];

      // Loop through the file objects, not just the text
      for (const file of resumeFiles) {
        const resumeText = await extractText(file);
        if (!resumeText) continue; // Skip if text extraction fails

        // 1. Perform Hard Match
        const hardMatch = await performHardMatch(jdText, resumeText);

        // 2. Perform Semantic Match
        const semanticMatch = await performSemanticMatch(jdText, resumeText);

        // Skip this resume if the AI analysis fails
        if (!semanticMatch) {
          console.log(
            `Skipping ${file.originalname} due to AI analysis error.`
          );
          continue;
        }

        // 3. Calculate the final score
        const finalScore = calculateHybridScore(
          hardMatch.score,
          semanticMatch.relevance_score
        );

        // 4. Create a clean result object for the frontend
        analysisResults.push({
          candidateName: file.originalname,
          relevanceScore: finalScore,
          verdict: semanticMatch.verdict,
          summary: semanticMatch.summary,
          missingSkills: semanticMatch.missing_skills,
          matchedSkills: hardMatch.matchedSkills,
          jobTitle: semanticMatch.job_title,
          location: semanticMatch.candidate_location,
        });
      }

      // 5. Send the clean results to the frontend
      res.json({ results: analysisResults });
    } catch (error) {
      console.error("Error during analysis:", error);
      res.status(500).send("Error processing files.");
    }
  }
);

app.post("/api/candidates", async (req, res) => {
  try {
    const newCandidate = new SavedCandidate(req.body);
    await newCandidate.save();
    res.status(201).json({ message: "Candidate saved successfully!" });
  } catch (error) {
    console.error("Error saving candidate:", error);
    res.status(500).json({ error: "Failed to save candidate." });
  }
});

app.get("/api/candidates", async (req, res) => {
  try {
    // Find all candidates without any filter and sort by the newest first
    const candidates = await SavedCandidate.find({}).sort({ savedAt: -1 });

    res.status(200).json(candidates);
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({ error: "Failed to fetch candidates." });
  }
});

// DELETE a specific candidate by their ID
app.delete("/api/candidates/:id", async (req, res) => {
  try {
    const { id } = req.params; // Get the ID from the URL parameter

    const deletedCandidate = await SavedCandidate.findByIdAndDelete(id);

    if (!deletedCandidate) {
      return res.status(404).json({ error: "Candidate not found." });
    }

    res.status(200).json({ message: "Candidate deleted successfully." });
  } catch (error) {
    console.error("Error deleting candidate:", error);
    res.status(500).json({ error: "Failed to delete candidate." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
