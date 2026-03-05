import os
import json
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def sync_operator_ids():
    print("🛠️ DB에 있는 진짜 운영자 신분증(ID)을 찾아 JSON에 동기화합니다...\n")
    filepath = os.path.join(os.path.dirname(os.path.abspath(__file__)), "bot_profiles.json")
    
    with open(filepath, "r", encoding="utf-8") as f:
        profiles = json.load(f)
        
    operator_names = ["필한뉴스", "필뉴스", "필정보", "필여행"]
    
    # 1. DB에서 운영자 닉네임으로 진짜 ID 검색
    response = supabase.table("profiles").select("id, nickname").in_("nickname", operator_names).execute()
    db_operators = response.data
    
    if not db_operators:
        print("❌ DB에서 운영자 봇을 찾지 못했습니다.")
        return

    # 2. 찾은 진짜 ID를 JSON 파일에 업데이트
    update_count = 0
    for db_op in db_operators:
        for p in profiles:
            if p.get("nickname") == db_op["nickname"]:
                p["id"] = db_op["id"]
                print(f"✅ [{p['nickname']}] 진짜 신분증 장착 완료: {db_op['id']}")
                update_count += 1
                break
                
    if update_count > 0:
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(profiles, f, ensure_ascii=False, indent=2)
        print("\n🎉 동기화 완료! 이제 다시 뉴스 총사령관 코드로 바꾸시면 됩니다!")

if __name__ == "__main__":
    sync_operator_ids()
