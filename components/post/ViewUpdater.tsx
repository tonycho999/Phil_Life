"use client";

import { useEffect, useRef } from "react";
import { incrementView } from "@/app/actions/postActions";

export default function ViewUpdater({ postId }: { postId: string }) {
  const hasFired = useRef(false);

  useEffect(() => {
    if (!hasFired.current) {
      hasFired.current = true;
      // 서버 액션 호출 (성공/실패 여부를 굳이 화면에 띄우지 않고 조용히 처리합니다)
      incrementView(postId);
    }
  }, [postId]);

  return null;
}
