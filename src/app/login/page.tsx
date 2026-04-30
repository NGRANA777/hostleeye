"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    
    const data = await res.json();
    if (res.ok) {
      router.push("/");
    } else {
      setError(data.error || "Login Failed");
    }
  };

  const handleSetup = async () => {
    const res = await fetch("/api/auth/setup");
    const data = await res.json();
    if (res.ok) {
        alert(data.message);
    } else {
        alert(data.error || data.message || "Setup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-white">
        <CardHeader className="space-y-2 flex flex-col items-center pb-6">
          <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-2">
            <ShieldAlert className="w-6 h-6 text-blue-500" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">HostelEYE Admin</CardTitle>
          <CardDescription className="text-zinc-400">Sign in to the security dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Username</label>
              <input 
                type="text" 
                required
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Password</label>
              <input 
                type="password" 
                required
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            
            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors mt-6"
            >
              Sign In
            </button>

            <button 
              type="button" 
              onClick={handleSetup}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium py-2 px-4 rounded-md transition-colors mt-2"
            >
              Run Initial Setup (Creates Admin)
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
