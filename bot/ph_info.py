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

# 강력한 시스템 프롬프트: 마크다운 금지, 오직 HTML만
SYSTEM_PROMPT = """
당신은 필리핀 교민과 여행객을 위해 객관적인 팩트만 전달하는 정보 정리 에디터입니다.
[절대 규칙]
1. 모든 출력은 반드시 순수 HTML 태그(<div>, <p>, <span>, <ul>, <li>, <strong>, <h3>, <hr>, <br> 등)로만 구성하세요.
2. 마크다운 기호(**, ##, *, - 등) 및 코드 블록(```html)은 절대 사용하지 마세요.
3. 주어진 [구글 검색 결과]에서 수치(가격, 요금), 연락처, 운영시간 등 팩트만 발췌해서 괄호() 안에 채우세요. 검색 결과에 없는 내용은 "현지 확인 필요"라고 적으세요.
"""

# ★ 신규: 구글 실시간 검색 함수
def search_google(query):
    if not GOOGLE_SEARCH_API_KEY or not GOOGLE_SEARCH_CX:
        print("⚠️ 구글 API 키가 없습니다. 검색 없이 진행합니다.")
        return "검색 결과 없음."
        
    url = "https://www.googleapis.com/customsearch/v1"
    params = {
        "key": GOOGLE_SEARCH_API_KEY,
        "cx": GOOGLE_SEARCH_CX,
        "q": query,
        "num": 3  # 상위 3개 검색 결과만 가져옴
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

# ★ 신규: JSON이 비었을 때 필정보(Info) 타겟 자동 생성
def generate_new_info_tasks_if_empty(tasks, json_path):
    pending_tasks = [t for t in tasks if t.get('status') != 'completed']
    if len(pending_tasks) > 0:
        return tasks 
        
    print("\n🔄 [시스템 알림] 모든 정보 작성이 완료되었습니다! AI가 새로운 필리핀 생활/행정 정보를 발굴합니다...")
    
    auto_prompt = """
    당신은 필리핀 현지 전문가입니다. 필리핀 교민이나 장기 체류자가 꼭 알아야 할 생활/행정/의료/통신 정보 타겟 5개를 추천해주세요.
    (비자/이민국 1개, 학교/교육 1개, 병원/의료 1개, 통신사/인터넷 1개, 대사관/관공서 1개)
    
    반드시 아래의 순수 JSON 배열 형식으로만 대답하세요.
    [
      {
        "target_name": "예: 필리핀 운전면허증 (LTO) 발급 및 갱신",
        "region": "필리핀 전역",
        "category_main": "info",
        "category_sub": "law",
        "status": "pending"
      },
      ... (visa, edu, medical, comm 등 총 5개 작성)
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
            print(f"✨ 성공! AI가 {len(new_tasks)}개의 새로운 정보 타겟을 JSON에 추가했습니다!\n")
            return tasks
    except Exception as e:
        print(f"❌ AI 정보 리스트 자동 생성 실패: {e}")
        
    return tasks

def get_prompt_for_target(task, search_context):
    target = task['target_name']
    region = task['region']
    
    return f"""
    작성 타겟: {target} (지역: {region})
    
    [구글 최신 검색 결과 (참고용)]
    {search_context}
    
    위 검색 결과를 바탕으로 아래 [HTML 템플릿]의 구조와 스타일(style)을 100% 유지하면서,
    {target}에 대한 최신 요금, 시간, 절차 등 '객관적인 팩트'만 괄호 ( ) 안에 채워주세요.
    검색 결과에 명확한 숫자가 없다면 지어내지 말고 "(공식 채널 확인 필요)" 라고 적으세요.
    
    [HTML 템플릿]
    <div style="font-family: sans-serif; line-height: 1.6; color: #334155;">
        <p style="font-size: 1.05em; margin-bottom: 20px; color: #1e293b;">
            {region} <strong style="color: #2563eb; font-weight: 700;">{target}</strong>에 대한 최신 실무/행정 정보를 안내해 드립니다.
        </p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;">

        <h3 style="font-size: 1.15em; font-weight: 700; color: #1e40af; margin: 25px 0 10px 0; border-bottom: 2px solid #bfdbfe; padding-bottom: 5px;">
            📌 1. 기관/서비스 기본 정보
        </h3>
        <ul style="list-style: none; padding-left: 0; margin-bottom: 20px;">
            <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">명칭:</strong> {target}</li>
            <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">위치/주소:</strong> (실제 주소 또는 공식 홈페이지 링크)</li>
            <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">운영 시간:</strong> (영업/민원 접수 시간)</li>
            <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">연락처:</strong> (전화번호, 이메일 등)</li>
        </ul>

        <h3 style="font-size: 1.15em; font-weight: 700; color: #1e40af; margin: 25px 0 10px 0; border-bottom: 2px solid #bfdbfe; padding-bottom: 5px;">
            📋 2. 주요 업무 및 비용 (핵심 팩트)
        </h3>
        <ul style="list-style: none; padding-left: 0; margin-bottom: 20px;">
            <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">주요 서비스:</strong> (검색된 주요 업무/상품 2~3가지)</li>
            <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">비용/수수료:</strong> (검색된 최신 요금, 수수료, 가격 정보 기재)</li>
            <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">필요 서류/준비물:</strong> (방문 시 지참 항목)</li>
        </ul>

        <h3 style="font-size: 1.15em; font-weight: 700; color: #1e40af; margin: 25px 0 10px 0; border-bottom: 2px solid #bfdbfe; padding-bottom: 5px;">
            💡 3. 교민/방문객 실무 팁
        </h3>
        <ul style="list-style: none; padding-left: 0; margin-bottom: 20px;">
            <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">처리 기간/대기:</strong> (업무 처리에 걸리는 대략적인 시간)</li>
            <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">주의사항:</strong> (예약 필수, 복장 제한 등)</li>
        </ul>

        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;">
        <p style="color: #64748b; font-size: 0.9em; margin-top: 10px;">
            <em>※ 본 정보는 웹 검색 데이터를 기반으로 요약되었으나, 현지 사정에 따라 예고 없이 변경될 수 있으므로 방문 전 반드시 공식 채널을 확인하시기 바랍니다.</em>
        </p>
    </div>
    """

def process_tasks():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(base_dir, 'ph_info_tasks.json')
    
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            tasks = json.load(f)
    except Exception as e:
        print(f"JSON 로드 에러: {e}")
        return

    # ★ AI 자동 확장 로직 실행
    tasks = generate_new_info_tasks_if_empty(tasks, json_path)

    is_updated = False
    attempted_count = 0

    for task in tasks:
        if task.get('status') == 'completed':
            continue

        target = task['target_name']
        print(f"\n⏳ [{target}] 팩트 수집 및 생성 시작...")
        
        # 1. 구글 검색으로 최신 데이터 가져오기
        search_query = f"필리핀 {target} 최신 요금 서류 시간"
        search_context = search_google(search_query)
        
        # 2. 검색 데이터를 포함하여 프롬프트 생성
        prompt = get_prompt_for_target(task, search_context)

        try:
            # 3. AI에게 팩트 요약 작성 지시
            content = generate_text(prompt=prompt, temperature=0.2, system_prompt=SYSTEM_PROMPT)
            
            if content.startswith("❌"):
                print(f"❌ AI 생성 실패: {content}")
                continue
                
            content = content.replace("```html", "").replace("```", "").strip()
            title = f"[{task['region']}] {target} - 실무 및 이용 가이드"
            
            post_data = {
                "title": title,
                "content": content,
                "category_main": task['category_main'],
                "category_sub": task['category_sub'],
                "author_id": AUTHOR_ID,
                "is_hidden": False,
                "format": "html"
            }
            
            data, count = supabase.table('posts').insert(post_data).execute()
            print(f"✅ [{target}] DB 저장 완료!")
            
            task['status'] = 'completed'
            is_updated = True
            attempted_count += 1
            time.sleep(5)
            
        except Exception as e:
            print(f"❌ [{target}] 처리 중 에러 발생: {e}")

        # 1회 실행 시 2개씩만 작성하도록 제한 (API 보호 및 트래픽 분산)
        if attempted_count >= 2:
            print("🎯 1회 목표량(2건) 작성 완료. 루프 종료.")
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
