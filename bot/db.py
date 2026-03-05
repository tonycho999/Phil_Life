import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Supabase 연결 설정
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

def get_db() -> Client:
    """Supabase 클라이언트를 반환합니다."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("Supabase URL 또는 Key가 설정되지 않았습니다.")
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def insert_post(bot_id: str, main_cat: str, sub_cat: str, title: str, content: str):
    """스크린샷의 DB 테이블 구조에 맞게 게시글을 DB에 삽입합니다."""
    db = get_db()
    
    # ★ 스크린샷의 컬럼명과 완벽하게 일치시켰습니다.
    # (bot_id는 Supabase profiles 테이블에 등록된 봇의 실제 ID/UUID여야 합니다)
    data = {
        "user_id": bot_id, 
        "category_main": main_cat, # "news"
        "category_sub": sub_cat,   # "local"
        "title": title,
        "content": content,
        "view_count": 0,
        "is_hidden": False,
        "is_pinned": False,
        "format": "html" # 웹 에디터 형식에 맞게 html로 저장
    }
    
    try:
        result = db.table("posts").insert(data).execute()
        print(f"✅ [DB 저장 성공] {title}")
        return result
    except Exception as e:
        print(f"❌ [DB 저장 실패] {e}")
        return None
