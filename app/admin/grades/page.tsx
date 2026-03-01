"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Trash2, ShieldCheck, Zap } from "lucide-react";

interface GradePolicy {
  id: string;
  level: number;
  label: string;
  min_points: number;
  is_manual: boolean; // ★ 수동 여부 필드 추가
}

export default function GradePolicyPage() {
  const supabase = createClient();
  const [policies, setPolicies] = useState<GradePolicy[]>([]);
  const [loading, setLoading] = useState(false);

  // 입력 폼 상태
  const [level, setLevel] = useState("");
  const [label, setLabel] = useState("");
  const [minPoints, setMinPoints] = useState("");
  const [isManual, setIsManual] = useState(false); // ★ 수동 체크 상태

  // 목록 불러오기
  const fetchPolicies = async () => {
    const { data } = await supabase
      .from("grade_policies")
      .select("*")
      .order("level", { ascending: true });
    if (data) setPolicies(data);
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  // 등급 추가
  const handleAdd = async () => {
    if (!level || !label) return alert("레벨과 이름을 입력해주세요.");
    // 수동이 아니면 포인트 필수
    if (!isManual && !minPoints) return alert("승급 포인트를 입력해주세요.");

    setLoading(true);

    const { error } = await supabase.from("grade_policies").insert({
      level: Number(level),
      label,
      min_points: isManual ? 999999999 : Number(minPoints), // 수동이면 포인트는 의미 없게 큰 값 혹은 0 처리 (DB 로직에 따라 다름, 여기선 안전하게 저장)
      is_manual: isManual, // ★ 핵심: 수동 여부 저장
    });

    if (error) {
      alert("추가 실패 (레벨 중복 등): " + error.message);
    } else {
      // 초기화
      setLevel("");
      setLabel("");
      setMinPoints("");
      setIsManual(false);
      fetchPolicies();
    }
    setLoading(false);
  };

  // 등급 삭제
  const handleDelete = async (id: string) => {
    if (!confirm("삭제하시겠습니까?")) return;
    await supabase.from("grade_policies").delete().eq("id", id);
    fetchPolicies();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">등급(레벨) 정책 관리</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <p className="text-sm text-gray-500 mb-4">
          * <strong>자동 승급:</strong> 회원이 포인트를 달성하면 자동으로 등급이 오릅니다.<br/>
          * <strong>수동 전용:</strong> 포인트가 아무리 많아도 오를 수 없으며, 관리자가 직접 지정해야 합니다. (예: 관리자, 특별회원)
        </p>

        {/* 입력 폼 */}
        <div className="flex flex-wrap items-end gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="w-24">
            <label className="block text-xs font-bold text-gray-500 mb-1">레벨(숫자)</label>
            <input 
              type="number" 
              className="w-full p-2 border rounded text-sm" 
              placeholder="예: 5"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            />
          </div>
          
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-bold text-gray-500 mb-1">등급 이름</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded text-sm" 
              placeholder="예: 우수회원"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-bold text-gray-500 mb-1">승급 포인트</label>
            <input 
              type="number" 
              className={`w-full p-2 border rounded text-sm ${isManual ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : ''}`}
              placeholder={isManual ? "설정 불가" : "예: 1000"}
              value={minPoints}
              onChange={(e) => setMinPoints(e.target.value)}
              disabled={isManual}
            />
          </div>

          {/* ★ 수동 체크박스 */}
          <div className="flex items-center h-10 px-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                    type="checkbox" 
                    className="w-4 h-4 text-blue-600 rounded"
                    checked={isManual}
                    onChange={(e) => setIsManual(e.target.checked)}
                />
                <span className="text-sm font-bold text-gray-700">수동 전용</span>
            </label>
          </div>

          <button 
            onClick={handleAdd} 
            disabled={loading}
            className="bg-blue-600 text-white px-5 py-2 rounded font-bold text-sm hover:bg-blue-700 transition h-10"
          >
            추가
          </button>
        </div>
      </div>

      {/* 리스트 테이블 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase">
                <tr>
                    <th className="px-6 py-3">레벨</th>
                    <th className="px-6 py-3">이름</th>
                    <th className="px-6 py-3">승급 조건 (포인트)</th>
                    <th className="px-6 py-3 text-right">관리</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {policies.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">등록된 등급 정책이 없습니다.</td></tr>
                ) : (
                    policies.map((policy) => (
                        <tr key={policy.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-bold text-blue-600">{policy.level}</td>
                            <td className="px-6 py-4 font-medium text-gray-800">{policy.label}</td>
                            <td className="px-6 py-4 text-sm">
                                {policy.is_manual ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 font-bold text-xs">
                                        <ShieldCheck size={12} /> 관리자 수동 승급 전용
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 text-gray-600 font-mono">
                                        <Zap size={12} className="text-yellow-500" />
                                        {policy.min_points.toLocaleString()} P 달성 시
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button 
                                    onClick={() => handleDelete(policy.id)}
                                    className="text-red-400 hover:text-red-600 p-2 rounded hover:bg-red-50 transition"
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
