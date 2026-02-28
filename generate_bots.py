import json
import random
import uuid
import os

# GitHub Actions 환경 자동 설치 처리
try:
    from faker import Faker
except ImportError:
    os.system('pip install faker')
    from faker import Faker

# ---------------------------------------------------------
# 1. 상수 및 데이터 정의 (에러 방지를 위해 리스트 명시)
# ---------------------------------------------------------

fake = Faker('ko_KR')
NUM_BOTS = 1000

# (1) 지역 데이터
LOCATIONS = {
    "메트로 마닐라": 45, "앙헬레스/클락": 20, "세부/막탄": 15,
    "바기오": 5, "카비테/라구나": 10, "다바오/기타": 5
}

# (2) MBTI 데이터
MBTI_TYPES = {
    "ISTJ": 20, "ESTJ": 15, "ISTP": 10, "ISFJ": 10, "ENFP": 8, "ESFJ": 6,
    "INFP": 5, "ESFP": 5, "ENTP": 3, "INTP": 3, "ESTP": 5, "ENFJ": 3,
    "INFJ": 3, "ENTJ": 2, "INTJ": 2
}

# (3) 직업 데이터
JOBS = [
    "식당업(한식)", "여행사/가이드", "부동산업", "어학원 운영", "어학원 매니저",
    "대기업 주재원", "개인사업(무역)", "IT 프리랜서", "콜센터 관리자", "호텔/리조트 매니저",
    "다이빙 강사", "마사지샵 운영", "유학생", "어학연수생", "은퇴 이민자",
    "전업주부", "선교사", "건설업", "무직(휴식중)"
]

# (4) 닉네임 조합용
NICK_PREFIX = ["마닐라", "세부", "앙헬", "클락", "바기오", "필", "따가이", "골프", "다이빙", "맛집", "초보", "프로", "행복한", "자유"]
NICK_SUFFIX = ["아빠", "맘", "대디", "러버", "고수", "김사장", "박사장", "이프로", "투어", "라이프", "살이", "형", "오빠", "누나"]

# (5) 활동 성향 (게시글/댓글 빈도)
ACTIVITY_TYPES = {
    "헤비 업로더 (글 위주)": {"weight": 5, "post": 0.8, "comment": 0.2},
    "댓글 요정 (댓글 위주)": {"weight": 30, "post": 0.1, "comment": 0.9},
    "파워 유저 (둘 다 활발)": {"weight": 5, "post": 0.7, "comment": 0.8},
    "눈팅족 (가끔 글/댓)": {"weight": 40, "post": 0.1, "comment": 0.1},
    "일반 유저 (평범)": {"weight": 20, "post": 0.3, "comment": 0.3}
}

# (6) 나이대 분포 상수 (★ 에러 발생했던 부분 수정)
AGE_GROUPS =
AGE_WEIGHTS =

# ---------------------------------------------------------
# 2. 로직 함수
# ---------------------------------------------------------

def get_weighted_choice(items_dict):
    keys = list(items_dict.keys())
    # 값이 딕셔너리면 weight 키 사용, 아니면 값 자체 사용
    first_val = list(items_dict.values())
    if isinstance(first_val, dict):
        weights = [v['weight'] for v in items_dict.values()]
    else:
        weights = list(items_dict.values())
    
    return random.choices(keys, weights=weights, k=1)

def generate_age():
    # ★ 수정됨: 변수를 직접 참조하여 문법 에러 방지
    base = random.choices(AGE_GROUPS, weights=AGE_WEIGHTS, k=1)
    return base + random.randint(0, 9)

def generate_job(age):
    if age < 26: return random.choice(["유학생", "어학연수생", "워킹홀리데이", "무직(휴식중)"])
    elif age > 65: return random.choice(["은퇴 이민자", "식당업(한식)", "부동산업", "골프 가이드"])
    else: return random.choice(JOBS)

def generate_visa(job, age):
    if "은퇴" in job or age >= 60: return "SRRV (은퇴비자)"
    if "유학생" in job or "연수" in job: return "SSP/학생비자"
    if "관광" in job or "무직" in job: return "관광비자 (연장중)"
    if "주재원" in job: return "9G (워킹비자 - 회사지원)"
    if random.random() < 0.2: return "13A (결혼비자)"
    return "9G (워킹비자)"

