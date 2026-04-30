"use client"
import { Users, Camera, History, Settings, ShieldAlert, LayoutDashboard, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Students", href: "/students", icon: Users },
  { name: "Cameras", href: "/camera", icon: Camera },
  { name: "Attendance", href: "/attendance", icon: History },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 border-r border-zinc-800 bg-zinc-950 flex flex-col h-screen fixed">
      <div className="p-6 flex items-center space-x-3">
        <ShieldAlert className="w-8 h-8 text-blue-500" />
        <span className="text-xl font-extrabold tracking-tight text-white">HostelEYE</span>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} className={cn(
              "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium",
              isActive 
                ? "bg-blue-600/10 text-blue-400 border border-blue-600/20" 
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
            )}>
              <Icon className="w-5 h-5" />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <button 
          onClick={async () => {
            
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/login';
          }}
          className="flex items-center space-x-3 text-zinc-400 hover:text-white px-4 py-3 rounded-lg hover:bg-zinc-800/50 transition-colors w-full text-left"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Log out</span>
        </button>
      </div>
    </div>
  );
}
