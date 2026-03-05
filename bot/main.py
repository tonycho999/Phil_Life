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

# 💡 닉네임이 비어있을 때 대신 넣어줄 센스 있는 조합
prefixes = [
    # 기존 지명 + 추가 지명
    "세부", "마닐라", "앙헬", "클락", "보라카이", "바기오", "다바오", "카비테", "알라방", "마카티",
    "수빅", "팔라완", "보홀", "일로일로", "라구나", "바탕가스", "퀘존", "올티가스", "보니파시오", "말라테",
    
    # 특징 및 키워드
    "필", "왕", "망고", "산미구엘", "깔라만시", "골프", "다이빙", "열대", "바다", "섬"
]

suffixes = [
    # 가족 및 친척 호칭
    "아빠", "맘", "삼촌", "이모", "형", "오빠", "누나", "언니", "아재", "부부",
    
    # 직업 및 직함
    "사장", "가이드", "대장", "회장", "프로", "마스터", "박사", "도사",
    
    # 취미 및 특성
    "홀릭", "러버", "고수", "초보", "여행자", "골퍼", "다이버", "매니아", "요정", "헌터"
]

def generate_nickname():
    return f"{random.choice(prefixes)}{random.choice(suffixes)}{random.randint(1, 99)}"

def update_and_upload_bots():
    print("🚀 JSON 데이터 완벽 정리 (null 닉네임 교체, 정회원 통일) 및 DB 업로드를 시작합니다...\n")
    
    filepath = os.path.join(os.path.dirname(os.path.abspath(__file__)), "bot_profiles.json")
    
    with open(filepath, "r", encoding="utf-8") as f:
        bot_profiles = json.load(f)
        
    updated_profiles = []
    
    for i, bot in enumerate(bot_profiles):
        # 1. 닉네임이 실제 null 이거나, 글자로 "null" 이라고 적혀있거나, 비어있으면 새로 발급!
        nickname = bot.get("nickname")
        if not nickname or nickname == "null" or str(nickname).strip() == "":
            nickname = generate_nickname()
            bot["nickname"] = nickname
            
        # 2. 역할이 '운영자'가 아니면 전부 "정회원 (Resident)"으로 덮어쓰기! (일반, 새싹, USER 모두 교체)
        role = bot.get("role", "")
        if role != "운영자":
            bot["role"] = "정회원 (Resident)"
            
        email = f"bot_{uuid.uuid4().hex[:8]}@philcafe.com"
        
        try:
            # DB(Auth) 정식 가입
            user = supabase.auth.admin.create_user({
                "email": email,
                "password": "botpassword123!",
                "email_confirm": True
            })
            real_uuid = user.user.id
            
            grade = "관리자" if bot.get("role") == "운영자" else "정회원 (Resident)"
            level = bot.get("level", 1)
            
            # 닉네임 중복 시 자동 숫자 부여 로직
            current_nickname = bot["nickname"]
            
            for attempt in range(10): 
                try:
                    supabase.table("profiles").update({
                        "nickname": current_nickname,
                        "level": level,
                        "grade": grade
                    }).eq("id", real_uuid).execute()
                    
                    # 성공 시 JSON 데이터에 진짜 UUID와 최종 닉네임 업데이트
                    bot["id"] = real_uuid
                    bot["nickname"] = current_nickname
                    
                    if i % 50 == 0 or i == len(bot_profiles) - 1:
                        print(f"✅ [{current_nickname} / {bot['role']}] DB 안착 및 JSON 수정 완료! (총 {i+1}명 진행중...)")
                    break 
                    
                except Exception as e:
                    if "duplicate" in str(e).lower() or "23505" in str(e):
                        current_nickname = f"{nickname}{random.randint(1, 999)}"
                    else:
                        print(f"⚠️ [{current_nickname}] 알 수 없는 DB 에러: {e}")
                        break
                        
        except Exception as e:
            print(f"⚠️ [{bot.get('nickname')}] 계정 생성 자체 실패: {e}")
            
        updated_profiles.append(bot)
        time.sleep(0.05) 

    # 3. ★ 핵심: 완벽하게 정리된 데이터(null 교체, 정회원 통일, 진짜 UUID)를 파일에 그대로 덮어쓰기
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(updated_profiles, f, ensure_ascii=False, indent=2)
        
    print("\n🎉 모든 데이터 정리(null 교체, 정회원 통일) 및 JSON 자동 업데이트가 완벽하게 끝났습니다!")

if __name__ == "__main__":
    update_and_upload_bots()
