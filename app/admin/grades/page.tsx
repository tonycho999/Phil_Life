"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Trash2, Plus, AlertCircle } from "lucide-react";

export default function GradePolicyPage() {
  const supabase = createClient();
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 입력 폼 상태
  const [newLevel, setNewLevel] = useState("");
  const [newName, setNewName] = useState("");
  const [newPoint, setNewPoint] = useState("");
  const [isManual, setIsManual] = useState(false); // 체크하면 true(수동)

  // 1. 목록 불러오기
  const fetchPolicies = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("grade_policies")
      .select("*")
      .order("level", { ascending: true });

    if (error) {
      console.error("에러:", error);
    } else {
      setPolicies(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  // 2. 추가하기
  const handleAdd = async () => {
    if (!newLevel || !newName) {
      alert("레벨과 등급 이름은 필수입니다.");
      return;
    }

    const levelNum = parseInt(newLevel);
    const pointNum = newPoint ? parseInt(newPoint) : 0;

    // 중복 체크
    if (policies.find((p) => p.level === levelNum)) {
      alert("이미 존재하는 레벨입니다.");
      return;
    }

    // ★ DB에 'is_manual' 컬럼으로 저장
    const { error } = await supabase.from("grade_policies").insert({
      level: levelNum,
      name: newName,
      min_point: pointNum,
      is_manual: isManual, // true면 수동, false면 자동
    });

    if (error) {
      alert("추가 실패: " + error.message);
    } else {
      setNewLevel("");
      setNewName("");
      setNewPoint("");
      setIsManual(false);
      fetchPolicies();
    }
  };

  // 3. 삭제하기
  const handleDelete = async (level: number) => {
    if (!confirm(`레벨 ${level} 정책을 삭제하시겠습니까?`)) return;

    const { error } = await supabase
      .from("grade_policies")
      .delete()
      .eq("level", level);

    if (error) {
      alert("삭제 실패: " + error.message);
    } else {
      fetchPolicies();
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">등급(레벨) 정책 관리</h1>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8 text-sm text-gray-600 space-y-2">
        <p className="flex items-center gap-2">
          <AlertCircle size={16} className="text-blue-600"/>
          <strong>자동 승급:</strong> 포인트 달성 시 자동 승급 (is_manual = false)
        </p>
        <p className="flex items-center gap-2">
          <AlertCircle size={16} className="text-blue-600"/>
          <strong>수동 전용:</strong> 관리자가 직접 지정해야 함 (is_manual = true)
        </p>
      </div>

      {/* 입력 폼 */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">레벨(숫자)</label>
          <input
            type="number"
            value={newLevel}
            onChange={(e) => setNewLevel(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-24 text-sm focus:outline-none focus:border-blue-500"
            placeholder="5"
          />
        </div>
        
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-bold text-gray-500 mb-1">등급 이름</label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full text-sm focus:outline-none focus:border-blue-500"
            placeholder="우수회원"
          />
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-bold text-gray-500 mb-1">승급 포인트</label>
          <input
            type="number"
            value={newPoint}
            onChange={(e) => setNewPoint(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full text-sm focus:outline-none focus:border-blue-500"
            placeholder="1000"
            disabled={isManual} 
          />
        </div>

        <div className="pb-3 flex items-center gap-2 cursor-pointer" onClick={() => setIsManual(!isManual)}>
          <div className={`w-5 h-5 rounded border flex items-center justify-center ${isManual ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
            {isManual && <span className="text-white text-xs">✔</span>}
          </div>
          <span className="text-sm text-gray-700 select-none">수동 전용</span>
        </div>

        <button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition"
        >
          <Plus size={16} /> 추가
        </button>
      </div>

      {/* 리스트 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">레벨</th>
              <th className="px-6 py-4">이름</th>
              <th className="px-6 py-4">승급 조건 (포인트)</th>
              <th className="px-6 py-4 text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
               <tr><td colSpan={4} className="p-8 text-center text-gray-400">로딩 중...</td></tr>
            ) : policies.length === 0 ? (
               <tr><td colSpan={4} className="p-8 text-center text-gray-400">등록된 정책이 없습니다.</td></tr>
            ) : (
              policies.map((p) => (
                <tr key={p.level} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-blue-600 text-lg">{p.level}</td>
                  <td className="px-6 py-4 font-bold text-gray-700">{p.name}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {/* ★ is_manual 값에 따라 표시 변경 */}
                    {p.is_manual ? (
                      <span className="inline-block bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded font-bold border border-orange-200">
                        🛡 관리자 수동 승급 전용
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        ⚡ {p.min_point?.toLocaleString()} P 달성 시
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(p.level)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                    >
                      <Trash2 size={16} />
                    </button>
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
