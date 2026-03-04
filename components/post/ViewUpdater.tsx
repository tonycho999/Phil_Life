"use client";

import { useEffect, useRef } from "react";
import { incrementView } from "@/app/actions/postActions";

export default function ViewUpdater({ postId }: { postId: string }) {
  const hasFired = useRef(false);

  useEffect(() => {
    // 한 번만 실행되도록 막아주는 장치
    if (!hasFired.current) {
      hasFired.current = true;
      
      // 서버 액션 호출!
      incrementView(postId).then((result) => {
        if (!result.success) {
          // ★ 만약 실패했다면 화면에 강제로 팝업을 띄웁니다!
          alert("🚨 조회수 증가 실패 원인: " + result.error);
        } else {
          // 성공했다면 브라우저 개발자 도구(F12) 콘솔에만 조용히 띄웁니다.
          console.log("✅ 조회수 +1 성공!");
        }
      });
    }
  }, [postId]);

  return null;
}
