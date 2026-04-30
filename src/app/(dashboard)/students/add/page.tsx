"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { loadModels, getFaceDescriptor } from "@/utils/faceApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, CheckCircle2, UserPlus, Loader2 } from "lucide-react";

export default function AddStudentPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [descriptor, setDescriptor] = useState<Float32Array | null>(null);
  
  const [formData, setFormData] = useState({
    studentId: "",
    name: "",
    roomNumber: "",
  });
  
  const [status, setStatus] = useState("Initializing models...");
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const init = async () => {
      setStatus("Loading Face Models...");
      const loaded = await loadModels();
      setIsModelLoaded(loaded);
      startVideo();
    };
    init();
  }, []);

  const startVideo = () => {
    setStatus("Camera Initializing...");
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        if(videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStatus("Ready to scan");
      })
      .catch((err) => {
        console.error("Error accessing webcam:", err);
        setStatus("Camera Access Denied");
      });
  };

  const captureFace = async () => {
    if (!isModelLoaded || !videoRef.current) return;
    setStatus("Scanning face...");
    try {
      const detection = await getFaceDescriptor(videoRef.current);
      if (detection) {
        setDescriptor(detection.descriptor);
        setStatus("Face captured successfully!");
      } else {
        setStatus("No face detected. Try again.");
      }
    } catch (e) {
      console.error(e);
      setStatus("Error scanning face");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descriptor) {
      alert("Please capture a face first.");
      return;
    }
    setLoading(true);
    
    try {
      // Create a 2D array wrapping the 1D Float32Array as the database expects [[Number]]
      const embeddingsArray = [Array.from(descriptor)];
      
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          embeddings: embeddingsArray
        }),
      });
      
      const json = await res.json();
      if (json.success) {
        router.push("/students");
      } else {
        alert(json.error || "Failed to register hosteller");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Server error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 min-h-screen text-white">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Register New Hosteller</h1>
        <button onClick={() => router.back()} className="text-zinc-400 hover:text-white transition">Cancel</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>Hosteller Identity</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Student ID</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition" 
                  placeholder="e.g. 2024CS001"
                  value={formData.studentId}
                  onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Full Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition" 
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Room Number</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition" 
                  placeholder="e.g. B-101"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
                />
              </div>

              <div className="pt-4 border-t border-zinc-800">
                <button 
                  type="submit" 
                  disabled={!descriptor || loading}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-800 disabled:text-zinc-500 font-medium px-4 py-3 rounded transition"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                  Register Hosteller
                </button>
                {!descriptor && (
                  <p className="text-xs text-red-500 mt-2 text-center">You must capture a face first to register.</p>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Biometric Face Scan</CardTitle>
            <Badge variant={descriptor ? "default" : "secondary"} className={descriptor ? "bg-green-600" : ""}>
              {status}
            </Badge>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-zinc-800 mb-6">
              <video 
                ref={videoRef} 
                autoPlay 
                muted 
                className="absolute inset-0 w-full h-full object-cover"
              />
              {descriptor && (
                <div className="absolute inset-0 bg-green-500/20 flex flex-col items-center justify-center backdrop-blur-sm z-10 transition-opacity">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mb-2 drop-shadow-lg" />
                  <p className="font-bold text-green-400 drop-shadow-md">Face Verified</p>
                </div>
              )}
            </div>
            
             <button 
               type="button"
               onClick={captureFace}
               className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 font-medium px-6 py-3 rounded-full transition relative z-20"
             >
               <Camera className="w-5 h-5" />
               {descriptor ? "Retake Scan" : "Scan Face"}
             </button>
             <p className="mt-4 text-xs text-zinc-500 text-center max-w-sm">
               Position hosteller directly in front of the camera with good lighting. Biometric data is converted instantly to mathematical embeddings securely.
             </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
