"use client";
import { useState } from "react";
import {
  Upload,
  FileText,
  Users,
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  Award,
  Target,
  TrendingUp,
  Zap,
  ChevronDown,
  Eye,
  MapPin,
  Save,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  // State variables to manage the UI
  const [jdFile, setJdFile] = useState(null);
  const [resumeFiles, setResumeFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedSummary, setExpandedSummary] = useState({});
  const [savedStatus, setSavedStatus] = useState({});

  // --- ADDITION: New handler to limit resume file uploads ---
  const handleResumeFileChange = (e) => {
    const files = e.target.files;
    if (files.length > 10) {
      alert(
        "You can only upload a maximum of 10 files. The first 10 have been selected."
      );
      // Convert the FileList to an array, take the first 10, and update the state
      const limitedFiles = Array.from(files).slice(0, 10);
      setResumeFiles(limitedFiles);
      // To make the file input reflect this change, we need to clear it
      e.target.value = null;
    } else {
      setResumeFiles(Array.from(files));
    }
  };

  // Add this new function to handle the save button click
  const handleSave = async (result, index) => {
    try {
      // Create the simple JSON object to save
      const candidateToSave = {
        candidateName: result.candidateName,
        jobTitle: result.jobTitle,
        location: result.location,
        relevanceScore: result.relevanceScore,
        verdict: result.verdict,
        summary: result.summary,
        missingSkills: result.missingSkills,
        matchedSkills: result.matchedSkills,
      };

      // Send the JSON data to the backend
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/candidates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(candidateToSave),
      });

      // Update the UI button to show "Saved"
      setSavedStatus((prev) => ({ ...prev, [index]: true }));
    } catch (err) {
      console.error("Failed to save candidate", err);
      alert("Error saving candidate.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!jdFile || resumeFiles.length === 0) {
      setError("Please upload both a Job Description and at least one Resume.");
      return;
    }

    setIsLoading(true);
    setError("");
    setResults([]);

    const formData = new FormData();
    formData.append("jd", jdFile);
    for (let i = 0; i < resumeFiles.length; i++) {
      formData.append("resumes", resumeFiles[i]);
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/analyze`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Analysis failed. The server responded with an error.");
      }

      const data = await response.json();
      setResults(data.results);
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 60) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getScoreGradient = (score) => {
    if (score >= 80) return "from-emerald-500 to-green-600";
    if (score >= 60) return "from-amber-500 to-orange-600";
    return "from-red-500 to-rose-600";
  };

  const getVerdictIcon = (verdict) => {
    if (
      verdict.toLowerCase().includes("strong") ||
      verdict.toLowerCase().includes("excellent") ||
      verdict.toLowerCase().includes("high")
    ) {
      return <Award className="w-5 h-5 text-emerald-500" />;
    }
    if (
      verdict.toLowerCase().includes("good") ||
      verdict.toLowerCase().includes("suitable") ||
      verdict.toLowerCase().includes("medium")
    ) {
      return <Target className="w-5 h-5 text-amber-500" />;
    }
    return <TrendingUp className="w-5 h-5 text-red-500" />;
  };

  const toggleSummary = (index) => {
    setExpandedSummary((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const sortedResults = [...results].sort(
    (a, b) => b.relevanceScore - a.relevanceScore
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Enhanced Header */}
      <div className="bg-white/90 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50 shadow-lg shadow-indigo-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 p-4 rounded-2xl shadow-lg">
                  <Sparkles className="w-8 h-8 text-white animate-pulse" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent">
                  AI Resume Matcher Pro
                </h1>
                <p className="text-gray-600 text-sm font-medium flex items-center mt-1">
                  <Zap className="w-4 h-4 mr-1 text-yellow-500" />
                  Advanced AI-powered resume screening & analysis
                </p>
              </div>
            </div>

            <Link
              href="/saved-candidates"
              className="group flex items-center space-x-2 bg-white text-gray-800 font-semibold px-4 py-2 rounded-lg shadow-md border border-gray-200 hover:bg-gray-100 transition-all"
            >
              <Users className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline">View Saved</span>
            </Link>
          </div>
        </div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-3 rounded-xl">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Smart Analysis
                </h3>
                <p className="text-sm text-gray-600">AI-powered matching</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-3 rounded-xl">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Instant Results
                </h3>
                <p className="text-sm text-gray-600">Real-time processing</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-3 rounded-xl">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Top Candidates
                </h3>
                <p className="text-sm text-gray-600">Ranked by relevance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Upload Form */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-10 mb-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              <span>Step 1: Upload Documents</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Start Your Analysis
            </h2>
            <p className="text-gray-600 text-lg">
              Upload your job description and candidate resumes to discover the
              perfect matches
            </p>
          </div>

          <div className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Enhanced Job Description Upload */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-gradient-to-r from-indigo-500 to-blue-600 p-3 rounded-xl shadow-lg">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Job Description
                    </h3>
                    <p className="text-sm text-gray-500">
                      Upload the position requirements
                    </p>
                  </div>
                </div>
                <div className="relative group">
                  <input
                    type="file"
                    id="jd-upload"
                    accept=".pdf,.docx"
                    onChange={(e) => setJdFile(e.target.files[0])}
                    className="hidden"
                    required
                  />
                  <label
                    htmlFor="jd-upload"
                    className="flex flex-col items-center justify-center w-full h-40 border-3 border-dashed border-indigo-300 rounded-2xl cursor-pointer bg-gradient-to-br from-indigo-50 to-blue-100 hover:from-indigo-100 hover:to-blue-200 transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-xl"
                  >
                    <div className="flex flex-col items-center space-y-3">
                      <div className="bg-indigo-500 p-3 rounded-full group-hover:scale-110 transition-transform duration-300">
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-center">
                        <p className="text-base font-semibold text-indigo-700">
                          {jdFile ? (
                            <span className="flex items-center space-x-2">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <span className="text-green-700">
                                {jdFile.name}
                              </span>
                            </span>
                          ) : (
                            "Click to upload job description"
                          )}
                        </p>
                        <p className="text-xs text-indigo-500 mt-2">
                          PDF or DOCX files • Max 10MB
                        </p>
                      </div>
                    </div>
                  </label>
                  {jdFile && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1 rounded-full">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Resume Upload */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-3 rounded-xl shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Candidate Resumes
                    </h3>
                    <p className="text-sm text-gray-500">
                      Upload multiple candidate files
                    </p>
                  </div>
                </div>
                <div className="relative group">
                  <input
                    type="file"
                    id="resume-upload"
                    accept=".pdf,.docx"
                    multiple
                    onChange={handleResumeFileChange}
                    className="hidden"
                    required
                  />
                  <label
                    htmlFor="resume-upload"
                    className="flex flex-col items-center justify-center w-full h-40 border-3 border-dashed border-purple-300 rounded-2xl cursor-pointer bg-gradient-to-br from-purple-50 to-pink-100 hover:from-purple-100 hover:to-pink-200 transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-xl"
                  >
                    <div className="flex flex-col items-center space-y-3">
                      <div className="bg-purple-500 p-3 rounded-full group-hover:scale-110 transition-transform duration-300">
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-center">
                        <p className="text-base font-semibold text-purple-700">
                          {resumeFiles.length > 0 ? (
                            <span className="flex items-center space-x-2">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <span className="text-green-700">
                                {resumeFiles.length} files selected
                              </span>
                            </span>
                          ) : (
                            "Click to upload resumes"
                          )}
                        </p>
                        <p className="text-xs text-purple-500 mt-2">
                          Multiple files supported • Max 10 files
                        </p>
                      </div>
                    </div>
                  </label>
                  {resumeFiles.length > 0 && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1 rounded-full">
                      <span className="text-xs font-bold px-1">
                        {resumeFiles.length}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Submit Button */}
            <div className="flex justify-center pt-6">
              <button
                onClick={handleSubmit}
                disabled={isLoading || !jdFile || resumeFiles.length === 0}
                className="group relative bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-5 px-12 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center space-x-4 shadow-2xl disabled:shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl group-hover:from-white/30"></div>
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                    <span className="text-lg">Analyzing Resumes...</span>
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
                    <span className="text-lg">Start AI Analysis</span>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-8 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="bg-red-100 p-2 rounded-full">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-red-800">Analysis Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Results Section */}
        {results.length > 0 && (
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 px-10 py-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 p-3 rounded-xl">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">
                      Analysis Results
                    </h2>
                    <p className="text-indigo-100 text-lg">
                      {results.length} candidates analyzed • Ranked by AI
                      relevance score
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-white/20 rounded-xl px-4 py-2">
                    <p className="text-white text-sm font-medium">Best Match</p>
                    <p className="text-2xl font-bold text-white">
                      {sortedResults[0]?.relevanceScore}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Enhanced Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-8 py-6 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                      Rank & Candidate
                    </th>
                    <th className="px-8 py-6 text-center text-sm font-bold text-gray-900 uppercase tracking-wider">
                      AI Score
                    </th>
                    <th className="px-8 py-6 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                      Verdict & Location
                    </th>
                    <th className="px-8 py-6 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                      Summary
                    </th>
                    <th className="px-8 py-6 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                      Skills Gap
                    </th>
                    <th className="px-8 py-6 text-center text-sm font-bold text-gray-900 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedResults.map((result, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${
                              index === 0
                                ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                                : index === 1
                                ? "bg-gradient-to-r from-gray-300 to-gray-500"
                                : index === 2
                                ? "bg-gradient-to-r from-amber-600 to-amber-800"
                                : "bg-gradient-to-r from-gray-400 to-gray-600"
                            }`}
                          >
                            {index === 0
                              ? "🥇"
                              : index === 1
                              ? "🥈"
                              : index === 2
                              ? "🥉"
                              : `#${index + 1}`}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-lg">
                              {result.candidateName}
                            </p>
                            <p className="text-sm text-gray-500">
                              Candidate #{index + 1}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="flex flex-col items-center space-y-2">
                          <div
                            className={`relative w-20 h-20 rounded-full border-4 ${getScoreColor(
                              result.relevanceScore
                            )} flex items-center justify-center`}
                          >
                            <span className="text-lg font-bold">
                              {result.relevanceScore}%
                            </span>
                            <div
                              className={`absolute inset-0 rounded-full bg-gradient-to-r ${getScoreGradient(
                                result.relevanceScore
                              )} opacity-10`}
                            ></div>
                          </div>
                          <div
                            className={`w-24 h-2 rounded-full bg-gray-200 overflow-hidden`}
                          >
                            <div
                              className={`h-full bg-gradient-to-r ${getScoreGradient(
                                result.relevanceScore
                              )} transition-all duration-1000`}
                              style={{ width: `${result.relevanceScore}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-full bg-gray-100">
                            {getVerdictIcon(result.verdict)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {result.verdict}
                            </p>
                            {/* Display Location */}
                            <p className="text-xs text-gray-500 flex items-center mt-1">
                              <MapPin className="w-3 h-3 mr-1" />
                              {result.location}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="max-w-sm">
                          <p
                            className={`text-sm text-gray-700 ${
                              expandedSummary[index] ? "" : "line-clamp-2"
                            }`}
                          >
                            {result.summary}
                          </p>
                          <button
                            onClick={() => toggleSummary(index)}
                            className="text-indigo-600 hover:text-indigo-800 text-xs font-medium mt-2 flex items-center space-x-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>
                              {expandedSummary[index]
                                ? "Show Less"
                                : "Read More"}
                            </span>
                            <ChevronDown
                              className={`w-3 h-3 transform transition-transform ${
                                expandedSummary[index] ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {result.missingSkills
                              .slice(0, 2)
                              .map((skill, skillIndex) => (
                                <span
                                  key={skillIndex}
                                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200"
                                >
                                  {skill}
                                </span>
                              ))}
                          </div>
                          {result.missingSkills.length > 2 && (
                            <div className="text-xs text-gray-500 font-medium">
                              +{result.missingSkills.length - 2} more skills
                              needed
                            </div>
                          )}
                        </div>
                      </td>
                      {/* New cell with the "Save" button */}
                      <td className="px-8 py-6 text-center">
                        <button
                          onClick={() => handleSave(result, index)}
                          disabled={savedStatus[index]}
                          className="flex items-center justify-center space-x-2 w-full bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-indigo-200 disabled:bg-green-100 disabled:text-green-700 disabled:cursor-not-allowed transition-colors"
                        >
                          {savedStatus[index] ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          <span>{savedStatus[index] ? "Saved" : "Save"}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Enhanced Mobile Card View */}
            <div className="lg:hidden space-y-6 p-8">
              {sortedResults.map((result, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-8 shadow-xl border-2 border-gray-100"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${
                          index === 0
                            ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                            : index === 1
                            ? "bg-gradient-to-r from-gray-300 to-gray-500"
                            : index === 2
                            ? "bg-gradient-to-r from-amber-600 to-amber-800"
                            : "bg-gradient-to-r from-gray-400 to-gray-600"
                        }`}
                      >
                        {index === 0
                          ? "🥇"
                          : index === 1
                          ? "🥈"
                          : index === 2
                          ? "🥉"
                          : `#${index + 1}`}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-xl">
                          {result.candidateName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Candidate #{index + 1}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`relative w-16 h-16 rounded-full border-4 ${getScoreColor(
                        result.relevanceScore
                      )} flex items-center justify-center`}
                    >
                      <span className="text-sm font-bold">
                        {result.relevanceScore}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-xl">
                      {getVerdictIcon(result.verdict)}
                      <span className="font-medium text-gray-700">
                        {result.verdict}
                      </span>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-xl">
                      <h4 className="text-sm font-bold text-gray-900 mb-2">
                        AI Analysis Summary:
                      </h4>
                      <p className="text-sm text-gray-700">{result.summary}</p>
                    </div>

                    <div className="p-4 bg-red-50 rounded-xl">
                      <h4 className="text-sm font-bold text-gray-900 mb-3">
                        Skills Development Areas:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {result.missingSkills.map((skill, skillIndex) => (
                          <span
                            key={skillIndex}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
