"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShieldAlert, UserCheck, AlertTriangle, Camera } from "lucide-react";

export default function DashboardClient() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [stats, setStats] = useState({ authorized: 0, unauthorized: 0 });

  useEffect(() => {
   
    fetch("/api/logs?limit=20")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAlerts(data.data);
          const authCount = data.data.filter((d: any) => d.type === "AUTHORIZED").length;
          const unauthCount = data.data.filter((d: any) => d.type === "UNAUTHORIZED").length;
          setStats({ authorized: authCount, unauthorized: unauthCount });
        }
      });


    fetch("/api/socket").finally(() => {
      const socket = io({
        path: "/api/socket",
      });

      socket.on("connect", () => {
        console.log("Connected to websocket");
      });

      socket.on("new-alert", (data) => {
        console.log("New alert received:", data);
        if (data.type === "UNAUTHORIZED") {
          
          const audio = new Audio("/alert.mp3");
          audio.play().catch(e => console.error("Audio play failed:", e));
        }
        
        setAlerts((prev) => [data, ...prev].slice(0, 50));
        setStats((prev) => ({
          ...prev,
          [data.type === "AUTHORIZED" ? "authorized" : "unauthorized"]: prev[data.type === "AUTHORIZED" ? "authorized" : "unauthorized"] + 1,
        }));
      });

      return () => {
        socket.disconnect();
      };
    });
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    const res = await fetch(`/api/logs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setAlerts((prev) =>
        prev.map((alert) => (alert._id === id ? { ...alert, status: newStatus } : alert))
      );
    }
  };

  return (
    <div className="p-8 space-y-8 bg-zinc-950 min-h-screen text-white">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Security Overview</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Total Scans (Today)</CardTitle>
            <ShieldAlert className="w-4 h-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.authorized + stats.unauthorized}</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Authorized Entries</CardTitle>
            <UserCheck className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.authorized}</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Unauthorized Alerts</CardTitle>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.unauthorized}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Recent Alerts Panel</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {alerts.filter(a => a.type === "UNAUTHORIZED").length === 0 && (
                  <p className="text-zinc-500 text-sm text-center py-8">No unauthorized entries detected.</p>
                )}
                {alerts
                  .filter((a) => a.type === "UNAUTHORIZED")
                  .map((alert) => (
                    <div key={alert._id} className="flex gap-4 p-4 rounded-lg bg-red-950/20 border border-red-900/40">
                      {alert.snapshotData && (
                        <div className="w-24 h-24 rounded overflow-hidden shrink-0 bg-black">
                          <img src={alert.snapshotData} alt="Snapshot" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between">
                          <Badge variant="destructive">Intrusion Alert</Badge>
                          <span className="text-xs text-zinc-400">
                            {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-300">Location: {alert.location}</p>
                        
                        {alert.status === "PENDING" ? (
                          <div className="flex gap-2 mt-2">
                            <button 
                              onClick={() => handleStatusChange(alert._id, "SAFE")}
                              className="text-xs px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded transition"
                            >
                              Mark Safe
                            </button>
                            <button 
                              onClick={() => handleStatusChange(alert._id, "THREAT")}
                              className="text-xs px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded transition"
                            >
                              Confirm Intruder
                            </button>
                          </div>
                        ) : (
                          <div className="mt-2 text-xs font-semibold px-2 py-1 rounded bg-zinc-800 inline-block w-auto">
                            Status: <span className={alert.status === "SAFE" ? "text-green-400" : "text-red-400"}>{alert.status}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Camera Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-[400px]">
            <div className="w-full h-full bg-black rounded-lg border border-zinc-800 flex items-center justify-center relative overflow-hidden group">
               <Camera className="w-12 h-12 text-zinc-700 mb-4" />
               <p className="absolute bottom-6 text-sm text-zinc-500 font-medium">Camera Feed Active on Edge Node</p>
               <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <a href="/camera" target="_blank" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium shadow-lg hover:bg-blue-700 transition">
                    Open Camera Node
                  </a>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
