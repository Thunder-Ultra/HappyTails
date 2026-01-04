import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import {
  LayoutDashboard, Users as UsersIcon, Settings, Plus, Trash2,
  ShieldCheck, ShieldAlert, Loader2, PawPrint
  , Clock, Badge
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";

export default function AdminPanel() {
  const { token } = useAuth();
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [activeTab, setActiveTab] = useState("stats");
  const [stats, setStats] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [types, setTypes] = useState([]);
  const [breeds, setBreeds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states for new metadata
  const [newTypeName, setNewTypeName] = useState("");
  const [newBreed, setNewBreed] = useState({ name: "", type_id: "" });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [sRes, uRes, tRes] = await Promise.all([
        fetch(`${BASE_URL}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BASE_URL}/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BASE_URL}/public/pet-types`)
      ]);
      setStats(await sRes.json());
      setAllUsers(await uRes.json());
      setTypes(await tRes.json());
    } catch (err) { toast.error("Admin data failed to load"); }
    finally { setLoading(false); }
  };

  const handleToggleAdmin = async (userId, currentStatus) => {
    const nextStatus = currentStatus === "Yes" ? "No" : "Yes";
    try {
      const res = await fetch(`${BASE_URL}/admin/users/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId, status: nextStatus })
      });
      if (res.ok) {
        toast.success("User updated");
        fetchInitialData();
      }
    } catch (e) { toast.error("Failed to update"); }
  };

  const handleAddBreed = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}/admin/metadata/breeds`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(newBreed)
      });
      if (res.ok) {
        toast.success("Breed added");
        setNewBreed({ name: "", type_id: "" });
        fetchInitialData();
      }
    } catch (e) { toast.error("Error"); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="container mx-auto px-6 py-10 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Admin Console</h1>
          <p className="text-gray-500 font-medium mt-1">Global platform oversight and management</p>
        </div>

        {/* TAB SWITCHER */}
        <div className="bg-gray-100 p-1 rounded-xl flex gap-1">
          {[
            { id: 'stats', label: 'Stats', icon: LayoutDashboard },
            { id: 'users', label: 'Users', icon: UsersIcon },
            { id: 'metadata', label: 'Inventory', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${activeTab === tab.id ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
            >
              <tab.icon className="h-4 w-4" /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* --- TAB 1: DASHBOARD STATS --- */}
      {activeTab === "stats" && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard label="Total Adopters" val={stats.totalUsers} icon={UsersIcon} color="text-blue-600" bg="bg-blue-50" />
          <StatCard label="Live Listings" val={stats.totalAdoptables} icon={PawPrint} color="text-purple-600" bg="bg-purple-50" />
          <StatCard label="Pending Apps" val={stats.pendingRequests} icon={Clock} color="text-orange-600" bg="bg-orange-50" />
          <StatCard label="Successful" val={stats.successfulAdoptions} icon={ShieldCheck} color="text-green-600" bg="bg-green-50" />
        </div>
      )}

      {/* --- TAB 2: USER MANAGEMENT --- */}
      {activeTab === "users" && (
        <Card className="rounded-2xl overflow-hidden border-none shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">User</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Email</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Joined</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Admin?</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {allUsers.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900 text-sm">{u.name}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{u.email}</td>
                    <td className="px-6 py-4 text-gray-400 text-xs">{new Date(u.joined_on).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <Badge className={u.is_admin === "Yes" ? "bg-blue-600" : "bg-gray-200"}>{u.is_admin}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="cursor-pointer font-bold text-xs uppercase text-blue-600"
                        onClick={() => handleToggleAdmin(u.id, u.is_admin)}
                      >
                        {u.is_admin === "Yes" ? "Revoke Admin" : "Make Admin"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* --- TAB 3: METADATA --- */}
      {activeTab === "metadata" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="rounded-2xl p-6">
            <CardTitle className="text-lg mb-6 flex items-center gap-2"><Plus className="text-blue-600" /> Add New Breed</CardTitle>
            <form onSubmit={handleAddBreed} className="space-y-4">
              <select
                className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-100 outline-none"
                value={newBreed.type_id}
                onChange={(e) => setNewBreed({ ...newBreed, type_id: e.target.value })}
                required
              >
                <option value="">Select Pet Type</option>
                {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <Input
                placeholder="Breed Name (e.g. Beagle)"
                className="h-12 rounded-xl bg-gray-50 border-gray-100"
                value={newBreed.name}
                onChange={(e) => setNewBreed({ ...newBreed, name: e.target.value })}
                required
              />
              <Button type="submit" className="w-full h-12 bg-primary text-white rounded-xl font-bold">Register Breed</Button>
            </form>
          </Card>

          <Card className="rounded-2xl p-6 bg-gray-900 text-white border-none">
            <CardTitle className="text-lg mb-6 flex items-center gap-2"><Settings className="text-blue-400" /> Quick Add Type</CardTitle>
            <div className="space-y-4">
              <Input
                placeholder="New Category (e.g. Rabbit)"
                className="h-12 rounded-xl bg-gray-800 border-none text-white placeholder:text-gray-500"
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
              />
              <Button className="w-full h-12 bg-blue-600 text-white rounded-xl font-bold">Add Global Type</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, val, icon: Icon, color, bg }) {
  return (
    <Card className="rounded-2xl border-none shadow-sm p-6 flex items-center gap-4">
      <div className={`${bg} ${color} p-3 rounded-2xl`}><Icon className="h-6 w-6" /></div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-2xl text-center font-black text-gray-900">{val}</p>
      </div>
    </Card>
  );
}