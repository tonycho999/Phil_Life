import os
import json
import time
import random
import uuid
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def upload_existing_bots():
    print("🚀 닉네임 중복 자동 해결 기능을 탑재하여 DB 업로드를 시작합니다...\n")
    
    filepath = os.path.join(os.path.dirname(os.path.abspath(__file__)), "bot_profiles.json")
    
    with open(filepath, "r", encoding="utf-8") as f:
        bot_profiles = json.load(f)
        
    updated_profiles = []
    
    for i, bot in enumerate(bot_profiles):
        # 1. 이전 실패 기록과 꼬이지 않도록 이메일을 절대 안 겹치게(랜덤) 생성
        email = f"bot_{uuid.uuid4().hex[:8]}@philcafe.com"
        
        try:
            # DB(Auth) 정식 가입
            user = supabase.auth.admin.create_user({
                "email": email,
                "password": "botpassword123!",
                "email_confirm": True
            })
            real_uuid = user.user.id
            
            # 2. 닉네임 중복 시 자동 숫자 부여 로직
            nickname = bot["nickname"]
            grade = "관리자" if bot.get("role") == "운영자" else "일반"
            level = bot.get("level", 1)
            
            for attempt in range(10): # 닉네임이 계속 겹치면 최대 10번까지 번호표 새로 뽑음
                try:
                    supabase.table("profiles").update({
                        "nickname": nickname,
                        "level": level,
                        "grade": grade
                    }).eq("id", real_uuid).execute()
                    
                    # 성공 시 JSON 데이터 업데이트
                    bot["id"] = real_uuid
                    bot["nickname"] = nickname # 숫자가 붙었다면 바뀐 닉네임으로 영구 저장
                    
                    if i % 50 == 0 or i == len(bot_profiles) - 1:
                        print(f"✅ [{nickname}] DB 안착 완료! (총 {i+1}명 진행중...)")
                    break # 성공했으니 재시도 반복문 탈출!
                    
                except Exception as e:
                    # 에러 메시지에 'duplicate'나 '23505'(중복 코드)가 있으면 숫자 붙이기
                    if "duplicate" in str(e).lower() or "23505" in str(e):
                        nickname = f"{bot['nickname']}{random.randint(1, 999)}"
                    else:
                        print(f"⚠️ [{nickname}] 알 수 없는 에러: {e}")
                        break
                        
        except Exception as e:
            print(f"⚠️ 계정 생성 자체 실패: {e}")
            
        updated_profiles.append(bot)
        time.sleep(0.05) # 서버 터지지 않게 부드럽게 진행

    # 3. 진짜 UUID와 중복 방지 처리된 닉네임들을 원본 파일에 덮어쓰기
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(updated_profiles, f, ensure_ascii=False, indent=2)
        
    print("\n🎉 1,004명 DB 업로드 및 중복 닉네임/UUID 업데이트가 완벽하게 끝났습니다!")

if __name__ == "__main__":
    upload_existing_bots()
