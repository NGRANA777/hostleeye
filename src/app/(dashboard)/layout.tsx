import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden text-zinc-100">
      <Sidebar />
      <div className="flex-1 ml-64 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
