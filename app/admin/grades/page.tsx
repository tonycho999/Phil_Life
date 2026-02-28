"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export default function AdminGradesPage() {
  const supabase = createClient();
  const [grades, setGrades] = useState<any[]>([]);
  
  // 입력 폼
  const [newLevel, setNewLevel] = useState("");
  const [newName, setNewName] = useState("");
  const [newPoint, setNewPoint] = useState("");

  const fetchGrades = async () => {
    const { data } = await supabase.from("grade_policies").select("*").order("level");
    if (data) setGrades(data);
  };

  useEffect(() => {
    fetchGrades();
  }, []);

  const handleAdd = async () => {
    if (!newLevel || !newName) return alert("레벨과 이름을 입력하세요.");
    
    const { error } = await supabase.from("grade_policies").insert({
      level: Number(newLevel),
      name: newName,
      min_points: Number(newPoint) || 0
    });

    if (error) alert("추가 실패 (중복 레벨 등): " + error.message);
    else {
      setNewLevel(""); setNewName(""); setNewPoint("");
      fetchGrades();
    }
  };

  const handleDelete = async (level: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const { error } = await supabase.from("grade_policies").delete().eq("level", level);
    if (!error) fetchGrades();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
      <h2 className="text-xl font-bold mb-4">등급(레벨) 정책 관리</h2>
      <p className="text-sm text-gray-500 mb-6">
        * 회원이 일정 포인트에 도달하면 해당 등급으로 자동 승급되도록 설정할 수 있습니다.
      </p>

      {/* 추가 폼 */}
      <div className="flex gap-2 mb-6 bg-gray-50 p-4 rounded">
        <input 
          type="number" placeholder="레벨(숫자)" 
          className="border p-2 rounded w-24 text-sm"
          value={newLevel} onChange={(e) => setNewLevel(e.target.value)}
        />
        <input 
          type="text" placeholder="등급 이름 (예: 우수회원)" 
          className="border p-2 rounded flex-1 text-sm"
          value={newName} onChange={(e) => setNewName(e.target.value)}
        />
        <input 
          type="number" placeholder="승급 포인트 (0=수동)" 
          className="border p-2 rounded w-32 text-sm"
          value={newPoint} onChange={(e) => setNewPoint(e.target.value)}
        />
        <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold">
          추가
        </button>
      </div>

      {/* 리스트 */}
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-100 uppercase font-bold text-gray-700">
          <tr>
            <th className="px-4 py-3">레벨</th>
            <th className="px-4 py-3">이름</th>
            <th className="px-4 py-3">자동 승급 포인트</th>
            <th className="px-4 py-3">삭제</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {grades.map((g) => (
            <tr key={g.level}>
              <td className="px-4 py-3 font-bold">{g.level}</td>
              <td className="px-4 py-3">{g.name}</td>
              <td className="px-4 py-3">
                {g.min_points > 0 ? `${g.min_points.toLocaleString()} P` : "수동 등급"}
              </td>
              <td className="px-4 py-3">
                <button onClick={() => handleDelete(g.level)} className="text-red-500 hover:underline">
                  삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
