"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase";

export default function ViewUpdater({ postId }: { postId: string }) {
  useEffect(() => {
    const updateViewCount = async () => {
      const supabase = createClient();
      // 아까 만들어두신 마법의 함수를 화면이 켜질 때 백그라운드에서 실행합니다!
      await supabase.rpc('increment_views', { row_id: Number(postId) });
    };

    updateViewCount();
  }, [postId]);

  return null; // 화면에는 아무것도 나타나지 않습니다.
}
