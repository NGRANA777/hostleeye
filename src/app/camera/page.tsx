"use client";

import React, { useEffect, useRef, useState } from "react";
import { loadModels, getFaceDescriptor, matchFace } from "@/utils/faceApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "lucide-react";

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [status, setStatus] = useState<string>("Initializing...");
  
  const lastAttemptRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    const init = async () => {
      
      setStatus("Loading Face Models...");
      const loaded = await loadModels();
      setIsModelLoaded(loaded);
      
      
      const res = await fetch("/api/students");

      const json = await res.json();
      if (json.success) {
        setStudents(json.data.map((s: any) => ({
          id: s._id,
          name: s.name,
          embeddings: s.embeddings
        })));
      }
      
     
      startVideo();
    };
    init();
  }, []);

  const startVideo = () => {
    setStatus("Starting Camera...");
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        if(videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStatus("Camera Active & Scanning");
      })
      .catch((err) => {
        console.error("Error accessing webcam:", err);
        setStatus("Camera Access Denied");
      });
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleVideoPlay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(async () => {
      if (!isModelLoaded || !videoRef.current) return;
      
      const detection = await getFaceDescriptor(videoRef.current);
      
      if (detection) {
        
        const match = matchFace(detection.descriptor, students, 0.55);
        
        const now = Date.now();
        if (now - lastAttemptRef.current > 5000) {
          lastAttemptRef.current = now;
          
          if (match) {
            // Log matching face detection
            await fetch("/api/detect", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "AUTHORIZED",
                location: "Main Entrance",
                studentId: match.id,
                status: "SAFE",
              }),
            });

            // Mark Attendance
            try {
              const attRes = await fetch("/api/attendance/mark", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: match.id }),
              });
              const attJson = await attRes.json();
              if (attJson.success) {
                console.log("Attendance Status:", attJson.alreadyMarked ? "Already Marked" : "Recorded Successfully");
              }
            } catch (err) {
              console.error("Failed to mark attendance:", err);
            }
          } else {
            console.log("Unauthorized Intruder Detected!");
            
            
            const canvas = document.createElement("canvas");
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
            const snapshot = canvas.toDataURL("image/jpeg", 0.5);
           
            await fetch("/api/detect", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "UNAUTHORIZED",
                location: "Main Entrance",
                snapshotData: snapshot,
                status: "PENDING",
              }),
            });
          }
        }
      }
    }, 100); 
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black/95 text-white p-4">
      <Card className="w-full max-w-2xl bg-zinc-900 border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Edge Camera Node</CardTitle>
          <Badge variant={status.includes("Active") ? "default" : "secondary"}>
            {status}
          </Badge>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-zinc-800">
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              className="absolute inset-0 w-full h-full object-cover"
              onPlay={handleVideoPlay}
            />
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
          </div>
          <p className="mt-4 text-sm text-zinc-400">Position face within frame to scan automatically.</p>
        </CardContent>
      </Card>
      <Link href="/"> <button className="bg-black border-1 border-white rounded-md text-white font-extrabold h-20">Admin Dashboard</button></Link>
    </div>
  );
}
