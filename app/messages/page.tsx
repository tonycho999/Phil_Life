"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { Trash2, MailOpen, Mail, ChevronDown, ChevronUp } from "lucide-react";

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const supabase = createClient();
  const router = useRouter();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      alert("로그인이 필요한 페이지입니다.");
      router.push("/login");
      return;
    }
    fetchMessages();
  }, [user, authLoading]);

  const fetchMessages = async () => {
    setLoading(true);
    // 1. 내 쪽지 가져오기
    const { data: msgs } = await supabase
      .from("messages")
      .select("*")
      .eq("receiver_id", user?.id)
      .order("created_at", { ascending: false });

    if (msgs && msgs.length > 0) {
      // 2. 보낸 사람 닉네임 가져오기 (수동 조인)
      const senderIds = [...new Set(msgs.map(m => m.sender_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, nickname")
        .in("id", senderIds);

      const profileMap: any = {};
      profiles?.forEach(p => { profileMap[p.id] = p; });

      const merged = msgs.map(m => ({
        ...m,
        sender: profileMap[m.sender_id] || { nickname: "알 수 없는 유저" }
      }));
      setMessages(merged);
    }
    setLoading(false);
  };

  // 쪽지 읽음 처리 로직
  const toggleMessage = async (msgId: string, isRead: boolean) => {
    if (expandedId === msgId) {
      setExpandedId(null); // 이미 열려있으면 닫기
      return;
    }
    setExpandedId(msgId); // 열기

    // 안 읽은 쪽지였다면 읽음 처리
    if (!isRead) {
      setMessages(messages.map(m => m.id === msgId ? { ...m, is_read: true } : m));
      await supabase.from("messages").update({ is_read: true }).eq("id", msgId);
      router.refresh(); // 사이드바 숫자 업데이트를 위한 새로고침 힌트
    }
  };

  // ★ 쪽지 삭제 로직
  const handleDelete = async (e: any, msgId: string) => {
    e.stopPropagation(); // 삭제 버튼 누를 때 쪽지가 열리거나 닫히는 현상 방지
    if (!confirm("이 쪽지를 삭제하시겠습니까? (복구할 수 없습니다)")) return;

    // UI에서 즉시 제거
    setMessages(messages.filter(m => m.id !== msgId));
    // DB에서 삭제
    await supabase.from("messages").delete().eq("id", msgId);
    router.refresh();
  };

  if (loading) return <div className="p-10 text-center text-gray-500">쪽지함을 불러오는 중입니다...</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">
      <div className="bg-blue-600 px-6 py-5 text-white flex items-center gap-3">
        <Mail size={24} />
        <h2 className="text-xl font-bold">내 쪽지함</h2>
      </div>

      <div className="divide-y divide-gray-100">
        {messages.length === 0 ? (
          <div className="p-16 text-center text-gray-400">
            받은 쪽지가 없습니다.
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="group">
              {/* 목록 바 (클릭 시 펼쳐짐) */}
              <div 
                onClick={() => toggleMessage(msg.id, msg.is_read)}
                className={`p-4 flex items-center justify-between cursor-pointer transition ${msg.is_read ? 'bg-white hover:bg-gray-50' : 'bg-blue-50/30 hover:bg-blue-50/60'}`}
              >
                <div className="flex items-center gap-4 flex-1">
                  {msg.is_read ? <MailOpen size={18} className="text-gray-400" /> : <Mail size={18} className="text-blue-600 fill-blue-100" />}
                  <div>
                    <p className={`text-sm ${msg.is_read ? 'text-gray-800' : 'text-blue-900 font-bold'}`}>
                      보낸 사람: {msg.sender.nickname}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(msg.created_at).toLocaleString('ko-KR')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {expandedId === msg.id ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                  {/* ★ 삭제 버튼 */}
                  <button 
                    onClick={(e) => handleDelete(e, msg.id)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="삭제"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* 본문 내용 (펼쳐졌을 때만 보임) */}
              {expandedId === msg.id && (
                <div className="p-5 bg-gray-50 border-t border-gray-100 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
