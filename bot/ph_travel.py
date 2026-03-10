import os
import json
import time
import requests
from dotenv import load_dotenv
from supabase import create_client, Client

from ai_selector import generate_text

# 환경 변수 로드
load_dotenv()

# Supabase 및 Google API 설정
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
GOOGLE_SEARCH_API_KEY = os.getenv("GOOGLE_SEARCH_API_KEY")
GOOGLE_SEARCH_CX = os.getenv("GOOGLE_SEARCH_CX")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# 봇 계정의 UID 고정
AUTHOR_ID = "451341d5-6bf9-4579-9eb2-4533514f17f7"

# 강력한 시스템 프롬프트: 마크다운 절대 금지, 순수 텍스트+HTML 태그만 허용
SYSTEM_PROMPT = """
당신은 웹사이트 게시판용 HTML 전문 에디터입니다.
[절대 규칙]
1. 모든 출력은 반드시 순수 HTML 태그(<div>, <p>, <span>, <ul>, <li>, <strong>, <h3>, <hr>, <br>, <em> 등)로만 구성해야 합니다.
2. 마크다운 기호(**, ##, *, - 등)는 단 하나도 사용하지 마세요.
3. 주어진 [구글 검색 결과]에서 최신 요금, 운영시간, 특징 등 팩트만 발췌해서 괄호() 안에 채우세요. 지어내지 마세요.
"""

# ★ 실시간 구글 검색 함수
def search_google(query):
    if not GOOGLE_SEARCH_API_KEY or not GOOGLE_SEARCH_CX:
        print("⚠️ 구글 API 키가 없습니다. 검색 없이 진행합니다.")
        return "검색 결과 없음."
        
    url = "https://www.googleapis.com/customsearch/v1"
    params = {
        "key": GOOGLE_SEARCH_API_KEY,
        "cx": GOOGLE_SEARCH_CX,
        "q": query,
        "num": 3
    }
    
    try:
        print(f"🔍 구글 실시간 검색 중: {query}")
        res = requests.get(url, params=params)
        data = res.json()
        
        snippets = []
        for item in data.get("items", []):
            snippets.append(f"- 제목: {item.get('title')}\n  내용: {item.get('snippet')}")
            
        context = "\n\n".join(snippets)
        return context if context else "검색 결과가 충분하지 않습니다."
    except Exception as e:
        print(f"❌ 구글 검색 에러: {e}")
        return "검색 중 오류 발생."

# JSON 파일이 모두 완료되었을 때 AI가 스스로 새 리스트를 짜오는 함수
def generate_new_tasks_if_empty(tasks, json_path):
    pending_tasks = [t for t in tasks if t.get('status') != 'completed']
    if len(pending_tasks) > 0:
        return tasks
        
    print("\n🔄 [시스템 알림] 모든 타겟 작성이 완료되었습니다! AI가 새로운 필리핀 여행지를 발굴합니다...")
    
    # ★ 방어선 1: 이미 다뤘던 장소들의 이름을 뽑아서 AI에게 알려주고 금지시킵니다.
    existing_targets = [t.get('target_name') for t in tasks]
    existing_str = ", ".join(existing_targets)
    
    auto_prompt = f"""
    당신은 필리핀 현지 여행 전문가입니다.
    기존에 잘 알려진 대형 리조트나 명소 외에도, 사람들이 좋아할 만한 필리핀의 새로운 타겟 4곳을 추천해주세요.
    (골프장 1곳, 호텔/리조트 1곳, 관광지 1곳, 다이빙 포인트 1곳)
    
    [매우 중요한 규칙]
    아래 목록에 있는 장소들은 이미 글을 작성했으므로 **절대로 다시 추천하지 말고 완전히 새로운 곳을 찾아주세요.**
    제외할 장소 목록: {existing_str}
    
    반드시 아래의 순수 JSON 배열 형식으로만 대답하세요.
    [
      {{
        "target_name": "새로운 장소 이름 (영문명 포함)",
        "region": "지역명 (예: 세부, 보홀, 팔라완, 바탕가스 등)",
        "category_main": "travel",
        "category_sub": "golf",
        "status": "pending"
      }},
      ... (hotel, attraction, diving 도 동일한 형식으로 총 4개 작성)
    ]
    """
    
    try:
        ai_response = generate_text(prompt=auto_prompt, temperature=0.7, system_prompt="오직 순수 JSON 데이터만 반환하라.")
        clean_json_str = ai_response.replace("```json", "").replace("```", "").strip()
        new_tasks = json.loads(clean_json_str)
        
        if isinstance(new_tasks, list) and len(new_tasks) > 0:
            tasks.extend(new_tasks)
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(tasks, f, ensure_ascii=False, indent=2)
            print(f"✨ 성공! AI가 중복되지 않은 {len(new_tasks)}개의 새로운 타겟을 추가했습니다!\n")
            return tasks
    except Exception as e:
        print(f"❌ AI 새로운 리스트 자동 생성 실패: {e}")
        
    return tasks