def generate_residence(age, job):
    if age < 25: return random.randint(0, 3)
    if "주재원" in job: return random.randint(1, 5)
    max_residence = max(0, min(30, age - 20))
    return random.randint(0, max_residence)

def generate_nickname(location, job, real_name):
    r = random.random()
    if r < 0.3:
        loc_short = location.split("/")[:2]
        return f"{loc_short}{random.choice(['박사', '대장', '지킴이', '가이드', '삼촌'])}"
    elif r < 0.6:
        return f"{random.choice(NICK_PREFIX)}{random.choice(NICK_SUFFIX)}"
    else:
        return f"{real_name[1:]}{random.choice(['파파', '맘', '대디', 'Vlog', 'TV'])}"

def get_tone_by_mbti(mbti):
    if "ST" in mbti: return "팩트 중심, 간결함, 정보 전달 위주"
    if "NF" in mbti: return "감성적, 공감 능력 좋음, 이모티콘 사용"
    if "NT" in mbti: return "논리적, 분석적, 토론을 즐김"
    if "SF" in mbti: return "친절함, 사교적, 경험담 공유 위주"
    return "평범한 존댓말"

# ---------------------------------------------------------
# 3. 메인 실행
# ---------------------------------------------------------

def main():
    profiles = []
    print(f"🔄 봇 프로필 생성 시작 (특수봇 3명 + 일반봇 {NUM_BOTS}명)...")

    # [A] 특수 봇 3명 (뉴스/여행 담당)
    special_bots = [
        {
            "id": "bot-news-korea",
            "real_name": "관리자_뉴스",
            "nickname": "필한뉴스",
            "role": "SYSTEM",
            "job": "뉴스 에디터",
            "location": "서울/마닐라",
            "mbti": "ISTJ",
            "writing_tone": "공식적이고 객관적인 뉴스 브리핑",
            "activity_type": "뉴스 봇",
            "post_probability": 1.0,
            "comment_probability": 0.0
        },
        {
            "id": "bot-news-phil",
            "real_name": "관리자_필리핀",
            "nickname": "필뉴스",
            "role": "SYSTEM",
            "job": "현지 소식통",
            "location": "메트로 마닐라",
            "mbti": "ESTJ",
            "writing_tone": "현지 사정에 밝은 전문가 어조",
            "activity_type": "뉴스 봇",
            "post_probability": 1.0,
            "comment_probability": 0.1
        },
        {
            "id": "bot-travel-phil",
            "real_name": "관리자_여행",
            "nickname": "필여행",
            "role": "SYSTEM",
            "job": "여행 가이드",
            "location": "전역",
            "mbti": "ENFP",
            "writing_tone": "활기차고 설레는 여행 가이드 어조",
            "activity_type": "여행 봇",
            "post_probability": 0.9,
            "comment_probability": 0.5
        }
    ]
    profiles.extend(special_bots)

    # [B] 일반 봇 1000명 생성
    for _ in range(NUM_BOTS):
        name = fake.name()
        age = generate_age()
        location = get_weighted_choice(LOCATIONS)
        mbti = get_weighted_choice(MBTI_TYPES)
        job = generate_job(age)
        
        # 활동 성향
        act_name = get_weighted_choice(ACTIVITY_TYPES)
        act_data = ACTIVITY_TYPES[act_name]

        profile = {
            "id": str(uuid.uuid4()),
            "real_name": name,
            "nickname": generate_nickname(location, job, name),
            "role": "USER",
            "gender": random.choice(['남성', '여성']),
            "age": age,
            "mbti": mbti,
            "writing_tone": get_tone_by_mbti(mbti),
            "location": location,
            "job": job,
            "residence_years": generate_residence(age, job),
            "visa_status": generate_visa(job, age),
            "family_status": "기러기" if (age > 40 and random.random() < 0.3) else "일반 거주",
            "interests": random.sample(["골프", "다이빙", "맛집", "부동산", "국제학교", "밤문화", "마사지", "쇼핑", "주식"], k=2),
            "activity_type": act_name,
            "post_probability": act_data["post"],
            "comment_probability": act_data["comment"]
        }
        profiles.append(profile)

    with open("bot_profiles.json", "w", encoding="utf-8") as f:
        json.dump(profiles, f, ensure_ascii=False, indent=2)
    
    print(f"✅ 완료! 총 {len(profiles)}명의 프로필이 'bot_profiles.json' 파일에 저장되었습니다.")

if __name__ == "__main__":
    main()
