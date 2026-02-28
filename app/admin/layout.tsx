"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  // 관리자 체크
  useEffect(() => {
    if (!loading && (!user || (profile?.level || 0) < 10)) {
      alert("관리자만 접근 가능합니다.");
      router.push("/");
    }
  }, [user, profile, loading, router]);

  if (loading) return null;

  const menus = [
    { name: "게시판 관리", path: "/admin/boards" },
    { name: "회원 관리", path: "/admin/users" },
    { name: "등급 설정", path: "/admin/grades" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
      {/* 좌측 관리자 메뉴 */}
      <aside className="w-full md:w-48 shrink-0">
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="bg-gray-800 text-white p-3 font-bold text-center">
            관리자 메뉴
          </div>
          <nav className="flex flex-col">
            {menus.map((menu) => {
              const isActive = pathname === menu.path;
              return (
                <Link
                  key={menu.path}
                  href={menu.path}
                  className={`px-4 py-3 text-sm font-medium transition ${
                    isActive 
                      ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600" 
                      : "text-gray-600 hover:bg-gray-50 border-l-4 border-transparent"
                  }`}
                >
                  {menu.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* 우측 컨텐츠 영역 */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
