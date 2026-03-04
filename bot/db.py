import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Supabase 연결 설정
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")  # 반드시 service_role 키를 사용해야 권한 무시하고 글 작성이 가능합니다.

def get_db() -> Client:
    """Supabase 클라이언트를 반환합니다."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("Supabase URL 또는 Key가 설정되지 않았습니다.")
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def insert_post(bot_id: str, main_cat: str, sub_cat: str, title: str, content: str):
    """게시글을 DB에 삽입하는 공통 함수"""
    db = get_db()
    
    # 봇 프로필은 별도의 테이블이나 로직으로 관리 중이라고 가정하고,
    # 글 작성자(author_id)에 봇의 ID를 넣습니다.
    data = {
        "author_id": bot_id, 
        "category_main": main_cat,
        "category_sub": sub_cat,
        "title": title,
        "content": content,
        "view_count": 0,
        "comment_count": 0,
        "is_hidden": False,
        "is_pinned": False
    }
    
    try:
        result = db.table("posts").insert(data).execute()
        print(f"✅ [DB 저장 성공] {title}")
        return result
    except Exception as e:
        print(f"❌ [DB 저장 실패] {e}")
        return None
