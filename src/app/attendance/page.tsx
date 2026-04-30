"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  Download, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  User, 
  Filter,
  ArrowUpDown,
  Calendar
} from "lucide-react";
import { convertToCSV } from "@/utils/attendanceUtils";

export default function AttendanceDashboard() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // all, low
  const [dateFilter, setDateFilter] = useState("monthly"); // daily, weekly, monthly

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/attendance");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const csvContent = convertToCSV(data);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `attendance_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredData = data.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "low" ? student.percentage < 75 : true;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Attendance Dashboard</h1>
            <p className="text-slate-500 mt-1">Monitor student presence and academic eligibility.</p>
          </div>
          <button 
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-indigo-200"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600">
              <User size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Students</p>
              <p className="text-2xl font-bold text-slate-900">{data.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="bg-amber-100 p-3 rounded-xl text-amber-600">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Low Attendance (&lt;75%)</p>
              <p className="text-2xl font-bold text-slate-900">
                {data.filter(s => s.percentage < 75).length}
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">System Active Since</p>
              <p className="text-2xl font-bold text-slate-900">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search students by name..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Students</option>
              <option value="low">At Risk (&lt;75%)</option>
            </select>
            <select 
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider font-semibold border-b border-slate-100">
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Days Present</th>
                  <th className="px-6 py-4">Percentage</th>
                  <th className="px-6 py-4">Last Seen</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <p>Loading attendance data...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                      No students found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((student) => (
                    <tr key={student._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{student.name}</p>
                            <p className="text-xs text-slate-500">{student.email || "No email provided"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {student.percentage >= 75 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                            <CheckCircle size={12} /> Eligible
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700">
                            <AlertCircle size={12} /> At Risk
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-700">
                          {student.daysPresent} <span className="text-slate-400">/ {student.totalDays}</span>
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 min-w-[100px] h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                student.percentage < 75 ? "bg-rose-500" : "bg-emerald-500"
                              }`} 
                              style={{ width: `${student.percentage}%` }}
                            />
                          </div>
                          <span className={`text-sm font-bold ${
                            student.percentage < 75 ? "text-rose-600" : "text-emerald-600"
                          }`}>
                            {student.percentage}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock size={14} />
                          {student.lastSeen ? new Date(student.lastSeen).toLocaleString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          }) : "Never"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-indigo-600 hover:text-indigo-800 text-sm font-bold transition-colors">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
