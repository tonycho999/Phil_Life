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

# 필정보 봇 계정의 UID (요청하신 ID 고정)
AUTHOR_ID = "7ceb52e2-28a9-422d-b932-2f95952b771c"

# 강력한 시스템 프롬프트: 마크다운 절대 금지, 순수 텍스트+HTML 태그만 허용
SYSTEM_PROMPT = """
당신은 필리핀 교민 및 여행객을 위한 전문 정보(비자, 교육, 법률, 의료, 통신) 웹사이트 게시판용 HTML 에디터입니다.
[절대 규칙]
1. 모든 출력은 반드시 순수 HTML 태그(<div>, <p>, <span>, <strong>, <h3>, <hr>, <br>, <em> 등)로만 구성해야 합니다.
2. 마크다운 기호(**, ##, *, - 등)는 단 하나도 사용하지 마세요.
3. ```html 이나 ``` 같은 코드 블록 기호도 절대 출력하지 마세요. 
"""

def get_prompt_for_target(task):
    target = task['target_name']
    region = task['region']
    cat_sub = task['category_sub']
    
    # 카테고리별로 AI에게 강조할 포인트를 다르게 지시합니다.
    focus_points = {
        "visa": "비자 종류, 발급 절차, 필요 서류, 수수료, 이민국 위치 및 주의사항",
        "edu": "국제학교/어학원 커리큘럼, 학비 수준, 입학 조건, 위치 및 시설 특징",
        "law": "주요 법률/세무 서비스 내용, 상담 절차, 교민 주의사항, 대략적인 소요 기간",
        "medical": "주요 진료 과목, 병원 규모, 응급실 운영 여부, 외국인/한국인 통역 지원 여부, 보험 적용",
        "comm": "통신사/인터넷 설치 절차, 요금제 비교, 필요 서류, 고객센터 정보, 장애 시 대처법"
    }
    
    focus_instruction = focus_points.get(cat_sub, "기본 정보, 상세 서비스 내용, 주의사항, 연락처 및 위치")

    return f"""
    타겟 정보: {target} (지역: {region})
    분야: {cat_sub}
    
    이 타겟에 대한 객관적이고 정확한 실무 정보({focus_instruction})를 조사하여 작성해 주세요.
    아래 제공된 [HTML 템플릿]의 구조와 모든 인라인 스타일(style="...") 속성을 100% 똑같이 복사하여 유지하면서, 
    괄호 ( ) 안에 실제 팩트 정보만 채워 넣어주세요.
    
    [HTML 템플릿 시작]
    <div style="font-family: 'Malgun Gothic', sans-serif; line-height: 1.7; color: #334155; max-width: 100%;">
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 25px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
            <p style="font-size: 1.1em; color: #0f172a; margin: 0; font-weight: bold;">
                <span style="color: #4f46e5;">{target}</span>에 대한 핵심 실무 정보를 정리해 드립니다.
            </p>
            <p style="font-size: 0.9em; color: #64748b; margin: 8px 0 0 0;">📍 지역: {region} | 🗂️ 분야: {cat_sub.upper()}</p>
        </div>

        <h3 style="font-size: 1.15em; font-weight: 700; color: #1e1b4b; margin: 30px 0 15px 0; border-left: 4px solid #4f46e5; padding-left: 12px;">
            📌 1. 기본 정보 (Basic Information)
        </h3>
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-bottom: 25px;">
            <p style="margin: 0 0 12px 0;"><strong style="color: #312e81; font-weight: 700;">• 기관/서비스명:</strong> {target}</p>
            <p style="margin: 0 0 12px 0;"><strong style="color: #312e81; font-weight: 700;">• 위치/주소:</strong> (정확한 주소 또는 대략적인 위치 정보)</p>
            <p style="margin: 0 0 12px 0;"><strong style="color: #312e81; font-weight: 700;">• 운영/진료 시간:</strong> (영업 시간, 휴무일 정보)</p>
            <p style="margin: 0;"><strong style="color: #312e81; font-weight: 700;">• 연락처:</strong> (전화번호, 웹사이트 또는 카카오톡 채널 등)</p>
        </div>

        <h3 style="font-size: 1.15em; font-weight: 700; color: #1e1b4b; margin: 30px 0 15px 0; border-left: 4px solid #4f46e5; padding-left: 12px;">
            📋 2. 상세 내용 및 절차 (Details & Procedures)
        </h3>
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-bottom: 25px;">
            <p style="margin: 0 0 12px 0;"><strong style="color: #312e81; font-weight: 700;">• 주요 서비스:</strong> (제공하는 핵심 업무나 진료/교육 내용)</p>
            <p style="margin: 0 0 12px 0;"><strong style="color: #312e81; font-weight: 700;">• 필요 서류/조건:</strong> (방문 전 준비해야 할 사항)</p>
            <p style="margin: 0;"><strong style="color: #312e81; font-weight: 700;">• 비용/소요시간:</strong> (대략적인 비용 및 수속, 진료, 설치 등에 걸리는 시간)</p>
        </div>

        <h3 style="font-size: 1.15em; font-weight: 700; color: #1e1b4b; margin: 30px 0 15px 0; border-left: 4px solid #4f46e5; padding-left: 12px;">
            💡 3. 교민/여행객 실전 팁 (Practical Tips)
        </h3>
        <div style="background-color: #eef2ff; border: 1px solid #c7d2fe; border-radius: 8px; padding: 18px; margin-bottom: 25px;">
            <p style="margin: 0 0 8px 0; color: #3730a3; font-weight: bold;">주의사항 및 팁:</p>
            <p style="margin: 0; color: #3730a3; font-size: 0.95em;">
                (실제 교민들이 겪는 유의사항, 붐비는 시간대 피하는 법, 언어 장벽 해결 팁 등 실용적인 조언 작성)
            </p>
        </div>

        <hr style="border: 0; border-top: 1px dashed #cbd5e1; margin: 30px 0 20px 0;">
        <p style="color: #94a3b8; font-size: 0.85em; text-align: center; margin: 0;">
            <em>※ 본 정보는 현지 사정(법령 개정, 정책 변경 등)에 따라 예고 없이 변동될 수 있으므로 방문 전 반드시 교차 검증하시기 바랍니다.</em>
        </p>
    </div>
    [HTML 템플릿 끝]
    """

