import os
import json
import time
from dotenv import load_dotenv
from supabase import create_client, Client

from ai_selector import generate_text

# 환경 변수 로드
load_dotenv()

# Supabase 설정
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# 봇 계정의 UID 고정
AUTHOR_ID = "7ceb52e2-28a9-422d-b932-2f95952b771c"

def get_prompt_for_target(task):
    target = task['target_name']
    region = task['region']
    cat_sub = task['category_sub']
    
    if cat_sub == "golf":
        return f"""
        당신은 필리핀 교민 커뮤니티 '필카페24'의 전문 정보 봇 '필정보'입니다.
        아래 타겟에 대한 골프장 정보를 다음 5가지 목차에 맞춰 객관적인 사실 위주로 작성해주세요.
        주관적인 평가(평점, 요금)는 절대 포함하지 마세요. HTML 태그(h3, ul, li, strong 등)를 사용하여 보기 좋게 포맷팅해주세요.
        
        타겟 골프장: {target} (지역: {region})
        
        [목차 양식]
        <h3>1. 구장 프로필 (Basic Specs)</h3> (구장명, 위치, 규모, 잔디 종류, 티오프 간격 등)
        <h3>2. 운영 시스템 및 규정 (Field Policy)</h3> (카트/캐디 운영 방식, 복장 규정, 외부 음식 반입, 휴장일 등)
        <h3>3. 주변 인프라 (Logistics Hub)</h3> (클럽하우스 식사, 주변 15분 내 추천 식당 종류, 가장 가까운 숙소 등)
        <h3>4. 부대시설 정보 (Facilities)</h3> (연습장, 편의시설, 대여 서비스 유무 등)
        <h3>5. 골퍼를 위한 실무 팁 (Non-Subjective Tips)</h3> (이동 시 트래픽 팁, 결제 방식 등)
        """
        
    elif cat_sub == "hotel":
        return f"""
        당신은 필리핀 교민 커뮤니티 '필카페24'의 전문 정보 봇 '필정보'입니다.
        아래 타겟에 대한 호텔/리조트 정보를 다음 4가지 목차에 맞춰 객관적인 사실 위주로 작성해주세요.
        주관적인 평가나 요금은 제외하고, HTML 태그(h3, ul, li, strong 등)를 사용하여 보기 좋게 포맷팅해주세요.
        
        타겟 호텔: {target} (지역: {region})
        
        [목차 양식]
        <h3>1. 호텔 프로필 (Basic Specs)</h3> (호텔명, 위치/구글맵 주소, 성급, 오픈/리모델링 연도 등)
        <h3>2. 객실 및 규정 (Room & Policy)</h3> (체크인/체크아웃 시간, 디파짓 여부, 주요 객실 타입 등)
        <h3>3. 부대시설 및 다이닝 (Facilities & Dining)</h3> (수영장, 카지노, 피트니스, 조식당 등 주요 시설)
        <h3>4. 이동 및 주변 인프라 (Location Tips)</h3> (공항에서의 거리, 도보 이동 가능한 주변 인프라 등)
        """
    return ""

def process_tasks():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(base_dir, 'ph_info_tasks.json')
    
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            tasks = json.load(f)
    except Exception as e:
        print(f"JSON 로드 에러: {e}")
        return

    is_updated = False
    
    processed_golf = 0
    processed_hotel = 0

    for task in tasks:
        # 이미 완료된 작업은 건너뜀
        if task.get('status') == 'completed':
            continue

        cat_sub = task['category_sub']
        
        # 이미 골프장 1개, 호텔 1개를 썼다면 이번 턴에서는 패스
        if cat_sub == "golf" and processed_golf >= 1:
            continue
        if cat_sub == "hotel" and processed_hotel >= 1:
            continue

        target = task['target_name']
        print(f"⏳ [{target}] 정보 생성 시작...")
        
        prompt = get_prompt_for_target(task)
        if not prompt:
            continue

        try:
            content = generate_text(prompt=prompt, temperature=0.7)
            
            if content.startswith("❌"):
                print(f"❌ AI 생성 실패: {content}")
                continue
            
            title = f"[{task['region']}] {target} - 팩트체크 가이드"
            
            # ★ 수정된 부분: format 항목을 "html"로 추가
            post_data = {
                "title": title,
                "content": content,
                "category_main": task['category_main'],
                "category_sub": cat_sub,
                "author_id": AUTHOR_ID,
                "is_hidden": False,
                "format": "html"  # <-- 요청하신 항목 추가
            }
            
            data, count = supabase.table('posts').insert(post_data).execute()
            
            print(f"✅ [{target}] DB 저장 완료!")
            
            # 성공 시에만 상태를 completed로 변경
            task['status'] = 'completed'
            is_updated = True
            
            if cat_sub == "golf":
                processed_golf += 1
            elif cat_sub == "hotel":
                processed_hotel += 1
            
            # 골프장 1개, 호텔 1개를 모두 작성했으면 루프 즉시 종료
            if processed_golf >= 1 and processed_hotel >= 1:
                print("🎯 1회 목표량(골프장 1, 호텔 1) 달성 완료! 루프를 종료합니다.")
                break
            
            # API 호출 제한 방지
            time.sleep(5)
            
        except Exception as e:
            print(f"❌ [{target}] 처리 중 에러 발생: {e}")

    # 작업 내용이 성공적으로 업데이트 된 경우에만 JSON 파일 덮어쓰기
    if is_updated:
        try:
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(tasks, f, ensure_ascii=False, indent=2)
            print("💾 JSON 파일 상태 업데이트 완료! (pending -> completed)")
        except Exception as e:
            print(f"❌ JSON 파일 저장 에러: {e}")

if __name__ == "__main__":
    process_tasks()
