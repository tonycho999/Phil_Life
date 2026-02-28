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

    # 데이터 리스트 정의 (줄바꿈 없이 한 줄로 선언하여 누락 방지)
    age_list =
    age_weights =
    loc_list = ["메트로 마닐라", "앙헬레스/클락", "세부/막탄", "바기오", "카비테/라구나", "다바오"]
    loc_weights =
    act_list = ["헤비 업로더", "댓글 요정", "파워 유저", "눈팅족", "일반 유저"]
    act_weights =
    mbti_list = ["ISTJ", "ESTJ", "ENFP", "ISFJ", "ENTP", "INFJ", "INTJ", "ESTP"]
    job_list = ["식당업", "여행사", "부동산", "어학원", "주재원", "가이드", "유학생", "은퇴자"]

    # 일반 유저 봇 1000명 생성
    for _ in range(1000):
        # 가중치 기반 선택
        sel_age = random.choices(age_list, weights=age_weights, k=1)
        age = sel_age + random.randint(0, 9)
        
        sel_loc = random.choices(loc_list, weights=loc_weights, k=1)
        
        sel_act = random.choices(act_list, weights=act_weights, k=1)
        
        # 성향별 [글확률, 댓글확률] 매핑
        prob_map = {"헤비 업로더": [0.8, 0.2], "댓글 요정": [0.1, 0.9], "파워 유저": [0.7, 0.8], "눈팅족": [0.1, 0.1], "일반 유저": [0.3, 0.3]}
        p_p, c_p = prob_map[sel_act]

        # 데이터 조립
        res_years = random.randint(0, max(0, age - 20))
        
        p = {
            "id": str(uuid.uuid4()),
            "nickname": f"{sel_loc[:2]}{random.choice(['아빠', '맘', '대장', '가이드', '사장', '프로'])}",
            "real_name": fake.name(),
            "role": "USER",
            "age": age,
            "gender": random.choice(["남성", "여성"]),
            "mbti": random.choice(mbti_list),
            "location": sel_loc,
            "job": random.choice(job_list),
            "residence_years": res_years,
            "activity_type": sel_act,
            "post_probability": p_p,
            "comment_probability": c_p,
            "interests": random.sample(["골프", "맛집", "부동산", "학교", "마사지", "쇼핑"], k=2)
        }
        profiles.append(p)

    # JSON 파일 저장
    with open("bot_profiles.json", "w", encoding="utf-8") as f:
        json.dump(profiles, f, ensure_ascii=False, indent=2)
    
    print(f"✅ 생성 완료: 총 {len(profiles)}명의 페르소나가 저장되었습니다.")

if __name__ == "__main__":
    main()