def get_prompt_for_target(task, search_context):
    target = task['target_name']
    region = task['region']
    cat_sub = task['category_sub']
    
    context_text = f"""
    [구글 최신 검색 결과 (참고용)]
    {search_context}
    
    위 검색 결과를 최우선으로 참고하여, 아래 제공된 [HTML 템플릿]의 구조와 모든 인라인 스타일(style="...") 속성을 100% 똑같이 복사하고, 
    {target}의 실제 객관적 정보(팩트, 요금, 시간 등)만 괄호 ( ) 안에 채워 넣어주세요. 검색에 안 나오는 건 "현지 문의" 등으로 적으세요.
    """
    
    if cat_sub == "golf":
        return f"""
        타겟 골프장: {target} (지역: {region})
        {context_text}
        
        [HTML 템플릿]
        <div style="font-family: sans-serif; line-height: 1.6; color: #334155;">
            <p style="font-size: 1.05em; margin-bottom: 20px; color: #1e293b;">
                {region}에 위치한 <strong style="color: #2563eb; font-weight: 700;">{target}</strong>에 대한 최신 핵심 정보를 정리해 드립니다.
            </p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;">

            <h3 style="font-size: 1.15em; font-weight: 700; color: #1e40af; margin: 25px 0 10px 0; border-bottom: 2px solid #bfdbfe; padding-bottom: 5px;">
                ⛳ 1. 구장 프로필 (Basic Specs)
            </h3>
            <ul style="list-style: none; padding-left: 0; margin-bottom: 20px;">
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">구장명:</strong> {target}</li>
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">위치:</strong> (상세 주소 및 구글맵 정보)</li>
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">규모:</strong> (예: 18홀 / 72파 등)</li>
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">잔디 종류:</strong> (페어웨이 및 그린 잔디 종류)</li>
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">최신 요금/그린피:</strong> (검색된 대략적인 비용)</li>
            </ul>

            <h3 style="font-size: 1.15em; font-weight: 700; color: #1e40af; margin: 25px 0 10px 0; border-bottom: 2px solid #bfdbfe; padding-bottom: 5px;">
                🏌️‍♂️ 2. 운영 시스템 및 규정 (Field Policy)
            </h3>
            <ul style="list-style: none; padding-left: 0; margin-bottom: 20px;">
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">카트 및 캐디:</strong> (운영 방식)</li>
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">복장 규정:</strong> (허용 및 불가 복장)</li>
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">외부 음식:</strong> (반입 가능 여부)</li>
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">휴장일:</strong> (정기 관리일 등)</li>
            </ul>

            <h3 style="font-size: 1.15em; font-weight: 700; color: #1e40af; margin: 25px 0 10px 0; border-bottom: 2px solid #bfdbfe; padding-bottom: 5px;">
                🍽️ 3. 주변 인프라 (Logistics Hub)
            </h3>
            <ul style="list-style: none; padding-left: 0; margin-bottom: 20px;">
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">클럽하우스 식사:</strong> (주요 메뉴 및 한식 여부)</li>
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">주변 식당 (15분 내):</strong> (인근 추천 식당 종류)</li>
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">가장 가까운 숙소:</strong> (호텔/리조트명)</li>
            </ul>

            <h3 style="font-size: 1.15em; font-weight: 700; color: #1e40af; margin: 25px 0 10px 0; border-bottom: 2px solid #bfdbfe; padding-bottom: 5px;">
                🏪 4. 부대시설 정보 (Facilities)
            </h3>
            <ul style="list-style: none; padding-left: 0; margin-bottom: 20px;">
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">연습 시설:</strong> (드라이빙 레인지, 퍼팅장 등)</li>
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">편의 시설:</strong> (프로샵, 샤워실 등)</li>
            </ul>

            <h3 style="font-size: 1.15em; font-weight: 700; color: #1e40af; margin: 25px 0 10px 0; border-bottom: 2px solid #bfdbfe; padding-bottom: 5px;">
                💡 5. 골퍼를 위한 실무 팁 (Non-Subjective Tips)
            </h3>
            <ul style="list-style: none; padding-left: 0; margin-bottom: 20px;">
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">이동 시 주의사항:</strong> (트래픽이나 도로 상태 등)</li>
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">결제 방식:</strong> (카드/현금 사용 팁 등)</li>
            </ul>

            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;">
            <p style="color: #64748b; font-size: 0.9em; margin-top: 10px;">
                <em>※ 본 정보는 최신 웹 검색 데이터를 기반으로 요약되었으나, 현지 사정에 따라 변경될 수 있으므로 참고용으로 활용해 주시기 바랍니다.</em>
            </p>
        </div>
        """
        
    elif cat_sub == "hotel":
        return f"""
        타겟 호텔: {target} (지역: {region})
        {context_text}
        
        [HTML 템플릿]
        <div style="font-family: sans-serif; line-height: 1.6; color: #334155;">
            <p style="font-size: 1.05em; margin-bottom: 20px; color: #1e293b;">
                {region}에 위치한 <strong style="color: #2563eb; font-weight: 700;">{target}</strong>에 대한 최신 객관적 정보를 정리해 드립니다.
            </p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;">

            <h3 style="font-size: 1.15em; font-weight: 700; color: #1e40af; margin: 25px 0 10px 0; border-bottom: 2px solid #bfdbfe; padding-bottom: 5px;">
                🏨 1. 호텔 프로필 (Basic Specs)
            </h3>
            <ul style="list-style: none; padding-left: 0; margin-bottom: 20px;">
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">호텔명:</strong> {target}</li>
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">위치:</strong> (상세 주소)</li>
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">성급 및 오픈:</strong> (몇 성급, 언제 오픈/리모델링 했는지)</li>
            </ul>

            <h3 style="font-size: 1.15em; font-weight: 700; color: #1e40af; margin: 25px 0 10px 0; border-bottom: 2px solid #bfdbfe; padding-bottom: 5px;">
                🛏️ 2. 객실 및 규정 (Room & Policy)
            </h3>
            <ul style="list-style: none; padding-left: 0; margin-bottom: 20px;">
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">체크인/체크아웃:</strong> (시간)</li>
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">디파짓(보증금):</strong> (검색된 최신 요구 여부 및 요금)</li>
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">주요 객실 타입:</strong> (대표적인 방 종류)</li>
            </ul>

            <h3 style="font-size: 1.15em; font-weight: 700; color: #1e40af; margin: 25px 0 10px 0; border-bottom: 2px solid #bfdbfe; padding-bottom: 5px;">
                🍽️ 3. 부대시설 및 다이닝 (Facilities & Dining)
            </h3>
            <ul style="list-style: none; padding-left: 0; margin-bottom: 20px;">
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">수영장:</strong> (유무 및 특징, 이용 시간)</li>
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">다이닝:</strong> (조식당 및 주요 레스토랑)</li>
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">기타 시설:</strong> (피트니스, 카지노 등)</li>
            </ul>

            <h3 style="font-size: 1.15em; font-weight: 700; color: #1e40af; margin: 25px 0 10px 0; border-bottom: 2px solid #bfdbfe; padding-bottom: 5px;">
                🗺️ 4. 이동 및 주변 인프라 (Location Tips)
            </h3>
            <ul style="list-style: none; padding-left: 0; margin-bottom: 20px;">
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">공항 접근성:</strong> (가장 가까운 공항에서 걸리는 시간)</li>
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">주변 명소:</strong> (도보/단거리 이동 가능한 인프라)</li>
            </ul>

            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;">
            <p style="color: #64748b; font-size: 0.9em; margin-top: 10px;">
                <em>※ 본 정보는 최신 웹 검색 데이터를 기반으로 요약되었으나, 현지 사정에 따라 변경될 수 있으므로 참고용으로 활용해 주시기 바랍니다.</em>
            </p>
        </div>
        """
        
    elif cat_sub == "attraction":
        return f"""
        타겟 관광지: {target} (지역: {region})
        {context_text}
        
        [HTML 템플릿]
        <div style="font-family: sans-serif; line-height: 1.6; color: #334155;">
            <p style="font-size: 1.05em; margin-bottom: 20px; color: #1e293b;">
                {region}의 대표 관광 명소인 <strong style="color: #2563eb; font-weight: 700;">{target}</strong>에 대한 핵심 정보를 안내해 드립니다.
            </p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;">

            <h3 style="font-size: 1.15em; font-weight: 700; color: #1e40af; margin: 25px 0 10px 0; border-bottom: 2px solid #bfdbfe; padding-bottom: 5px;">
                🏞️ 1. 관광지 기본 정보 (Basic Info)
            </h3>
            <ul style="list-style: none; padding-left: 0; margin-bottom: 20px;">
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">명소 이름:</strong> {target}</li>
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">위치:</strong> (상세 주소)</li>
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">운영 시간:</strong> (오픈 및 마감 시간, 휴무일)</li>
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">입장료:</strong> (검색된 최신 성인/아동 요금)</li>
            </ul>

            <h3 style="font-size: 1.15em; font-weight: 700; color: #1e40af; margin: 25px 0 10px 0; border-bottom: 2px solid #bfdbfe; padding-bottom: 5px;">
                ✨ 2. 주요 볼거리 및 특징 (Highlights)
            </h3>
            <ul style="list-style: none; padding-left: 0; margin-bottom: 20px;">
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">대표 명물:</strong> (이곳에서 반드시 봐야 할 것)</li>
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">즐길 거리:</strong> (체험, 액티비티 등)</li>
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">소요 시간:</strong> (관람에 필요한 대략적인 시간)</li>
            </ul>

            <h3 style="font-size: 1.15em; font-weight: 700; color: #1e40af; margin: 25px 0 10px 0; border-bottom: 2px solid #bfdbfe; padding-bottom: 5px;">
                🗺️ 3. 접근성 및 주변 인프라 (Logistics)
            </h3>
            <ul style="list-style: none; padding-left: 0; margin-bottom: 20px;">
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">이동 방법:</strong> (주요 거점에서의 이동 팁)</li>
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">주변 연계 코스:</strong> (함께 방문하기 좋은 근처 명소)</li>
            </ul>

            <h3 style="font-size: 1.15em; font-weight: 700; color: #1e40af; margin: 25px 0 10px 0; border-bottom: 2px solid #bfdbfe; padding-bottom: 5px;">
                💡 4. 방문객 실무 팁 (Visitor Tips)
            </h3>
            <ul style="list-style: none; padding-left: 0; margin-bottom: 20px;">
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">추천 시간대:</strong> (사람이 덜 붐비거나 사진 찍기 좋은 시간)</li>
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">주의사항:</strong> (복장 제한, 소지품 등)</li>
            </ul>

            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;">
            <p style="color: #64748b; font-size: 0.9em; margin-top: 10px;">
                <em>※ 본 정보는 최신 웹 검색 데이터를 기반으로 요약되었으나, 현지 사정에 따라 변경될 수 있으므로 참고용으로 활용해 주시기 바랍니다.</em>
            </p>
        </div>
        """

    elif cat_sub == "diving":
        return f"""
        타겟 다이빙 포인트/샵: {target} (지역: {region})
        {context_text}
        
        [HTML 템플릿]
        <div style="font-family: sans-serif; line-height: 1.6; color: #334155;">
            <p style="font-size: 1.05em; margin-bottom: 20px; color: #1e293b;">
                {region}의 인기 다이빙 스팟인 <strong style="color: #2563eb; font-weight: 700;">{target}</strong>에 대한 핵심 정보를 정리해 드립니다.
            </p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;">

            <h3 style="font-size: 1.15em; font-weight: 700; color: #1e40af; margin: 25px 0 10px 0; border-bottom: 2px solid #bfdbfe; padding-bottom: 5px;">
                🤿 1. 포인트 프로필 (Point Specs)
            </h3>
            <ul style="list-style: none; padding-left: 0; margin-bottom: 20px;">
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">포인트명:</strong> {target}</li>
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">위치:</strong> (대략적인 바다 위치)</li>
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">권장 레벨:</strong> (오픈워터, 어드밴스드 등)</li>
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">비용/환경세:</strong> (검색된 환경세나 다이빙 비용 정보)</li>
            </ul>

            <h3 style="font-size: 1.15em; font-weight: 700; color: #1e40af; margin: 25px 0 10px 0; border-bottom: 2px solid #bfdbfe; padding-bottom: 5px;">
                🐠 2. 수중 환경 및 주요 생물 (Marine Life)
            </h3>
            <ul style="list-style: none; padding-left: 0; margin-bottom: 20px;">
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">지형 특징:</strong> (절벽, 산호초, 난파선 등)</li>
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">주요 관찰 생물:</strong> (거북이, 잭피쉬, 고래상어 등)</li>
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">조류 및 시야:</strong> (평균적인 조류 세기 및 시야 거리)</li>
            </ul>

            <h3 style="font-size: 1.15em; font-weight: 700; color: #1e40af; margin: 25px 0 10px 0; border-bottom: 2px solid #bfdbfe; padding-bottom: 5px;">
                🚤 3. 접근성 및 인프라 (Logistics)
            </h3>
            <ul style="list-style: none; padding-left: 0; margin-bottom: 20px;">
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">이동 소요 시간:</strong> (항구/비치에서 걸리는 시간)</li>
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">주변 인프라:</strong> (인근 다이빙 샵 밀집도 등)</li>
            </ul>

            <h3 style="font-size: 1.15em; font-weight: 700; color: #1e40af; margin: 25px 0 10px 0; border-bottom: 2px solid #bfdbfe; padding-bottom: 5px;">
                💡 4. 다이버 실무 팁 (Diving Tips)
            </h3>
            <ul style="list-style: none; padding-left: 0; margin-bottom: 20px;">
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">최적 시즌:</strong> (파도가 잔잔하고 시야가 좋은 달)</li>
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">주의사항:</strong> (환경 보호 규정 등)</li>
            </ul>

            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;">
            <p style="color: #64748b; font-size: 0.9em; margin-top: 10px;">
                <em>※ 바다 상황은 기상에 따라 달라질 수 있으므로, 현지 가이드의 지시에 따라 안전 다이빙하시기 바랍니다.</em>
            </p>
        </div>
        """

    return ""

