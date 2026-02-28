import json
import random
import uuid

# GitHub Actions 환경에서 실행될 때 faker가 없으면 자동 설치 시도
try:
    from faker import Faker
except ImportError:
    import os
    os.system('pip install faker')
    from faker import Faker

# ---------------------------------------------------------
# 1. 설정 및 데이터 정의
# ---------------------------------------------------------

fake = Faker('ko_KR')
NUM_BOTS = 1000

# 지역 분포
LOCATIONS = {
    "메트로 마닐라": 45,
    "앙헬레스/클락": 20,
    "세부/막탄": 15,
    "바기오": 5,
    "카비테/라구나": 10,
    "다바오/기타": 5
}

# MBTI 분포
MBTI_TYPES = {
    "ISTJ": 20, "ESTJ": 15, "ISTP": 10, "ISFJ": 10,
    "ENFP": 8, "ESFJ": 6, "INFP": 5, "ESFP": 5,
    "ENTP": 3, "INTP": 3, "ESTP": 5, "ENFJ": 3,
    "INFJ": 3, "ENTJ": 2, "INTJ": 2
}

# 직업군
JOBS = [
    "식당업(한식)", "여행사/가이드", "부동산업", "어학원 운영", "어학원 매니저",
    "대기업 주재원", "개인사업(무역)", "IT 프리랜서", "콜센터 관리자", "호텔/리조트 매니저",
    "다이빙 강사", "마사지샵 운영", "유학생", "어학연수생", "은퇴 이민자",
    "전업주부", "선교사", "건설업", "무직(휴식중)"
]

NICK_PREFIX = ["마닐라", "세부", "앙헬", "클락", "바기오", "필", "따가이", "골프", "다이빙", "맛집", "초보", "프로", "행복한", "자유"]
NICK_SUFFIX = ["아빠", "맘", "대디", "러버", "고수", "김사장", "박사장", "이프로", "투어", "라이프", "살이", "형", "오빠", "누나"]

# ---------------------------------------------------------
# 2. 로직 함수
# ---------------------------------------------------------

def get_weighted_choice(items_dict):
    keys = list(items_dict.keys())
    weights = list(items_dict.values())
    return random.choices(keys, weights=weights, k=1)

def generate_age():
    # 연령대 선택 (가중치 적용)
    base_age = random.choices(
       ,
        weights=,
        k=1
    )
    # 해당 연령대에서 0~9세 랜덤 추가
    return base_age + random.randint(0, 9)

def generate_job(age):
    if age < 26:
        return random.choice(["유학생", "어학연수생", "워킹홀리데이", "무직(휴식중)"])
    elif age > 65:
        return random.choice(["은퇴 이민자", "식당업(한식)", "부동산업", "골프 가이드"])
    else:
        return random.choice(JOBS)

def generate_visa(job, age):
    if "은퇴" in job or age >= 60:
        return "SRRV (은퇴비자)"
    if "유학생" in job or "연수" in job:
        return "SSP/학생비자"
    if "관광" in job or "무직" in job:
        return "관광비자 (연장중)"
    if "주재원" in job:
        return "9G (워킹비자 - 회사지원)"
    if random.random() < 0.2:
        return "13A (결혼비자)"
    return "9G (워킹비자)"

def generate_residence(age, job):
    if age < 25:
        return random.randint(0, 3)
    if "주재원" in job:
        return random.randint(1, 5)
    
    # 나이가 어리면 거주기간이 길 수 없으므로 조정
    max_residence = max(0, min(30, age - 20))
    if max_residence == 0:
        return 0
    return random.randint(0, max_residence)

def generate_nickname(location, job, real_name):
    r = random.random()
    if r < 0.3:
        loc_short = location.split("/")[:2]
        suffix = random.choice(['박사', '대장', '지킴이', '가이드', '삼촌'])
        return f"{loc_short}{suffix}"
    elif r < 0.6:
        return f"{random.choice(NICK_PREFIX)}{random.choice(NICK_SUFFIX)}"
    else:
        suffix = random.choice(['파파', '맘', '대디', 'Vlog', 'TV'])
        return f"{real_name[1:]}{suffix}"

def get_tone_by_mbti(mbti):
    if "ST" in mbti:
        return "팩트 중심, 간결함, 정보 전달 위주, 감정표현 적음"
    if "NF" in mbti:
        return "감성적, 공감 능력 좋음, 이모티콘 많이 사용, 길게 씀"
    if "NT" in mbti:
        return "논리적, 분석적, 토론을 즐김, 비판적일 수 있음"
    if "SF" in mbti:
        return "친절함, 사교적, 경험담 공유 위주, 맞장구 잘 침"
    return "평범한 존댓말"

# ---------------------------------------------------------
# 3. 메인 실행
# ---------------------------------------------------------

def main():
    profiles = []
    print(f"🔄 {NUM_BOTS}명의 필리핀 교민 페르소나 생성 중...")
    
    for _ in range(NUM_BOTS):
        gender = random.choice(['남성', '여성'])
        name = fake.name()
        age = generate_age()
        location = get_weighted_choice(LOCATIONS)
        mbti = get_weighted_choice(MBTI_TYPES)
        job = generate_job(age)
        
        # 가족 상태 로직 분리
        is_goose = (age > 40 and random.random() < 0.3)
        if is_goose:
            family_status = "기러기"
        else:
            family_status = "일반 거주"

        # 관심사 랜덤 선택
        interests = random.sample(
            ["골프", "다이빙", "맛집", "부동산", "국제학교", "밤문화", "마사지", "쇼핑", "주식"],
            k=2
        )

        profile = {
            "id": str(uuid.uuid4()),
            "real_name": name,
            "nickname": generate_nickname(location, job, name),
            "gender": gender,
            "age": age,
            "mbti": mbti,
            "writing_tone": get_tone_by_mbti(mbti),
            "location": location,
            "job": job,
            "residence_years": generate_residence(age, job),
            "visa_status": generate_visa(job, age),
            "family_status": family_status,
            "interests": interests
        }
        profiles.append(profile)

    # JSON 파일 저장
    with open("bot_profiles.json", "w", encoding="utf-8") as f:
        json.dump(profiles, f, ensure_ascii=False, indent=2)
    
    print(f"✅ 완료! bot_profiles.json 파일 생성됨.")

if __name__ == "__main__":
    main()
