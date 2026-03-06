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
    
    # 공통 강제 규칙 (마크다운 금지, HTML 강제)
    common_rules = """
    [필수 엄수 규칙 - 위반 시 시스템 에러 발생]
    1. 마크다운 기호(**, ##, *, - 등)는 절대 사용하지 마세요.
    2. 반드시 순수 HTML 태그(<h3>, <ul>, <li>, <strong>, <br> 등)만 사용하여 작성하세요.
    3. 주관적인 평가(평점, 요금)는 제외하고 팩트 위주로 간결하게 작성하세요.
    4. 코드 블록(```html 등)으로 감싸지 말고, 바로 HTML 텍스트만 출력하세요.
    """
    
    if cat_sub == "golf":
        return f"""
        당신은 필리핀 교민 커뮤니티 '필카페24'의 전문 정보 봇 '필정보'입니다.
        아래 타겟에 대한 골프장 정보를 작성해주세요.
        {common_rules}
        
        타겟 골프장: {target} (지역: {region})
        
        [정확히 아래의 HTML 구조와 태그를 본따서 내용을 채워주세요]
        <p>안녕하세요, 필리핀 교민 커뮤니티 <strong>필카페24</strong>의 전문 정보 봇 <strong>필정보</strong>입니다.<br>
        {region}에 위치한 <strong>{target}</strong>에 대한 객관적인 정보를 정리해 드립니다.</p>

        <h3>1. 구장 프로필 (Basic Specs)</h3>
        <ul>
            <li><strong>구장명:</strong> {target}</li>
            <li><strong>위치:</strong> (상세 주소 및 구글맵 정보)</li>
            <li><strong>규모:</strong> (예: 18홀 / 72파)</li>
            <li><strong>잔디 종류:</strong> (페어웨이 및 그린 잔디)</li>
            <li><strong>티오프 간격:</strong> (분 단위 간격)</li>
        </ul>

        <h3>2. 운영 시스템 및 규정 (Field Policy)</h3>
        <ul>
            <li><strong>카트 및 캐디:</strong> (운영 방식)</li>
            <li><strong>복장 규정:</strong> (허용 및 불가 복장)</li>
            <li><strong>외부 음식:</strong> (반입 가능 여부)</li>
            <li><strong>휴장일:</strong> (정기 관리일 등)</li>
        </ul>

        <h3>3. 주변 인프라 (Logistics Hub)</h3>
        <ul>
            <li><strong>클럽하우스 식사:</strong> (주요 메뉴 및 한식 여부)</li>
            <li><strong>주변 식당 (15분 내):</strong> (인근 추천 식당 종류)</li>
            <li><strong>가장 가까운 숙소:</strong> (호텔/리조트명)</li>
        </ul>

        <h3>4. 부대시설 정보 (Facilities)</h3>
        <ul>
            <li><strong>연습 시설:</strong> (드라이빙 레인지, 퍼팅장 등)</li>
            <li><strong>편의 시설:</strong> (프로샵, 샤워실 등)</li>
        </ul>

        <h3>5. 골퍼를 위한 실무 팁 (Non-Subjective Tips)</h3>
        <ul>
            <li><strong>이동 시 주의사항:</strong> (트래픽이나 도로 상태)</li>
            <li><strong>결제 방식:</strong> (카드/현금 사용 팁)</li>
        </ul>
        """
        
    elif cat_sub == "hotel":
        return f"""
        당신은 필리핀 교민 커뮤니티 '필카페24'의 전문 정보 봇 '필정보'입니다.
        아래 타겟에 대한 호텔/리조트 정보를 작성해주세요.
        {common_rules}
        
        타겟 호텔: {target} (지역: {region})
        
        [정확히 아래의 HTML 구조와 태그를 본따서 내용을 채워주세요]
        <p>안녕하세요, 필리핀 교민 커뮤니티 <strong>필카페24</strong>의 전문 정보 봇 <strong>필정보</strong>입니다.<br>
        {region}에 위치한 <strong>{target}</strong>에 대한 객관적인 정보를 정리해 드립니다.</p>

        <h3>1. 호텔 프로필 (Basic Specs)</h3>
        <ul>
            <li><strong>호텔명:</strong> {target}</li>
            <li><strong>위치:</strong> (상세 주소)</li>
            <li><strong>성급 및 오픈:</strong> (몇 성급, 언제 오픈/리모델링 했는지)</li>
        </ul>

        <h3>2. 객실 및 규정 (Room & Policy)</h3>
        <ul>
            <li><strong>체크인/체크아웃:</strong> (시간)</li>
            <li><strong>디파짓(보증금):</strong> (요구 여부 및 방식)</li>
            <li><strong>주요 객실 타입:</strong> (대표적인 방 종류)</li>
        </ul>

        <h3>3. 부대시설 및 다이닝 (Facilities & Dining)</h3>
        <ul>
            <li><strong>수영장:</strong> (유무 및 특징)</li>
            <li><strong>다이닝:</strong> (조식당 및 주요 레스토랑)</li>
            <li><strong>기타 시설:</strong> (피트니스, 카지노 등)</li>
        </ul>

        <h3>4. 이동 및 주변 인프라 (Location Tips)</h3>
        <ul>
            <li><strong>공항 접근성:</strong> (가장 가까운 공항에서 걸리는 시간)</li>
            <li><strong>주변 명소:</strong> (도보/단거리 이동 가능한 인프라)</li>
        </ul>
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
    
    attempted_golf = False
    attempted_hotel = False

    for task in tasks:
        if task.get('status') == 'completed':
            continue

        cat_sub = task['category_sub']
        
        if cat_sub == "golf":
            if attempted_golf: continue
            attempted_golf = True
        elif cat_sub == "hotel":
            if attempted_hotel: continue
            attempted_hotel = True

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
                
            # AI가 혹시나 마크다운 코드블록(```html ... ```)을 붙였을 경우를 대비해 껍데기 벗겨내기
            content = content.replace("```html", "").replace("```", "").strip()
            
            title = f"[{task['region']}] {target} - 팩트체크 가이드"
            
            post_data = {
                "title": title,
                "content": content,
                "category_main": task['category_main'],
                "category_sub": cat_sub,
                "author_id": AUTHOR_ID,
                "is_hidden": False,
                "format": "html"
            }
            
            data, count = supabase.table('posts').insert(post_data).execute()
            print(f"✅ [{target}] DB 저장 완료!")
            
            task['status'] = 'completed'
            is_updated = True
            time.sleep(5)
            
        except Exception as e:
            print(f"❌ [{target}] 처리 중 에러 발생: {e}")

        if attempted_golf and attempted_hotel:
            print("🎯 1회 목표량 시도 완료! 루프 종료.")
            break

    if is_updated:
        try:
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(tasks, f, ensure_ascii=False, indent=2)
            print("💾 JSON 파일 상태 업데이트 완료! (pending -> completed)")
        except Exception as e:
            print(f"❌ JSON 파일 저장 에러: {e}")

if __name__ == "__main__":
    process_tasks()
