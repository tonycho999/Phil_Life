"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export default function AdminUsersPage() {
  const supabase = createClient();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    let query = supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (searchTerm) {
      query = query.like("nickname", `%${searchTerm}%`);
    }

    const { data } = await query;
    if (data) setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleLevelChange = async (userId: string, newLevel: number) => {
    if (!confirm("해당 회원의 등급을 변경하시겠습니까?")) return;
    
    const { error } = await supabase
      .from("profiles")
      .update({ level: newLevel })
      .eq("id", userId);

    if (!error) {
      alert("변경되었습니다.");
      fetchUsers();
    } else {
      alert("실패: " + error.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
      <h2 className="text-xl font-bold mb-4">회원 관리</h2>
      
      <div className="flex gap-2 mb-4">
        <input 
          type="text" 
          placeholder="닉네임 검색" 
          className="border p-2 rounded text-sm w-64"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={fetchUsers} className="bg-blue-600 text-white px-4 py-2 rounded text-sm">검색</button>
      </div>

      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-gray-700 uppercase font-bold">
          <tr>
            <th className="px-4 py-3">닉네임</th>
            <th className="px-4 py-3">등급 (Level)</th>
            <th className="px-4 py-3">포인트</th>
            <th className="px-4 py-3">가입일</th>
            <th className="px-4 py-3">관리</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium">{user.nickname}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded text-xs font-bold ${user.level >= 10 ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                  Lv.{user.level}
                </span>
              </td>
              <td className="px-4 py-3 text-blue-600">{user.points?.toLocaleString()} P</td>
              <td className="px-4 py-3 text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
              <td className="px-4 py-3">
                <select 
                  value={user.level}
                  onChange={(e) => handleLevelChange(user.id, Number(e.target.value))}
                  className="border rounded p-1 text-xs"
                >
                  <option value="1">1 (일반)</option>
                  <option value="5">5 (우수)</option>
                  <option value="10">10 (관리자)</option>
                  <option value="99">99 (정지)</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
