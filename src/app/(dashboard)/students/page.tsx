"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/students")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStudents(data.data);
        }
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8 space-y-8 min-h-screen text-white">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
        <Link href="/students/add">
          <button className="bg-blue-600 hover:bg-blue-700 font-medium px-4 py-2 rounded transition text-sm">
            Add Hosteller
          </button>
        </Link>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle>Registered Hostellers ({students.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                <TableHead className="text-zinc-400">ID</TableHead>
                <TableHead className="text-zinc-400">Name</TableHead>
                <TableHead className="text-zinc-400">Room</TableHead>
                <TableHead className="text-zinc-400">Embeddings</TableHead>
                <TableHead className="text-zinc-400">Added</TableHead>
                <TableHead className="text-zinc-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && <TableRow><TableCell colSpan={6} className="text-center text-zinc-500">Loading...</TableCell></TableRow>}
              {!loading && students.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-zinc-500">No students registered.</TableCell></TableRow>}
              {students.map((student) => (
                <TableRow key={student._id} className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableCell className="font-medium text-white">{student.studentId}</TableCell>
                  <TableCell className="text-white">{student.name}</TableCell>
                  <TableCell className="text-white">{student.roomNumber}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium">
                      {student.embeddings?.length || 0} faces
                    </span>
                  </TableCell>
                  <TableCell className="text-zinc-400">{formatDistanceToNow(new Date(student.createdAt), { addSuffix: true })}</TableCell>
                  <TableCell className="text-right">
                    <button className="text-sm text-red-500 hover:text-red-400 transition" onClick={async () => {
                      if(confirm('Delete student?')) {
                        await fetch(`/api/students/${student._id}`, { method: 'DELETE' });
                        setStudents(prev => prev.filter(s => s._id !== student._id));
                      }
                    }}>Remove</button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
