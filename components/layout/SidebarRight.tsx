// components/layout/SidebarRight.tsx
import { MapPin, Utensils, Stethoscope, Truck, Plane } from "lucide-react";

export default function SidebarRight() {
  return (
    <aside className="space-y-6">
      {/* 한인업소록 아이콘 */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="font-bold text-gray-800 text-sm mb-3">🏪 한인업소록</h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: "맛집", icon: <Utensils size={18} className="text-orange-500" /> },
            { label: "병원", icon: <Stethoscope size={18} className="text-green-500" /> },
            { label: "이사", icon: <Truck size={18} className="text-blue-500" /> },
            { label: "여행", icon: <Plane size={18} className="text-sky-500" /> },
            { label: "부동산", icon: <MapPin size={18} className="text-red-500" /> },
            { label: "기타", icon: <span className="font-bold text-gray-400">...</span> },
          ].map((item, idx) => (
            <div key={idx} className="p-2 bg-gray-50 rounded hover:bg-blue-50 cursor-pointer transition">
              <div className="mb-1 flex justify-center">{item.icon}</div>
              <div className="text-[10px] text-gray-600">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 실시간 인기글 (더미 데이터) */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="font-bold text-gray-800 text-sm mb-3">🔥 실시간 핫이슈</h3>
        <ul className="space-y-3">
          {[
            "세부 공항 세관 통과 꿀팁 (필독)",
            "현재 환율 56.5 돌파... 송금 타이밍",
            "앙헬레스 OO호텔 조식 비추 후기",
            "은퇴비자 예치금 인상 소식 사실인가요?",
            "중고차 도요타 비오스 시세 질문"
          ].map((title, i) => (
            <li key={i} className="flex gap-2 items-start text-xs cursor-pointer hover:underline">
              <span className="bg-red-500 text-white w-4 h-4 flex items-center justify-center rounded mt-0.5">{i+1}</span>
              <span className="text-gray-700 leading-tight">{title}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
