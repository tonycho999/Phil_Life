"use client";

import { useEffect, useRef } from "react";
// ★ 방금 만든 서버 액션을 불러옵니다.
import { incrementView } from "@/app/actions/postActions";

export default function ViewUpdater({ postId }: { postId: string }) {
  // 개발 모드에서 2번씩 실행되는 것을 막아주는 안전장치입니다.
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      // 서버 액션 호출! (클라이언트에서 서버로 안전하게 명령 전달)
      incrementView(postId);
      hasFetched.current = true;
    }
  }, [postId]);

  return null;
}
