import os
import json
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def sync_all_ids():
    print("🚀 1,004명 전체 봇의 진짜 신분증(UUID)을 DB에서 찾아 JSON에 일괄 동기화합니다...\n")
    
    filepath = os.path.join(os.path.dirname(os.path.abspath(__file__)), "bot_profiles.json")
    
    # 1. 기존 JSON 파일 읽기
    with open(filepath, "r", encoding="utf-8") as f:
        profiles = json.load(f)
        
    print(f"✅ 파일 읽기 완료: 총 {len(profiles)}명의 데이터 확인")

    # 2. DB에서 모든 유저 정보(profiles 테이블) 가져오기 
    # (기본 1000명 제한에 안 걸리도록 limit을 2000으로 넉넉히 설정)
    response = supabase.table("profiles").select("id, nickname").limit(2000).execute()
    db_users = response.data
    
    if not db_users:
        print("❌ DB에서 유저 정보를 불러오지 못했습니다.")
        return

    print(f"✅ DB 데이터 로드 완료: 총 {len(db_users)}명의 진짜 신분증 확보")

    # 봇이 빠르게 찾을 수 있도록 '닉네임 -> 진짜 UUID' 짝꿍 사전 만들기
    uuid_map = {user["nickname"]: user["id"] for user in db_users if user.get("nickname")}
    
    # 3. JSON 데이터 일괄 업데이트
    update_count = 0
    missing_count = 0
    
    for p in profiles:
        nickname = p.get("nickname")
        if nickname in uuid_map:
            # 기존 가짜 ID와 진짜 ID가 다르면 진짜로 교체!
            if p.get("id") != uuid_map[nickname]:
                p["id"] = uuid_map[nickname]
                update_count += 1
        else:
            missing_count += 1
            
    # 4. 완벽하게 교체된 데이터를 원본 파일에 덮어쓰기
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(profiles, f, ensure_ascii=False, indent=2)
        
    print("\n==================================================")
    print(f"🎉 1,004명 전체 동기화가 완벽하게 완료되었습니다!")
    print(f"🔄 새로 업데이트된 신분증 수: {update_count}명")
    if missing_count > 0:
        print(f"⚠️ DB에서 못 찾은 봇: {missing_count}명")
    print("==================================================")
    print("이제 다시 '뉴스 총사령관' 코드로 원상 복구하시고 실행하시면 됩니다!")

if __name__ == "__main__":
    sync_all_ids()
