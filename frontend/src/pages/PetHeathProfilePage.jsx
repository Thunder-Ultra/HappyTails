import React, { useEffect, useState, useMemo } from "react"; // Added useMemo
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { formatDate } from "../utils/formatters";

// // --- NEW: ADDED RECHARTS IMPORTS ---
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   Legend,
// } from "recharts";

// Icons - Added Plus, Scale, Ruler
import {
  ChevronLeft, FileText, Activity, Scale, Ruler, Calendar,
  Upload, X, Loader2, Trash2, AlertTriangle, Plus
} from "lucide-react";

// UI Components
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";

export default function PetHealthProfilePage() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- NEW: STATS MODAL STATES ---
  const [isStatModalOpen, setIsStatModalOpen] = useState(false);
  const [statSaving, setStatSaving] = useState(false);
  const [statFormData, setStatFormData] = useState({
    type: "Weight",
    value: "",
    added_on: new Date().toISOString().split("T")[0]
  });

  // --- EXISTING STATES (DO NOT MODIFY) ---
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isChartReady, setIsChartReady] = useState(false);
  // --- NEW: HEALTH STAT DELETE STATES ---
  const [isDeleteStatModalOpen, setIsDeleteStatModalOpen] = useState(false);
  const [statToDelete, setStatToDelete] = useState(null);
  const [isDeletingStat, setIsDeletingStat] = useState(false);

  // --- REPLACED: Open the custom modal instead of window.confirm ---
  const openDeleteStatModal = (stat) => {
    setStatToDelete(stat);
    setIsDeleteStatModalOpen(true);
  };

  // --- NEW: Execute the deletion from the custom modal ---
  const handleConfirmDeleteStat = async () => {
    if (!statToDelete) return;
    setIsDeletingStat(true);
    try {
      const res = await fetch(`${BASE_URL}/pets/stats/${statToDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Log entry removed");
      setIsDeleteStatModalOpen(false);
      setStatToDelete(null);
      fetchHealthData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsDeletingStat(false);
    }
  };

  useEffect(() => {
    if (!loading && data) {
      // Small delay to ensure Tailwind Grid has finished rendering the layout
      const timer = setTimeout(() => setIsChartReady(true), 200);
      return () => clearTimeout(timer);
    }
  }, [loading, data]);

  useEffect(() => {
    fetchHealthData();
  }, [id]);

  const fetchHealthData = async () => {
    try {
      const res = await fetch(`${BASE_URL}/pets/${id}/health`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Could not load health profile");
      const result = await res.json();
      setData(result);
    } catch (err) {
      toast.error(err.message);
      navigate("/mypets");
    } finally {
      setLoading(false);
    }
  };

  // --- NEW: STATS FUNCTIONS ---
  const handleStatSubmit = async (e) => {
    e.preventDefault();
    setStatSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/pets/${id}/stats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(statFormData),
      });
      if (!res.ok) throw new Error("Failed to add stat");
      toast.success("Stat recorded!");
      setIsStatModalOpen(false);
      setStatFormData({ ...statFormData, value: "" });
      fetchHealthData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setStatSaving(false);
    }
  };

  const handleDeleteStat = async (statId) => {
    if (!window.confirm("Delete this log entry?")) return;
    try {
      const res = await fetch(`${BASE_URL}/pets/stats/${statId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Entry removed");
      fetchHealthData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // --- DATA PROCESSING FOR GRAPH ---
  const chartData = useMemo(() => {
    if (!data?.healthStats || data.healthStats.length === 0) return [];

    const dateMap = {};

    data.healthStats.forEach(stat => {
      const dateObj = new Date(stat.added_on);
      if (isNaN(dateObj.getTime())) return;

      // Group by Date + Time to ensure entries on the same day are distinct 
      // but close enough to visualize chronologically
      const dateKey = dateObj.toISOString();

      if (!dateMap[dateKey]) {
        dateMap[dateKey] = {
          timestamp: dateObj.getTime(),
          displayDate: dateObj.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short'
          }),
          Weight: null,
          Height: null
        };
      }

      const val = parseFloat(stat.value);
      if (!isNaN(val)) {
        dateMap[dateKey][stat.type] = val;
      }
    });

    return Object.values(dateMap).sort((a, b) => a.timestamp - b.timestamp);
  }, [data]);

  // ... (Existing handleUploadSubmit, handleDeleteRecord, openDeleteModal, handleConfirmDelete functions stay the same)

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || !uploadTitle) {
      toast.error("Please provide both a title and a file");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("title", uploadTitle);
    formData.append("medical_file", selectedFile); // Matches your backend middleware

    try {
      const res = await fetch(`${BASE_URL}/pets/${id}/medical`, {
        method: "POST",
        headers: {
          // NOTE: Do NOT set Content-Type header when sending FormData
          Authorization: `Bearer ${token}`
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      toast.success("Record uploaded successfully!");
      setIsUploadModalOpen(false);
      setUploadTitle("");
      setSelectedFile(null);
      fetchHealthData(); // Refresh list
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsUploading(false);
    }
  };


  // (Existing Badge helper stays the same)
  function Badge({ status, label }) {
    const colors = {
      Yes: "bg-green-100 text-green-700 border-green-200",
      No: "bg-red-100 text-red-700 border-red-200",
      Unknown: "bg-gray-100 text-gray-700 border-gray-200",
      Partially: "bg-yellow-100 text-yellow-700 border-yellow-200",
      Male: "bg-blue-100 text-blue-700 border-blue-200",
      Female: "bg-pink-100 text-pink-700 border-pink-200"
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${colors[status] || colors.Unknown}`}>
        {label}: {status}
      </span>
    );
  }

  if (loading) return <div className="p-20 text-center">Loading Health Profile...</div>;
  if (!data) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Button variant="ghost" onClick={() => navigate("/mypets")} className="mb-6">
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to My Pets
      </Button>

      {/* --- HEADER SECTION (Kept as you liked it) --- */}
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start bg-white p-6 rounded-2xl shadow-sm border mb-8 overflow-hidden">
        <div className="w-64 h-64 flex-shrink-0 overflow-hidden rounded-2xl border-4 border-gray-50 shadow-md bg-gray-100">
          <div style={{ width: '300px', height: '300px', minWidth: '300px', overflow: 'hidden', borderRadius: '1rem', border: '4px solid #f3f4f6' }}>
            <img src={data.pet_pic_name ? `${BASE_URL}/uploads/${data.pet_pic_name}` : "/placeholder-pet.png"} alt={data.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        </div>
        <div className="flex-1 text-center md:text-left pt-2 w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">{data.name}</h1>
              <p className="text-xl text-blue-600 font-semibold mt-1">{data.type_name} • {data.breed_name}</p>
            </div>
            <div className="flex items-center justify-center gap-2 bg-blue-50 px-4 py-2 rounded-lg text-blue-700 font-bold self-center md:self-start">
              <Calendar className="h-5 w-5" />
              <span className="whitespace-nowrap">{formatDate(data.dob)}</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6">
            <Badge status={data.gender} label="Gender" />
            <Badge status={data.vaccinated} label="Vaccinated" />
            <Badge status={data.de_wormed} label="De-wormed" />
            <Badge status={data.sterilized} label="Sterilized" />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-gray-50/30">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-blue-500" /> Growth Tracker
              </CardTitle>
              <Button size="sm" onClick={() => setIsStatModalOpen(true)} className="h-8 gap-1">
                <Plus className="h-4 w-4" /> Add Entry
              </Button>
            </CardHeader>
            <CardContent className="pt-6">

              {/* --- THE GRAPH CONTAINER --- */}

              <div className="w-full mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100"
                style={{ minHeight: '350px', display: 'block' }}>

                {isChartReady && chartData.length > 0 ? (
                  <ResponsiveContainer width="99%" aspect={2.5}>
                    <LineChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />

                      <XAxis
                        dataKey="displayDate"
                        axisLine={{ stroke: '#cbd5e1' }}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        dy={10}
                      />

                      <YAxis
                        yAxisId="left"
                        orientation="left"
                        stroke="#f97316"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fontWeight: 700 }}
                        label={{ value: 'kg', angle: -90, position: 'insideLeft', fill: '#f97316', fontSize: 12, fontWeight: 'bold' }}
                      />

                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#3b82f6"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fontWeight: 600 }}
                        label={{ value: 'cm', angle: 90, position: 'insideRight', fill: '#3b82f6', fontSize: 12, fontWeight: 'bold' }}
                      />

                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          borderRadius: '12px',
                          border: 'none',
                          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                        }}
                      />

                      <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '20px' }} />

                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="Weight"
                        name="Weight"
                        stroke="#f97316"
                        strokeWidth={4}
                        dot={{ r: 6, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 8 }}
                        connectNulls
                        isAnimationActive={false} // <--- Disable animation to fix reload bugs
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="Height"
                        name="Height"
                        stroke="#3b82f6"
                        strokeWidth={4}
                        dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 8 }}
                        connectNulls
                        isAnimationActive={false} // <--- Disable animation to fix reload bugs
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  // UPDATED: Added h-full and justify-center to center text perfectly
                  <div className="h-[300px] flex flex-col items-center justify-center text-center text-gray-400 space-y-2">
                    {loading ? (
                      <Loader2 className="h-8 w-8 animate-spin opacity-20" />
                    ) : (
                      <>
                        <Activity className="h-12 w-12 mb-2 opacity-10" />
                        <p className="text-sm font-medium tracking-wide">
                          {chartData.length === 0 ? "Add weight or height stats to visualize growth" : "Preparing chart..."}
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* --- RECENT LOGS LIST --- */}
              <div className="space-y-3 mt-8">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Recent Logs</h4>

                {data.healthStats.length === 0 ? (
                  // UPDATED: Increased py-10 to py-16 and added spacing
                  <div className="flex flex-col items-center justify-center py-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
                    <Activity className="h-10 w-10 mb-4 opacity-20" />
                    <p className="text-sm italic font-semibold">No growth logs recorded yet.</p>
                    <p className="text-[10px] mt-2 uppercase tracking-[0.2em] opacity-60">Click "Add Entry" to start tracking</p>
                  </div>
                ) : (
                  [...data.healthStats].reverse().map(stat => (
                    <div key={stat.id} className="group flex justify-between items-center p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-xl ${stat.type === 'Weight' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                          {stat.type === 'Weight' ? <Scale className="h-5 w-5" /> : <Ruler className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{parseFloat(stat.value).toFixed(2)} {stat.type === 'Weight' ? 'kg' : 'cm'}</p>
                          <p className="text-xs text-slate-500">{formatDate(stat.added_on)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => openDeleteStatModal(stat)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- RIGHT COLUMN (MEDICAL RECORDS) --- */}
        <div className="space-y-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-500" /> Records
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setIsUploadModalOpen(true)}>
                <Upload className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.medicalRecords.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50/30 rounded-2xl border border-dashed border-slate-200">
                  <div className="p-3 bg-white rounded-full shadow-sm mb-3">
                    <FileText className="h-6 w-6 opacity-30" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-widest opacity-60">No Records Found</p>
                  <p className="text-[10px] mt-2 text-center px-6 leading-relaxed">
                    Upload vaccination certificates, prescriptions, or surgery reports here.
                  </p>
                </div>
              ) : (
                data.medicalRecords.map((doc) => (
                  <div key={doc.id} className="group relative flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <a href={`${BASE_URL}/uploads/medical/${doc.filename}`} target="_blank" rel="noreferrer" className="flex flex-1 items-center gap-3 min-w-0">
                      <FileText className="h-8 w-8 text-red-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{doc.title}</p>
                        <p className="text-xs text-slate-500">{formatDate(doc.added_on)}</p>
                      </div>
                    </a>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => openDeleteModal(doc)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* --- NEW: ADD STAT MODAL --- */}
      {isStatModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full w-[95%] max-w-md p-6 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Add Health Log</h2>
              <button onClick={() => setIsStatModalOpen(false)}><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleStatSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Type</label>
                <select
                  className="w-full p-2 border rounded-lg mt-1"
                  value={statFormData.type}
                  onChange={(e) => setStatFormData({ ...statFormData, type: e.target.value })}
                >
                  <option value="Weight">Weight (kg)</option>
                  <option value="Height">Height (cm)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Value</label>
                <input
                  type="number" step="0.01" required
                  className="w-full p-2 border rounded-lg mt-1"
                  placeholder="0.00"
                  value={statFormData.value}
                  onChange={(e) => setStatFormData({ ...statFormData, value: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Date</label>
                <input
                  type="date" required
                  className="w-full p-2 border rounded-lg mt-1"
                  value={statFormData.added_on}
                  onChange={(e) => setStatFormData({ ...statFormData, added_on: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full" disabled={statSaving}>
                {statSaving ? "Saving..." : "Save Entry"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Upload Modal Snippet */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Upload Medical Record</h2>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
            </div>
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Document Title</label>
                <input type="text" className="w-full p-2 border rounded-md" placeholder="e.g. Annual Vaccination 2025" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">File (PDF or Image)</label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setSelectedFile(e.target.files[0])} accept=".pdf,image/*" />
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-600">{selectedFile ? selectedFile.name : "Click to browse files"}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsUploadModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="flex-1" disabled={isUploading}>{isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</> : "Start Upload"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal Snippet */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="h-14 w-14 bg-red-100 rounded-full flex items-center justify-center mb-4"><AlertTriangle className="h-8 w-8 text-red-600" /></div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Remove Record?</h2>
              <p className="text-gray-500 mb-6">Are you sure you want to delete <span className="font-bold text-gray-800">"{recordToDelete?.title}"</span>? This file will be permanently removed.</p>
              <div className="flex w-full gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting}>Cancel</Button>
                <Button variant="destructive" className="flex-1" onClick={handleConfirmDelete} disabled={isDeleting}>{isDeleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : "Yes, Delete"}</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- CUSTOM DELETE HEALTH STAT MODAL --- */}
      {isDeleteStatModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="h-14 w-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Health Log?</h2>
              <p className="text-gray-500 mb-6">
                Are you sure you want to remove the <span className="font-bold text-gray-800">{statToDelete?.type}</span> entry of
                <span className="font-bold text-gray-800"> {parseFloat(statToDelete?.value).toFixed(2)}{statToDelete?.type === 'Weight' ? 'kg' : 'cm'}</span> from
                <span className="font-bold text-gray-800"> {formatDate(statToDelete?.added_on)}</span>?
              </p>

              <div className="flex w-full gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsDeleteStatModalOpen(false)}
                  disabled={isDeletingStat}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleConfirmDeleteStat}
                  disabled={isDeletingStat}
                >
                  {isDeletingStat ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</>
                  ) : "Yes, Delete"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}