"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Filter,
  MapPin,
  Briefcase,
  TrendingUp,
  ChevronLeft,
  Award,
  Target,
} from "lucide-react";

export default function SavedCandidatesPage() {
  // State for the master list of candidates, fetched once
  const [allCandidates, setAllCandidates] = useState([]);
  // State for the candidates that are actually displayed after filtering
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  // State for the current filter values
  const [filters, setFilters] = useState({
    jobTitle: "",
    location: "",
    minScore: "",
  });
  // State for loading status
  const [isLoading, setIsLoading] = useState(true);

  // State for the unique options in dropdowns, generated from data
  const [uniqueJobTitles, setUniqueJobTitles] = useState([]);
  const [uniqueLocations, setUniqueLocations] = useState([]);

  // 1. Fetch all candidates once when the component mounts
  useEffect(() => {
    const fetchCandidates = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/candidates`
        );
        const data = await response.json();
        setAllCandidates(data);
        setFilteredCandidates(data); // Initially, show all candidates

        // Dynamically generate unique filter options from the fetched data
        const titles = [...new Set(data.map((c) => c.jobTitle))];
        const locations = [...new Set(data.map((c) => c.location))];
        setUniqueJobTitles(titles);
        setUniqueLocations(locations);
      } catch (error) {
        console.error("Failed to fetch candidates:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCandidates();
  }, []); // Empty array means this runs only once on mount

  // 2. Apply filters whenever the 'filters' state or the master list changes
  useEffect(() => {
    let updatedCandidates = [...allCandidates];

    // Apply job title filter
    if (filters.jobTitle) {
      updatedCandidates = updatedCandidates.filter(
        (c) => c.jobTitle === filters.jobTitle
      );
    }
    // Apply location filter
    if (filters.location) {
      updatedCandidates = updatedCandidates.filter(
        (c) => c.location === filters.location
      );
    }
    // Apply minimum score filter
    if (filters.minScore) {
      updatedCandidates = updatedCandidates.filter(
        (c) => c.relevanceScore >= Number(filters.minScore)
      );
    }

    setFilteredCandidates(updatedCandidates);
  }, [filters, allCandidates]);

  // Handler to update the filters state
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleDelete = async (candidateId) => {
    // Ask for confirmation before deleting
    if (!window.confirm("Are you sure you want to delete this candidate?")) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/candidates/${candidateId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        console.log("Failed to delete candidate.");
      }

      // If deletion is successful, update the UI by removing the candidate from the state
      setAllCandidates((prev) =>
        prev.filter((candidate) => candidate._id !== candidateId)
      );
    } catch (error) {
      console.error("Error deleting candidate:", error);
      alert("Could not delete the candidate.");
    }
  };

  const getVerdictIcon = (verdict) => {
    if (verdict.toLowerCase().includes("high"))
      return <Award className="w-5 h-5 text-emerald-500" />;
    if (verdict.toLowerCase().includes("medium"))
      return <Target className="w-5 h-5 text-amber-500" />;
    return <TrendingUp className="w-5 h-5 text-red-500" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50 shadow-lg shadow-indigo-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 p-4 rounded-2xl shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent">
                  Saved Candidates
                </h1>
                <p className="text-gray-600 text-xs md:text-sm font-medium mt-1">
                  Filter and manage your talent pool
                </p>
              </div>
            </div>
            <Link
              href="/"
              className="group flex items-center space-x-2 bg-white text-gray-800 font-semibold px-4 py-2 rounded-lg shadow-md border border-gray-200 hover:bg-gray-100 transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline">Back to Analyzer</span>
            </Link>
          </div>
        </div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Enhanced Filter Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-blue-100 p-3 rounded-xl">
              <Filter className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Filter Your Candidates
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Job Title Filter */}
            <div className="relative">
              <Briefcase className="w-5 h-5 text-black absolute top-3.5 left-3.5" />
              <select
                name="jobTitle"
                value={filters.jobTitle}
                onChange={handleFilterChange}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg  transition-all appearance-none text-black"
              >
                <option value="">All Job Titles</option>
                {uniqueJobTitles.map((title) => (
                  <option key={title} value={title}>
                    {title}
                  </option>
                ))}
              </select>
            </div>
            {/* Location Filter */}
            <div className="relative">
              <MapPin className="w-5 h-5 text-black absolute top-3.5 left-3.5" />
              <select
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg  transition-all appearance-none text-black"
              >
                <option value="">All Locations</option>
                {uniqueLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
            {/* Score Filter */}
            <div className="relative">
              <TrendingUp className="w-5 h-5  absolute top-3.5 left-3.5 text-black" />
              <input
                type="number"
                name="minScore"
                placeholder="Minimum Score (e.g., 70)"
                value={filters.minScore}
                onChange={handleFilterChange}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg  transition-all text-black"
              />
            </div>
          </div>
        </div>

        {/* Results Table Section */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
          <div className="px-10 py-6">
            <h2 className="text-xl font-bold text-gray-800">
              Showing {filteredCandidates.length} of {allCandidates.length}{" "}
              Candidates
            </h2>
          </div>
          {/* This div controls the scrolling */}
          <div className="max-h-[65vh] overflow-y-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-8 py-4 text-left font-semibold text-gray-600 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-8 py-4 text-left font-semibold text-gray-600 uppercase tracking-wider">
                    Job Title
                  </th>
                  <th className="px-8 py-4 text-left font-semibold text-gray-600 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-8 py-4 text-center font-semibold text-gray-600 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-8 py-4 text-left font-semibold text-gray-600 uppercase tracking-wider">
                    Verdict
                  </th>

                  <th className="px-8 py-4 text-center font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="text-center p-10 text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center p-10 text-gray-500">
                      No candidates found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map((candidate) => (
                    <tr
                      key={candidate._id}
                      className="hover:bg-indigo-50/50 transition-colors"
                    >
                      <td className="px-8 py-5 font-bold text-gray-900">
                        {candidate.candidateName}
                      </td>
                      <td className="px-8 py-5 text-gray-700">
                        {candidate.jobTitle}
                      </td>
                      <td className="px-8 py-5 text-gray-700">
                        {candidate.location}
                      </td>
                      <td className="px-8 py-5 text-center font-bold text-lg text-indigo-600">
                        {candidate.relevanceScore}%
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center space-x-2">
                          {getVerdictIcon(candidate.verdict)}
                          <span className="font-semibold text-gray-800">
                            {candidate.verdict}
                          </span>
                        </div>
                      </td>
                      {/* --- ADDITION: New cell with the "Delete" button --- */}
                      <td className="px-8 py-5 text-center">
                        <button
                          onClick={() => handleDelete(candidate._id)}
                          className="text-red-500 hover:text-red-700 font-semibold transition-colors"
                          title="Delete Candidate"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
