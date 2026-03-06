"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { X, Send } from "lucide-react";

export default function SendMessageModal({ isOpen, onClose, receiverId, receiverNickname }: any) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const supabase = createClient();

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!content.trim()) return alert("내용을 입력해주세요.");
    setIsSending(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("로그인이 필요합니다.");
      setIsSending(false);
      return;
    }

    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: receiverId,
      content: content.trim(),
    });

    if (error) {
      alert("쪽지 전송에 실패했습니다.");
    } else {
      alert(`${receiverNickname}님에게 쪽지를 보냈습니다!`);
      setContent("");
      onClose();
    }
    setIsSending(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        {/* 헤더 */}
        <div className="bg-gray-50 px-5 py-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Send size={18} className="text-blue-600" />
            쪽지 보내기
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition">
            <X size={20} />
          </button>
        </div>

        {/* 본문 */}
        <div className="p-5">
          <p className="text-sm text-gray-600 mb-2">
            받는 사람: <span className="font-bold text-blue-600">{receiverNickname}</span>
          </p>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="따뜻한 말 한마디는 커뮤니티를 훈훈하게 합니다."
            className="w-full h-32 border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
          ></textarea>
        </div>

        {/* 푸터 */}
        <div className="px-5 py-4 bg-gray-50 border-t flex justify-end gap-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            취소
          </button>
          <button 
            onClick={handleSend}
            disabled={isSending}
            className="px-6 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            {isSending ? "전송 중..." : "보내기"}
          </button>
        </div>
      </div>
    </div>
  );
}
