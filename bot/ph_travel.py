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
AUTHOR_ID = "451341d5-6bf9-4579-9eb2-4533514f17f7"

# 강력한 시스템 프롬프트: 마크다운 절대 금지, 순수 텍스트+HTML 태그만 허용
SYSTEM_PROMPT = """
당신은 웹사이트 게시판용 HTML 전문 에디터입니다.
[절대 규칙]
1. 모든 출력은 반드시 순수 HTML 태그(<div>, <p>, <span>, <ul>, <li>, <strong>, <h3>, <hr>, <br>, <em> 등)로만 구성해야 합니다.
2. 마크다운 기호(**, ##, *, - 등)는 단 하나도 사용하지 마세요.
3. ```html 이나 ``` 같은 코드 블록 기호도 절대 출력하지 마세요. 
"""

def get_prompt_for_target(task):
    target = task['target_name']
    region = task['region']
    cat_sub = task['category_sub']
    
    if cat_sub == "golf":
        return f"""
        타겟 골프장: {target} (지역: {region})
        
        아래 제공된 [HTML 템플릿]의 구조와 모든 인라인 스타일(style="...") 속성을 100% 똑같이 복사하여 유지하면서, 
        {target}의 실제 객관적 정보(팩트)만 괄호 ( ) 안에 채워 넣어주세요. 주관적 평가는 제외하세요.
        
        [HTML 템플릿]
        <div style="font-family: sans-serif; line-height: 1.6; color: #334155;">
            <p style="font-size: 1.05em; margin-bottom: 20px; color: #1e293b;">
                {region}에 위치한 <strong style="color: #2563eb; font-weight: 700;">{target}</strong>에 대한 핵심 정보를 정리해 드립니다.
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
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">티오프 간격:</strong> (분 단위 간격)</li>
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
                <em>※ 본 정보는 현지 사정에 따라 일부 변경될 수 있으므로 방문 전 참고용으로 활용해 주시기 바랍니다.</em>
            </p>
        </div>
        """
        
    elif cat_sub == "hotel":
        return f"""
        타겟 호텔: {target} (지역: {region})
        
        아래 제공된 [HTML 템플릿]의 구조와 모든 인라인 스타일(style="...") 속성을 100% 똑같이 복사하여 유지하면서, 
        {target}의 실제 객관적 정보(팩트)만 괄호 ( ) 안에 채워 넣어주세요. 주관적 평가는 제외하세요.
        
        [HTML 템플릿]
        <div style="font-family: sans-serif; line-height: 1.6; color: #334155;">
            <p style="font-size: 1.05em; margin-bottom: 20px; color: #1e293b;">
                {region}에 위치한 <strong style="color: #2563eb; font-weight: 700;">{target}</strong>에 대한 객관적인 정보를 정리해 드립니다.
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
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">디파짓(보증금):</strong> (요구 여부 및 방식)</li>
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">주요 객실 타입:</strong> (대표적인 방 종류)</li>
            </ul>

            <h3 style="font-size: 1.15em; font-weight: 700; color: #1e40af; margin: 25px 0 10px 0; border-bottom: 2px solid #bfdbfe; padding-bottom: 5px;">
                🍽️ 3. 부대시설 및 다이닝 (Facilities & Dining)
            </h3>
            <ul style="list-style: none; padding-left: 0; margin-bottom: 20px;">
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">수영장:</strong> (유무 및 특징)</li>
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
                <em>※ 본 정보는 현지 사정에 따라 일부 변경될 수 있으므로 방문 전 참고용으로 활용해 주시기 바랍니다.</em>
            </p>
        </div>
        """
        
    elif cat_sub == "attraction":
        return f"""
        타겟 관광지: {target} (지역: {region})
        
        아래 제공된 [HTML 템플릿]의 구조와 모든 인라인 스타일(style="...") 속성을 100% 똑같이 복사하여 유지하면서, 
        {target}의 실제 객관적 정보(팩트)만 괄호 ( ) 안에 채워 넣어주세요. 주관적 평가는 제외하세요.
        
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
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">입장료:</strong> (성인/아동 요금 기준)</li>
            </ul>

            <h3 style="font-size: 1.15em; font-weight: 700; color: #1e40af; margin: 25px 0 10px 0; border-bottom: 2px solid #bfdbfe; padding-bottom: 5px;">
                ✨ 2. 주요 볼거리 및 특징 (Highlights)
            </h3>
            <ul style="list-style: none; padding-left: 0; margin-bottom: 20px;">
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">대표 명물:</strong> (이곳에서 반드시 봐야 할 것)</li>
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">즐길 거리:</strong> (체험, 액티비티, 사진 포인트 등)</li>
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">소요 시간:</strong> (관람에 필요한 대략적인 시간)</li>
            </ul>

            <h3 style="font-size: 1.15em; font-weight: 700; color: #1e40af; margin: 25px 0 10px 0; border-bottom: 2px solid #bfdbfe; padding-bottom: 5px;">
                🗺️ 3. 접근성 및 주변 인프라 (Logistics)
            </h3>
            <ul style="list-style: none; padding-left: 0; margin-bottom: 20px;">
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">이동 방법:</strong> (주요 거점에서의 대중교통 또는 그랩/택시 이용 팁)</li>
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">주변 연계 코스:</strong> (함께 방문하기 좋은 근처 명소)</li>
            </ul>

            <h3 style="font-size: 1.15em; font-weight: 700; color: #1e40af; margin: 25px 0 10px 0; border-bottom: 2px solid #bfdbfe; padding-bottom: 5px;">
                💡 4. 방문객 실무 팁 (Visitor Tips)
            </h3>
            <ul style="list-style: none; padding-left: 0; margin-bottom: 20px;">
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">추천 시간대:</strong> (사람이 덜 붐비거나 사진 찍기 좋은 시간)</li>
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">주의사항:</strong> (복장 제한, 소지품 주의, 자외선 차단 등)</li>
            </ul>

            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;">
            <p style="color: #64748b; font-size: 0.9em; margin-top: 10px;">
                <em>※ 본 정보는 현지 사정에 따라 일부 변경될 수 있으므로 방문 전 참고용으로 활용해 주시기 바랍니다.</em>
            </p>
        </div>
        """

    elif cat_sub == "diving":
        return f"""
        타겟 다이빙 포인트/샵: {target} (지역: {region})
        
        아래 제공된 [HTML 템플릿]의 구조와 모든 인라인 스타일(style="...") 속성을 100% 똑같이 복사하여 유지하면서, 
        {target}의 실제 객관적 정보(팩트)만 괄호 ( ) 안에 채워 넣어주세요. 주관적 평가는 제외하세요.
        
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
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">위치:</strong> (대략적인 바다 위치 및 접근 출발지)</li>
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">권장 레벨:</strong> (오픈워터, 어드밴스드 등 요구 자격)</li>
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">최대 수심/조류:</strong> (평균 수심 및 조류 강도)</li>
            </ul>

            <h3 style="font-size: 1.15em; font-weight: 700; color: #1e40af; margin: 25px 0 10px 0; border-bottom: 2px solid #bfdbfe; padding-bottom: 5px;">
                🐠 2. 수중 환경 및 주요 생물 (Marine Life)
            </h3>
            <ul style="list-style: none; padding-left: 0; margin-bottom: 20px;">
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">지형 특징:</strong> (절벽, 산호초, 난파선, 동굴 등)</li>
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">주요 관찰 생물:</strong> (거북이, 잭피쉬, 고래상어 등 기대 어종)</li>
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">시야:</strong> (평균적인 수중 시야 거리)</li>
            </ul>

            <h3 style="font-size: 1.15em; font-weight: 700; color: #1e40af; margin: 25px 0 10px 0; border-bottom: 2px solid #bfdbfe; padding-bottom: 5px;">
                🚤 3. 접근성 및 다이브 샵 인프라 (Logistics)
            </h3>
            <ul style="list-style: none; padding-left: 0; margin-bottom: 20px;">
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">이동 소요 시간:</strong> (항구 또는 비치에서 보트로 걸리는 시간)</li>
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">주변 인프라:</strong> (인근 다이빙 리조트 밀집도 등)</li>
            </ul>

            <h3 style="font-size: 1.15em; font-weight: 700; color: #1e40af; margin: 25px 0 10px 0; border-bottom: 2px solid #bfdbfe; padding-bottom: 5px;">
                💡 4. 다이버 실무 팁 (Diving Tips)
            </h3>
            <ul style="list-style: none; padding-left: 0; margin-bottom: 20px;">
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">최적 시즌:</strong> (파도가 잔잔하고 시야가 좋은 달)</li>
                <li style="margin-bottom: 8px; padding-left: 15px; text-indent: -15px;"><span style="color: #3b82f6; font-weight: bold;">•</span> <strong style="font-weight: 700; color: #0f172a;">주의사항:</strong> (환경 보호 규정 및 위험 요소)</li>
            </ul>

            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;">
            <p style="color: #64748b; font-size: 0.9em; margin-top: 10px;">
                <em>※ 바다 상황은 당일 기상과 조류에 따라 달라질 수 있으므로, 항상 현지 가이드의 지시에 따라 안전 다이빙하시기 바랍니다.</em>
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

    is_updated = False
    
    # 각 카테고리별 1회 실행 확인용 변수
    attempted_golf = False
    attempted_hotel = False
    attempted_attraction = False
    attempted_diving = False

    for task in tasks:
        if task.get('status') == 'completed':
            continue

        cat_sub = task['category_sub']
        
        # 카테고리별 중복 시도 방지 로직
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
        print(f"⏳ [{target}] 정보 생성 시작...")
        
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

        # 4가지 카테고리 모두 한 번씩 시도했다면 루프 종료
        if attempted_golf and attempted_hotel and attempted_attraction and attempted_diving:
            print("🎯 1회 목표량(골프, 호텔, 관광지, 다이빙) 시도 완료! 루프 종료.")
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
