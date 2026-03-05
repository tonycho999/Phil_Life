import os
import json
import time
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def clean_database_and_json():
    print("🧹 DB 및 JSON에서 'null' 닉네임 불량 유저 완전 삭제를 시작합니다...\n")

    # ---------------------------------------------------------
    # 1. Supabase DB에서 불량 유저 뿌리뽑기
    # ---------------------------------------------------------
    print("🔍 DB(profiles)에서 불량 유저를 스캔 중입니다...")
    try:
        # DB에서 모든 유저 정보 가져오기 (넉넉하게 최대 2000명)
        response = supabase.table("profiles").select("id, nickname").limit(2000).execute()
        profiles = response.data
        
        db_deleted_count = 0
        for p in profiles:
            nickname = p.get("nickname")
            
            # 닉네임이 없거나, 'null' 이거나, 비어있는 경우 가차없이 삭제!
            if not nickname or str(nickname).strip().lower() == "null" or str(nickname).strip() == "":
                bad_id = p["id"]
                try:
                    # ★ 핵심: Auth(회원가입 테이블)에서 영구 삭제
                    supabase.auth.admin.delete_user(bad_id)
                    # 만약을 위해 Profiles 테이블에서도 한 번 더 강제 삭제
                    supabase.table("profiles").delete().eq("id", bad_id).execute()
                    
                    print(f"🗑️ DB 삭제 완료: [유령 ID: {bad_id}]")
                    db_deleted_count += 1
                    time.sleep(0.05) # 서버 보호를 위한 약간의 딜레이
                except Exception as e:
                    print(f"⚠️ DB 삭제 실패 [ID: {bad_id}]: {e}")
                    
        print(f"✅ DB 스캔 및 청소 완료! (총 {db_deleted_count}명의 유령 회원이 DB에서 영구 삭제됨)\n")
    except Exception as e:
        print(f"⚠️ DB 스캔 중 에러 발생: {e}\n")

    # ---------------------------------------------------------
    # 2. JSON 파일에서 불량 유저 삭제 (최종 확인 사살)
    # ---------------------------------------------------------
    filepath = os.path.join(os.path.dirname(os.path.abspath(__file__)), "bot_profiles.json")
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            bot_profiles = json.load(f)
            
        cleaned_profiles = []
        json_deleted_count = 0
        
        for bot in bot_profiles:
            nickname = bot.get("nickname")
            if not nickname or str(nickname).strip().lower() == "null" or str(nickname).strip() == "":
                json_deleted_count += 1
                continue # 리스트에 추가하지 않고 버림
                
            cleaned_profiles.append(bot)
            
        # 깨끗해진 명단을 다시 파일에 덮어쓰기
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(cleaned_profiles, f, ensure_ascii=False, indent=2)
            
        print(f"✅ JSON 파일 청소 완료! (총 {json_deleted_count}명 파일에서 삭제됨)")
        print(f"🎉 찌꺼기 없는 완벽한 최종 봇 인원 수: {len(cleaned_profiles)}명")

    print("\n🚀 불량 데이터 영구 삭제 작업이 모두 완벽하게 끝났습니다!")

if __name__ == "__main__":
    clean_database_and_json()
