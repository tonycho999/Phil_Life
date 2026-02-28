import json
import random
import uuid
from faker import Faker

def main():
    fake = Faker("ko_KR")
    profiles = []
    
    # 특수 관리자 봇 3명 고정 생성
    special_bots = [
        {"id": "bot-news-korea", "nickname": "필한뉴스", "real_name": "관리자_뉴스", "role": "SYSTEM", "writing_tone": "공식적 뉴스 브리핑", "activity_type": "뉴스 봇", "post_probability": 1.0, "comment_probability": 0.0},
        {"id": "bot-news-phil", "nickname": "필뉴스", "real_name": "관리자_필리핀", "role": "SYSTEM", "writing_tone": "현지 전문가 어조", "activity_type": "뉴스 봇", "post_probability": 1.0, "comment_probability": 0.1},
        {"id": "bot-travel-phil", "nickname": "필여행", "real_name": "관리자_여행", "role": "SYSTEM", "writing_tone": "설레는 가이드 어조", "activity_type": "여행 봇", "post_probability": 0.9, "comment_probability": 0.5}
    ]
    profiles.extend(special_bots)

    # 일반 유저 봇 1000명 생성
    for _ in range(1000):
        # 나이 및 지역 (데이터를 한 줄로 선언하여 누락 방지)
        age_val = random.choices(, weights=, k=1)
        age = age_val + random.randint(0, 9)
        location = random.choices(["메트로 마닐라", "앙헬레스/클락", "세부/막탄", "바기오", "카비테/라구나", "다바오"], weights=, k=1)

        # 활동 성향 및 확률 설정
        act_names = ["헤비 업로더", "댓글 요정", "파워 유저", "눈팅족", "일반 유저"]
        act_weights =
        act_choice = random.choices(act_names, weights=act_weights, k=1)
        
        # 성향별 [글확률, 댓글확률] 매핑
        probs = {"헤비 업로더": [0.8, 0.2], "댓글 요정": [0.1, 0.9], "파워 유저": [0.7, 0.8], "눈팅족": [0.1, 0.1], "일반 유저": [0.3, 0.3]}
        post_p, comm_p = probs[act_choice]

        # 데이터 조립
        p = {
            "id": str(uuid.uuid4()),
            "nickname": f"{location[:2]}{random.choice(['아빠', '맘', '대장', '가이드', '사장', '프로'])}",
            "real_name": fake.name(),
            "role": "USER",
            "age": age,
            "gender": random.choice(["남성", "여성"]),
            "mbti": random.choice(["ISTJ", "ESTJ", "ENFP", "ISFJ", "ENTP", "INFJ", "INTJ"]),
            "location": location,
            "job": random.choice(["식당업", "여행사", "부동산", "어학원", "주재원", "가이드", "유학생", "은퇴자"]),
            "residence_years": random.randint(0, max(0, age - 20)),
            "activity_type": act_choice,
            "post_probability": post_p,
            "comment_probability": comm_p,
            "interests": random.sample(["골프", "맛집", "부동산", "학교", "마사지", "쇼핑"], k=2)
        }
        profiles.append(p)

    # JSON 파일 저장
    with open("bot_profiles.json", "w", encoding="utf-8") as f:
        json.dump(profiles, f, ensure_ascii=False, indent=2)
    
    print(f"✅ 생성 완료: 총 {len(profiles)}명의 페르소나가 저장되었습니다.")

if __name__ == "__main__":
    main()
