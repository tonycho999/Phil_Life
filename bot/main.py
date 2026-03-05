import os
import json
import time
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def upload_existing_bots():
    print("🚀 대표님께서 기획하신 1,004명 봇 데이터를 DB에 업로드합니다...\n")
    
    filepath = os.path.join(os.path.dirname(os.path.abspath(__file__)), "bot_profiles.json")
    
    # 1. 대표님의 피땀 눈물이 담긴 기존 파일 읽어오기
    with open(filepath, "r", encoding="utf-8") as f:
        bot_profiles = json.load(f)
        
    print(f"✅ 파일 읽기 완료: 총 {len(bot_profiles)}명의 봇 데이터 확인\n")
    
    updated_profiles = []
    
    # 2. 한 명씩 DB에 가입시키기
    for i, bot in enumerate(bot_profiles):
        # 고유 이메일 자동 생성
        email = f"bot_{i}@philcafe.com"
        
        try:
            # DB(Auth)에 정식 가입 시켜서 '진짜 UUID' 발급받기
            user = supabase.auth.admin.create_user({
                "email": email,
                "password": "botpassword123!",
                "email_confirm": True
            })
            real_uuid = user.user.id
            
            # Profiles 테이블에 닉네임, 등급 등 정보 밀어넣기
            grade = "관리자" if bot.get("role") == "운영자" else "일반"
            level = bot.get("level", 1) # 일반 유저 레벨이 비어있으면 1로 세팅
            
            supabase.table("profiles").update({
                "nickname": bot["nickname"],
                "level": level,
                "grade": grade
            }).eq("id", real_uuid).execute()
            
            # ★ 핵심: MBTI, 나이 등은 그대로 두고 'id'만 진짜 번호표로 쏙 교체
            bot["id"] = real_uuid
            
            if i % 100 == 0 or i == len(bot_profiles) - 1:
                print(f"📈 진행 상황: {i+1}명 DB 업로드 완료... (최근: {bot.get('nickname')})")
                
        except Exception as e:
            print(f"⚠️ [{bot.get('nickname')}] 업로드 실패 (이미 존재하거나 오류): {e}")
            
        updated_profiles.append(bot)
        
        # API 과부하를 막기 위해 아주 살짝 쉼표
        time.sleep(0.1)

    # 3. 진짜 UUID가 반영된 데이터를 원본 파일에 덮어쓰기
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(updated_profiles, f, ensure_ascii=False, indent=2)
        
    print("\n🎉 1,004명 DB 업로드 및 UUID 업데이트가 완벽하게 완료되었습니다!")

if __name__ == "__main__":
    upload_existing_bots()
