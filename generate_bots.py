import json
import random
import uuid
from faker import Faker

def main():
    # Faker 초기화 (GitHub Action에서 이미 설치됨)
    fake = Faker("ko_KR")
    profiles = []
    
    print("🔄 봇 프로필 생성 시작 (1003명)...")

    # 특수 관리자 봇 3명 고정 생성
    special_bots = [
        {
            "id": "bot-news-korea",
            "nickname": "필한뉴스",
            "real_name": "관리자_뉴스",
            "role": "SYSTEM",
            "writing_tone": "공식적 뉴스 브리핑",
            "activity_type": "뉴스 봇",
            "post_probability": 1.0,
            "comment_probability": 0.0
        },
        {
            "id": "bot-news-phil",
            "nickname": "필뉴스",
            "real_name": "관리자_필리핀",
            "role": "SYSTEM",
            "writing_tone": "현지 전문가 어조",
            "activity_type": "뉴스 봇",
            "post_probability": 1.0,
            "comment_probability": 0.1
        },
        {
            "id": "bot-travel-phil",
            "nickname": "필여행",
            "real_name": "관리자_여행",
            "role": "SYSTEM",
            "writing_tone": "설레는 가이드 어조",
            "activity_type": "여행 봇",
            "post_probability": 0.9,
            "comment_probability": 0.5
        }
    ]
    profiles.extend(special_bots)

    # 일반 유저 봇 1000명 생성
    for _ in range(1000):
        # 데이터 리스트를 루프 안에 직접 정의 (변수 참조 에러 방지)
        locs = ["메트로 마닐라", "앙헬레스/클락", "세부/막탄", "바기오", "카비테/라구나", "다바오/기타"]
        loc_weights =
        
        mbtis = ["ISTJ", "ESTJ", "ISTP", "ISFJ", "ENFP", "ESFJ", "INFP", "ESFP", "ENTP", "INTP", "ESTP", "ENFJ", "INFJ", "ENTJ", "INTJ"]
        mbti_weights =

        # 나이 생성
        age_base = random.choices(, weights=, k=1)
        age = age_base + random.randint(0, 9)

        # 직업 선택
        job_list = ["식당업", "여행사", "부동산", "어학원", "주재원", "IT프리랜서", "다이빙강사", "주부", "유학생", "은퇴자", "무직"]
        job = random.choice(job_list)

        # 활동 성향 (가중치 순서: 헤비, 댓글요정, 파워유저, 눈팅족, 일반)
        act_names = ["헤비 업로더", "댓글 요정", "파워 유저", "눈팅족", "일반 유저"]
        act_choice = random.choices(act_names, weights=, k=1)
        
        # 성향별 확률 설정
        probs = {"헤비 업로더": [0.8, 0.2], "댓글 요정": [0.1, 0.9], "파워 유저": [0.7, 0.8], "눈팅족": [0.1, 0.1], "일반 유저": [0.3, 0.3]}
        post_p, comm_p = probs[act_choice]

        # 닉네임 생성 (지역 + 랜덤접미사)
        location = random.choices(locs, weights=loc_weights, k=1)
        nick = f"{location[:2]}{random.choice(['박사', '아빠', '맘', '대장', '가이드'])}"

        profile = {
            "id": str(uuid.uuid4()),
            "nickname": nick,
            "real_name": fake.name(),
            "role": "USER",
            "age": age,
            "mbti": random.choices(mbtis, weights=mbti_weights, k=1),
            "location": location,
            "job": job,
            "residence_years": random.randint(0, min(30, max(1, age-20))),
            "activity_type": act_choice,
            "post_probability": post_p,
            "comment_probability": comm_p,
            "interests": random.sample(["골프", "맛집", "부동산", "학교", "마사지"], k=2)
        }
        profiles.append(profile)

    # 결과 저장
    with open("bot_profiles.json", "w", encoding="utf-8") as f:
        json.dump(profiles, f, ensure_ascii=False, indent=2)
    
    print(f"✅ 총 {len(profiles)}명의 데이터 생성 완료!")

if __name__ == "__main__":
    main()
