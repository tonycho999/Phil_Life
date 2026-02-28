import json
import random
from faker import Faker

# ---------------------------------------------------------
# 1. 설정 및 데이터 정의
# ---------------------------------------------------------

fake = Faker('ko_KR')
NUM_BOTS = 1000

# 지역 분포 (필리핀 교민 통계 추정)
LOCATIONS = {
    "메트로 마닐라": 45,  # 마카티, 보니파시오, 올티가스, 퀘존
    "앙헬레스/클락": 20,  # 골프, 은퇴, 유흥
    "세부/막탄": 15,      # 관광, 어학, 다이빙
    "바기오": 5,          # 교육, 은퇴 (시원함)
    "카비테/라구나": 10,  # 공단, 주재원 거주지
    "다바오/기타": 5      # 지방
}

# MBTI 분포 (한국인 비율 참고: ISTJ, ESTJ 많음)
MBTI_TYPES = {
    "ISTJ": 20, "ESTJ": 15, "ISTP": 10, "ISFJ": 10,
    "ENFP": 8,  "ESFJ": 6,  "INFP": 5,  "ESFP": 5,
    "ENTP": 3,  "INTP": 3,  "ESTP": 5,  "ENFJ": 3,
    "INFJ": 3,  "ENTJ": 2,  "INTJ": 2
}

# 직업군 리스트
JOBS = [
    "식당업(한식)", "여행사/가이드", "부동산업", "어학원 운영", "어학원 매니저",
    "대기업 주재원", "개인사업(무역)", "IT 프리랜서", "콜센터 관리자", "호텔/리조트 매니저",
    "다이빙 강사", "마사지샵 운영", "유학생", "어학연수생", "은퇴 이민자",
    "전업주부", "선교사", "건설업", "무직(휴식중)"
]

# 닉네임 생성을 위한 접두사/접미사 (커뮤니티 느낌)
NICK_PREFIX = ["마닐라", "세부", "앙헬", "클락", "바기오", "필", "따가이", "골프", "다이빙", "맛집", "초보", "프로", "행복한", "자유"]
NICK_SUFFIX = ["아빠", "맘", "대디", "러버", "고수", "김사장", "박사장", "이프로", "투어", "라이프", "살이", "형", "오빠", "누나"]

# ---------------------------------------------------------
# 2. 로직 함수
# ---------------------------------------------------------

def get_weighted_choice(items_dict):
    """가중치 딕셔너리에서 하나 선택"""
    return random.choices(list(items_dict.keys()), weights=list(items_dict.values()), k=1)

def generate_age():
    """30~60세 위주, 20대와 70대는 적게 (벨 커브 유사 분포)"""
    return random.choices(
       , 
        weights=, # 가중치
        k=1
    ) + random.randint(0, 9)

def generate_job(age):
    """나이에 맞는 직업 필터링"""
    if age < 26:
        return random.choice(["유학생", "어학연수생", "워킹홀리데이", "무직(휴식중)"])
    elif age > 65:
        return random.choice(["은퇴 이민자", "식당업(한식)", "부동산업", "골프 가이드"])
    else:
        return random.choice(JOBS)

def generate_visa(job, age):
    """직업과 나이에 따른 비자 매칭 (개연성 확보)"""
    if "은퇴" in job or age >= 60: return "SRRV (은퇴비자)"
    if "유학생" in job or "연수" in job: return "SSP/학생비자"
    if "관광" in job or "무직" in job: return "관광비자 (연장중)"
    if "주재원" in job: return "9G (워킹비자 - 회사지원)"
    if random.random() < 0.2: return "13A (결혼비자)" # 20% 확률로 국제결혼
    return "9G (워킹비자)"

def generate_residence(age, job):
    """거주 년수 계산"""
    if age < 25: return random.randint(0, 3)
    if "주재원" in job: return random.randint(1, 5) # 주재원은 보통 3~5년
    max_residence = min(30, age - 20)
    return random.randint(0, max_residence)

def generate_nickname(location, job, real_name):
    """커뮤니티 스타일 닉네임 생성"""
    type_rand = random.random()
    if type_rand < 0.3:
        # 지역 + 직업/특징 (예: 세부다이버, 마닐라김사장)
        loc_short = location.split("/")[:2]
        return f"{loc_short}{random.choice(['박사', '대장', '지킴이', '가이드', '삼촌'])}"
    elif type_rand < 0.6:
        # 취미 + 호칭 (예: 골프왕, 맛집탐험)
        return f"{random.choice(NICK_PREFIX)}{random.choice(NICK_SUFFIX)}"
    else:
        # 실명 기반 (예: 민수파파, 영희맘)
        return f"{real_name[1:]}{random.choice(['파파', '맘', '대디', 'Vlog', 'TV'])}"

def get_tone_by_mbti(mbti):
    """MBTI별 말투 및 글쓰기 스타일 정의"""
    if "ST" in mbti: return "팩트 중심, 간결함, 정보 전달 위주, 감정표현 적음"
    if "NF" in mbti: return "감성적, 공감 능력 좋음, 이모티콘 많이 사용, 길게 씀"
    if "NT" in mbti: return "논리적, 분석적, 토론을 즐김, 비판적일 수 있음"
    if "SF" in mbti: return "친절함, 사교적, 경험담 공유 위주, 맞장구 잘 침"
    return "평범한 존댓말"

# ---------------------------------------------------------
# 3. 메인 생성 루프
# ---------------------------------------------------------

def main():
    profiles = []
    
    print(f"🔄 {NUM_BOTS}명의 필리핀 교민 페르소나 생성 시작...")
    
    for _ in range(NUM_BOTS):
        # 기본 정보 생성
        gender = random.choice(['남성', '여성'])
        name = fake.name()
        age = generate_age()
        location = get_weighted_choice(LOCATIONS)
        mbti = get_weighted_choice(MBTI_TYPES)
        job = generate_job(age)
        
        # 파생 정보 생성
        residence = generate_residence(age, job)
        visa = generate_visa(job, age)
        nickname = generate_nickname(location, job, name)
        tone = get_tone_by_mbti(mbti)
        
        # 가족 관계 추론
        if age < 30: family = "미혼/독신"
        elif age > 40 and residence < 3: family = "기러기 아빠/엄마"
        elif "결혼비자" in visa: family = "코필 커플(국제결혼)"
        else: family = random.choice(["4인 가족", "부부", "독신"])

        profile = {
            "id": fake.uuid4(),
            "real_name": name,
            "nickname": nickname,
            "gender": gender,
            "age": age,
            "mbti": mbti,
            "writing_tone": tone,
            "location": location,
            "job": job,
            "residence_years": residence,
            "visa_status": visa,
            "family_status": family,
            "interests": random.sample(["골프", "다이빙", "맛집", "부동산", "국제학교", "밤문화", "마사지", "쇼핑", "주식"], k=2)
        }
        profiles.append(profile)

    # JSON 저장
    with open("bot_profiles.json", "w", encoding="utf-8") as f:
        json.dump(profiles, f, ensure_ascii=False, indent=2)

    print(f"✅ 생성 완료! 'bot_profiles.json' 파일에 {len(profiles)}명이 저장되었습니다.")
    
    # 샘플 출력
    print("\n--- [샘플 프로필 3명] ---")
    for p in profiles[:3]:
        print(json.dumps(p, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
