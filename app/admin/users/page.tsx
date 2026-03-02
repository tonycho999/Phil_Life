"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Search, UserCog, ShieldAlert } from "lucide-react";

export default function UserManagementPage() {
  const supabase = createClient();
  const [users, setUsers] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any[]>([]); // ★ 등급 정책 담을 곳
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // 1. 데이터 불러오기 (회원 목록 + 등급 정책 병렬 조회)
  const fetchData = async () => {
    setLoading(true);

    // 1-1. 회원 목록 조회
    let userQuery = supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (search) {
      userQuery = userQuery.ilike("nickname", `%${search}%`);
    }

    // 1-2. 등급 정책 조회 (여기가 핵심)
    const policyQuery = supabase
      .from("grade_policies")
      .select("*")
      .order("level", { ascending: true });

    // 두 가지 데이터를 동시에 가져옴
    const [userRes, policyRes] = await Promise.all([userQuery, policyQuery]);

    if (userRes.error) console.error("회원 조회 에러:", userRes.error);
    else setUsers(userRes.data || []);

    if (policyRes.error) console.error("정책 조회 에러:", policyRes.error);
    else setPolicies(policyRes.data || []);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []); // 처음 한 번만 실행 (검색 버튼 누르면 fetchData 다시 호출)

  // 2. 레벨 변경 함수
  const handleLevelChange = async (userId: string, newLevel: number) => {
    // 변경하려는 레벨에 맞는 등급 이름 찾기 (DB 정책에서 검색)
    const targetPolicy = policies.find((p) => p.level === newLevel);
    const newGradeName = targetPolicy ? targetPolicy.name : "알수없음";

    // 낙관적 업데이트 (화면 먼저 반영)
    setUsers(users.map(u => u.id === userId ? { ...u, level: newLevel, grade: newGradeName } : u));

    const { error } = await supabase
      .from("profiles")
      .update({ 
        level: newLevel,
        grade: newGradeName // ★ 정책에 있는 이름으로 정확하게 업데이트
      })
      .eq("id", userId);

    if (error) {
      alert("변경 실패: " + error.message);
      fetchData(); // 실패 시 원상복구
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <UserCog size={24} /> 회원 관리
      </h1>

      {/* 검색창 */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchData()}
          placeholder="닉네임 검색"
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
        />
        <button 
          onClick={fetchData}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Search size={16} /> 검색
        </button>
      </div>

      {/* 회원 리스트 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">닉네임</th>
              <th className="px-6 py-4">현재 등급 (Lv)</th>
              <th className="px-6 py-4">포인트</th>
              <th className="px-6 py-4">가입일</th>
              <th className="px-6 py-4">등급 변경</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
               <tr><td colSpan={5} className="p-8 text-center">로딩 중...</td></tr>
            ) : users.length === 0 ? (
               <tr><td colSpan={5} className="p-8 text-center text-gray-400">회원이 없습니다.</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-gray-800 flex items-center gap-2">
                    {/* 관리자급(보통 10이상)이면 빨간 아이콘 표시 */}
                    {user.level >= 10 && <ShieldAlert size={14} className="text-red-500"/>}
                    {user.nickname || "닉네임 없음"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${user.level >= 10 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                      Lv.{user.level} {user.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-blue-600 font-medium">
                    {user.point?.toLocaleString()} P
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {/* ★ 수정됨: 하드코딩된 option 대신 DB에서 가져온 policies를 map으로 뿌려줌 */}
                    <select
                      value={user.level}
                      onChange={(e) => handleLevelChange(user.id, parseInt(e.target.value))}
                      className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      {policies.length === 0 ? (
                         <option value={user.level}>Lv.{user.level} (현재)</option>
                      ) : (
                        policies.map((p) => (
                          <option key={p.level} value={p.level}>
                            Lv.{p.level} ({p.name})
                          </option>
                        ))
                      )}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