def process_tasks():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    # 필정보용 JSON 파일 이름
    json_path = os.path.join(base_dir, 'ph_info_tasks.json')
    
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            tasks = json.load(f)
    except Exception as e:
        print(f"JSON 로드 에러 (ph_info_tasks.json 확인 필요): {e}")
        return

    is_updated = False
    
    # 각 서브 카테고리별로 1회 실행 여부를 체크하는 변수
    attempted = {
        "visa": False,
        "edu": False,
        "law": False,
        "medical": False,
        "comm": False
    }

    for task in tasks:
        if task.get('status') == 'completed':
            continue

        cat_sub = task['category_sub']
        
        # 딕셔너리에 정의된 서브 카테고리인지 확인 후, 이미 실행했다면 패스
        if cat_sub in attempted:
            if attempted[cat_sub]:
                continue
            attempted[cat_sub] = True
        else:
            # 알 수 없는 카테고리면 패스
            continue

        target = task['target_name']
        print(f"⏳ [필정보 - {cat_sub}] {target} 정보 생성 시작...")
        
        prompt = get_prompt_for_target(task)
        if not prompt:
            continue

        try:
            content = generate_text(prompt=prompt, temperature=0.3, system_prompt=SYSTEM_PROMPT)
            
            if content.startswith("❌"):
                print(f"❌ AI 생성 실패: {content}")
                continue
                
            # 코드 블록 잔해 제거
            content = content.replace("```html", "").replace("```", "").strip()
            
            # 게시글 제목
            title = f"[{task['region']}] {target} - 실무 및 이용 가이드"
            
            post_data = {
                "title": title,
                "content": content,
                "category_main": "info", # 필정보 (강제 지정)
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

        # 모든 카테고리를 한 번씩 시도했다면 루프 종료
        if all(attempted.values()):
            print("🎯 필정보 모든 카테고리 1회 시도 완료! 루프 종료.")
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
