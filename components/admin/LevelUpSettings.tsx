"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Settings } from "lucide-react";

export default function LevelUpSettings() {
  const supabase = createClient();
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [loading, setLoading] = useState(false);

  // 설정 불러오기
  useEffect(() => {
    const fetchConfig = async () => {
      const { data } = await supabase.from("site_config").select("value").eq("key", "level_up_mode").single();
      if (data) setMode(data.value as "auto" | "manual");
    };
    fetchConfig();
  }, []);

  // 설정 저장
  const handleSave = async (newMode: "auto" | "manual") => {
    setLoading(true);
    const { error } = await supabase
      .from("site_config")
      .upsert({ key: "level_up_mode", value: newMode });
    
    if (!error) {
      setMode(newMode);
      alert(`등업 방식이 '${newMode === "auto" ? "자동" : "수동"}'으로 변경되었습니다.`);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        <Settings size={20} /> 등업 방식 설정
      </h3>
      <div className="flex gap-4">
        <button
          onClick={() => handleSave("auto")}
          disabled={loading}
          className={`flex-1 py-4 rounded-lg border-2 font-bold transition ${
            mode === "auto" 
              ? "border-blue-600 bg-blue-50 text-blue-700" 
              : "border-gray-200 hover:border-gray-300 text-gray-500"
          }`}
        >
          🤖 자동 등업
          <p className="text-xs font-normal mt-1 opacity-70">조건 충족 시 즉시 등업</p>
        </button>

        <button
          onClick={() => handleSave("manual")}
          disabled={loading}
          className={`flex-1 py-4 rounded-lg border-2 font-bold transition ${
            mode === "manual" 
              ? "border-blue-600 bg-blue-50 text-blue-700" 
              : "border-gray-200 hover:border-gray-300 text-gray-500"
          }`}
        >
          🙋‍♂️ 수동 등업
          <p className="text-xs font-normal mt-1 opacity-70">관리자가 승인해야 등업</p>
        </button>
      </div>
    </div>
  );
}
