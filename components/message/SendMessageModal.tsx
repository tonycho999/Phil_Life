"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom"; // ★ 1. 팝업을 맨 앞으로 빼낼 포탈(Portal) 소환!
import { createClient } from "@/lib/supabase";
import { X, Send, Reply } from "lucide-react";

export default function SendMessageModal({ isOpen, onClose, receiverId, receiverNickname, isReply = false }: any) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [mounted, setMounted] = useState(false); // ★ 2. 브라우저 렌더링 확인용 상태 추가
  const supabase = createClient();

  // ★ 3. 에러 방지: 컴포넌트가 브라우저에 마운트된 후에만 팝업을 띄우도록 설정
  useEffect(() => {
    setMounted(true);
  }, []);

  // isOpen이 false거나, 아직 마운트되지 않았으면 렌더링하지 않음
  if (!isOpen || !mounted) return null;

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
      alert(`${receiverNickname}님에게 ${isReply ? '답장' : '쪽지'}를 보냈습니다!`);
      setContent("");
      onClose();
    }
    setIsSending(false);
  };

  // ★ 4. createPortal을 사용해 팝업창 전체를 document.body(화면 최상단)로 순간이동!
  return createPortal(
    // (기존 오타였던 'z- flex' 부분을 'flex'로 깔끔하게 수정했습니다.)
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        
        {/* 헤더 */}
        <div className="bg-gray-50 px-5 py-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            {isReply ? <Reply size={18} className="text-green-600" /> : <Send size={18} className="text-blue-600" />}
            {isReply ? "답장 보내기" : "쪽지 보내기"}
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
            className={`px-6 py-2 text-sm font-bold text-white rounded-lg transition disabled:opacity-50 flex items-center gap-2 ${isReply ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isSending ? "전송 중..." : "보내기"}
          </button>
        </div>
        
      </div>
    </div>,
    document.body // ★ 포탈의 도착지: HTML의 최상위 body 태그!
  );
}
