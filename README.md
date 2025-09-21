🚀 Resume Relevance Analysis System
This project is a web application designed to streamline the process of matching resumes to job descriptions. It provides a platform for placement teams to manage job postings and for them to upload student resumes, with an automated system for relevance analysis and scoring.

✨ Features
1. Data Ingestion 📥
Job Description (JD) and Resume Upload: The placement team can upload both job descriptions and student resumes in PDF or DOCX format.

2. Parsing & Extraction 🔍
Resume Parsing: The system extracts raw text from resumes and standardizes the format for consistent analysis.

JD Parsing: Key information such as role title, required skills, and qualifications are extracted from the job description.

3. Relevance Analysis 🧠
Hard Match: Performs a keyword and skill-based matching to identify exact and fuzzy matches between the resume and JD.

Semantic Match: Utilizes Large Language Models (LLMs) to perform a deeper analysis by comparing the semantic similarity of the resume and JD.

Scoring & Verdict: A weighted scoring formula calculates a final relevance score (0-100) and provides a suitability verdict (High, Medium, or Low).

4. Output Generation 📊
Relevance Score: A percentage score indicating how well the resume matches the JD.

Detailed Feedback: Provides a list of missing skills, projects, or certifications.

Suggestions for Improvement: Offers actionable suggestions to help students improve their resumes.

5. Storage & Access 💾
All results, including parsed data, scores, and verdicts, are stored in a database.

The placement team can easily search and filter resumes by job role, relevance score, and location.

6. Web Application 🖥️
Placement Team Dashboard: A central dashboard for the placement team to upload JDs, view submitted resumes, and see a list of shortlisted candidates.

User Interface: Provides a user-friendly interface for the placement team to upload resumes and receive instant feedback.

🛠️ Technology Stack
Frontend: Next.js

Backend: Next.js API Routes (or Express.js)

Database: MongoDB

Language Models (LLMs): Used for semantic matching and suggestions.
