"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { MENUS, GRADE_LEVELS } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

export default function AdminPage() {
  const supabase = createClient();
  const { profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  // 모든 서브 메뉴 ID 추출
  const allSubMenus = MENUS.flatMap((m) => m.sub.map((s) => ({ ...s, parent: m.label })));
  const gradeOptions = Object.keys(GRADE_LEVELS).reverse(); // 높은 등급부터 표시

  useEffect(() => {
    if (!authLoading) {
        if (!profile || profile.grade !== "관리자") {
            alert("관리자만 접근 가능합니다.");
            router.push("/");
        } else {
            fetchSettings();
        }
    }
  }, [profile, authLoading, router]);

  const fetchSettings = async () => {
    const { data } = await supabase.from("board_settings").select("*");
    const map: any = {};
    if (data) {
        data.forEach((row) => (map[row.board_id] = row));
    }
    setSettings(map);
  };

  const handleUpdate = async (boardId: string, field: "write_grade" | "comment_grade", value: string) => {
    setLoading(true);
    
    // 현재 설정값 복사 혹은 기본값 생성
    const currentSetting = settings[boardId] || { board_id: boardId, write_grade: '새싹', comment_grade: '새싹' };
    const newSetting = { ...currentSetting, [field]: value };
    
    const { error } = await supabase
      .from("board_settings")
      .upsert(newSetting)
      .select();

    if (!error) {
      setSettings((prev) => ({ ...prev, [boardId]: newSetting }));
    } else {
      alert("저장 실패: " + error.message);
    }
    setLoading(false);
  };

  if (authLoading || profile?.grade !== "관리자") return <div className="p-10 text-center">권한 확인 중...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">⚙️ 게시판 권한 관리</h1>
      <p className="mb-4 text-sm text-gray-500">각 게시판별 글쓰기 및 댓글 작성 가능한 최소 등급을 설정하세요.</p>
      
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase font-bold text-xs">
            <tr>
              <th className="px-6 py-3">게시판 (대분류)</th>
              <th className="px-6 py-3">게시판 이름</th>
              <th className="px-6 py-3">글쓰기 최소 등급</th>
              <th className="px-6 py-3">댓글 최소 등급</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {allSubMenus.map((menu) => (
              <tr key={menu.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-500">{menu.parent}</td>
                <td className="px-6 py-4 font-bold text-gray-800">{menu.label}</td>
                <td className="px-6 py-4">
                  <select
                    className="border border-gray-300 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={settings[menu.id]?.write_grade || "새싹"}
                    onChange={(e) => handleUpdate(menu.id, "write_grade", e.target.value)}
                    disabled={loading}
                  >
                    {gradeOptions.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </td>
                <td className="px-6 py-4">
                  <select
                    className="border border-gray-300 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={settings[menu.id]?.comment_grade || "새싹"}
                    onChange={(e) => handleUpdate(menu.id, "comment_grade", e.target.value)}
                    disabled={loading}
                  >
                    {gradeOptions.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