def process_tasks():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(base_dir, 'ph_travel_tasks.json')
    
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            tasks = json.load(f)
    except Exception as e:
        print(f"JSON 로드 에러: {e}")
        return

    # ★ 자동 리스트 추가 (비어있으면 채우기)
    tasks = generate_new_tasks_if_empty(tasks, json_path)

    is_updated = False
    
    attempted_golf = False
    attempted_hotel = False
    attempted_attraction = False
    attempted_diving = False

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
        elif cat_sub == "attraction":
            if attempted_attraction: continue
            attempted_attraction = True
        elif cat_sub == "diving":
            if attempted_diving: continue
            attempted_diving = True

        target = task['target_name']
        print(f"\n⏳ [{target}] 정보 및 최신 팩트 수집 시작...")
        
        # ★ 방어선 2: DB 중복 게시물 사전 검사 (글쓰기 전에 DB를 뒤져서 중복을 원천 차단합니다!)
        try:
            res = supabase.table('posts').select('id').eq('category_sub', cat_sub).like('title', f"%{target}%").limit(1).execute()
            if len(res.data) > 0:
                print(f"⚠️ 이미 DB에 [{target}] 포스팅이 존재합니다! 구글 검색 및 작성을 건너뜁니다.")
                task['status'] = 'completed'  # 더 이상 이 타겟을 쳐다보지 않도록 완료 처리
                is_updated = True
                continue
        except Exception as e:
            print(f"DB 중복 검사 중 에러: {e}")

        # 1. 작성 전 구글 검색 실행 (요금/규정 확인)
        search_query = f"필리핀 {target} 가격 요금 후기"
        search_context = search_google(search_query)
        
        # 2. 검색된 데이터를 포함하여 AI 프롬프트 생성
        prompt = get_prompt_for_target(task, search_context)
        if not prompt:
            continue

        try:
            content = generate_text(prompt=prompt, temperature=0.2, system_prompt=SYSTEM_PROMPT)
            
            if content.startswith("❌"):
                print(f"❌ AI 생성 실패: {content}")
                continue
                
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

        if attempted_golf and attempted_hotel and attempted_attraction and attempted_diving:
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
