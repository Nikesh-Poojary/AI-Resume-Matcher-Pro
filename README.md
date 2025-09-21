# Placement Resume Evaluation System  

A web-based platform that helps placement teams and HRs efficiently evaluate resumes against job descriptions using **LLM-powered parsing and scoring**.  

The system allows HRs to:  
- Upload **job descriptions** and **resumes**.  
- Automatically **parse resumes** and **match them** against job requirements.  
- Assign **relevance scores** to each resume.  
- **Save shortlisted resumes** for later reference.  
- **Search and filter resumes** based on job role, location, and score.  

---

## 🚀 Tech Stack  

- **Frontend:** [Next.js](https://nextjs.org/)  
- **Backend:** [Express.js](https://expressjs.com/)  
- **Database:** [MongoDB](https://www.mongodb.com/)  
- **AI/LLM API:** [Gemini](https://ai.google.dev/gemini-api)  

---

## 📂 Features  

- ✅ Resume parsing using **Gemini LLM API**  
- ✅ Automatic **resume-to-job-description matching**  
- ✅ **Scoring system** for ranking resumes  
- ✅ HR can **save shortlisted resumes**  
- ✅ **Search & filter** functionality:  
  - By **job role**  
  - By **location**  
  - By **score**  

---

## ⚙️ Installation & Setup  

2. Install Dependencies
# Install frontend dependencies
cd frontend
npm install  

# Install backend dependencies
cd ../backend
npm install

3. Configure Environment Variables

Create a .env file in both frontend and backend with the following:

Backend .env
PORT=5000
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key

Frontend .env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000

4. Run the Application
# Start backend server
cd backend
npm start

# Start frontend
cd ../frontend
npm run dev


The app will be available at:
👉 http://localhost:3000

📊 Project Workflow

HR uploads Job Description

HR uploads Resumes (PDF/DOC)

Backend sends data to Gemini API

Gemini parses and assigns a matching score

Results are stored in MongoDB

HR can:

View scored resumes

Save preferred candidates

Search/filter resumes

🛠️ Future Enhancements

📌 Role-based authentication (HR/Admin)

📌 Export shortlisted resumes as CSV/PDF

📌 Email notifications to selected candidates

📌 Support for multiple LLM providers (OpenAI, Anthropic)

📌 Improved scoring algorithm with ML fine-tuning

🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.
