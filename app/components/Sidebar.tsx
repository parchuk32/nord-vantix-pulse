"use client";
import { LayoutDashboard, Database, Activity, Camera, Shield } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Terminal', icon: LayoutDashboard, path: '/terminal' },
    { name: 'Intel', icon: Database, path: '/intel' },
    { name: 'Operations', icon: Activity, path: '/ops' },
  ];

  return (
    <aside className="w-20 min-h-screen bg-[#050505] border-r border-[#a855f7]/20 flex flex-col items-center py-8 gap-10">
      <div className="text-[#a855f7] mb-4">
        <Shield size={32} strokeWidth={1.5} className="drop-shadow-[0_0_8px_#a855f7]" />
      </div>

      <nav className="flex flex-col gap-8 flex-1">
        {menuItems.map((item) => (
          <Link key={item.path} href={item.path} title={item.name}
            className={`p-3 rounded-xl transition-all duration-300 group ${
              pathname === item.path ? 'bg-[#a855f7]/10 text-[#a855f7]' : 'text-gray-600 hover:text-[#a855f7]'
            }`}
          >
            <item.icon size={24} strokeWidth={1.5} />
          </Link>
        ))}
      </nav>

      <Link href="/cam?id=OPERATOR" className="p-3 text-gray-600 hover:text-red-500 transition-colors">
        <Camera size={24} strokeWidth={1.5} />
      </Link>
    </aside>
  );
}