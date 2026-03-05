import os
import re # ★ 정규표현식 모듈 추가 (물리적 절단용)
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# 2개의 Groq 키를 리스트로 준비
GROQ_KEYS = [
    os.getenv("GROQ_API_KEY_1"),
    os.getenv("GROQ_API_KEY_2")
]
valid_groq_keys = [key for key in GROQ_KEYS if key]

def get_dynamic_model(client: Groq) -> str:
    """
    [최적화된 모델 선택 로직]
    1. 채팅 불가 모델(Audio, Vision, Guard) 제외
    2. 비표준 응답 모델(Compound) 제외
    3. 약관 동의 필요 모델(Canopylabs) 제외
    4. 중단 예정 모델(Maverick) 제외
    """
    try:
        models = client.models.list()
        
        for m in models.data:
            mid = m.id
            
            # 채팅용이 아니거나 에러를 유발하는 모델군 필터링
            if ('whisper' in mid or 
                'vision' in mid or 
                'llava' in mid or 
                'guard' in mid or 
                'compound' in mid or 
                'canopylabs' in mid):
                continue
            
            # 중단 예정 모델 제외
            if "llama-4-maverick-17b-128e-instruct" in mid:
                continue
            
            # 안전한 모델 발견 시 즉시 반환
            return str(mid)
            
        # 모델이 없으면 가장 안전한 기본값
        print("⚠️ 적합한 모델을 찾지 못했습니다. 기본 모델을 사용합니다.")
        return "llama-3.1-8b-instant"

    except Exception as e:
        print(f"⚠️ 모델 선택 중 에러 발생: {e}. 기본 모델을 사용합니다.")
        return "llama-3.1-8b-instant"

# ★ system_prompt 매개변수 추가: AI에게 아주 강력한 '시스템적 족쇄'를 채우기 위함
def generate_text(prompt: str, temperature: float = 0.5, system_prompt: str = "") -> str:
    """프롬프트를 받아 Groq AI로 텍스트를 생성하는 공통 함수"""
    if not valid_groq_keys:
        return "❌ [오류] Groq API 키가 설정되지 않았습니다."

    for i, key in enumerate(valid_groq_keys):
        try:
            client = Groq(api_key=key)
            
            # 동적으로 가장 안전한 모델을 가져옵니다.
            selected_model = get_dynamic_model(client)
            print(f"🧠 [AI 모델] {selected_model} (키: {i+1}번 사용 중)")
            
            # 메시지 구성 (시스템 프롬프트가 있으면 맨 앞에 추가)
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})
            
            chat_completion = client.chat.completions.create(
                messages=messages,
                model=selected_model,
                temperature=temperature,
            )
            return chat_completion.choices[0].message.content.strip()
        except Exception as e:
            print(f"⚠️ [Groq 경고] {i+1}번 키 실패. 다음 키로 재시도합니다... (사유: {e})")
            continue
            
    return "❌ [Groq 최종 실패] 모든 API 키 한도 초과 또는 에러"

# ==========================================
# ★ 여기부터 수정됨: 다중인격 번역 (편집장 vs 번역가)
# ==========================================
def translate_to_korean(eng_text: str, is_title: bool = False) -> str:
    """영어 뉴스를 전문적인 한국어로 번역합니다. (is_title=True 이면 헤드라인 압축 모드)"""
    if not eng_text: 
        return ""
    
    # ★ 핵심: 제목 번역일 때와 본문 번역일 때 AI의 페르소나(역할)를 완벽하게 분리!
    if is_title:
        system_prompt = """You are a veteran news editor with 20 years of experience at a top Korean news agency. 
Your task is to translate the given English text into a catchy, punchy, and natural Korean news headline.
- MUST be concise (around 30-40 characters).
- MUST sound like a real Korean news headline (e.g., ending with nouns like '추방', '검거', '논란', '합의').
- Output ONLY the translated headline text. No quotes, no explanations, no <think> tags."""
    else:
        system_prompt = "You are a professional news translator. Your ONLY job is to translate the given English text into natural, professional Korean. Output ONLY the translated Korean text. Do NOT add any conversational filler, explanations, or notes."
        
    user_prompt = f"Translate this:\n\n{eng_text}"
    
    # 제목은 0.3(자연스러운 의역 허용), 본문은 0.1(엄격한 직역)로 뇌 온도를 조절합니다.
    temperature = 0.3 if is_title else 0.1
    content = generate_text(user_prompt, temperature=temperature, system_prompt=system_prompt)
    
    # 에러가 반환된 경우 처리
    if content.startswith("❌"):
        return content
        
    # ★ 족쇄 3: 물리적 수술! <think> ... </think> 태그와 그 안의 내용물 통째로 삭제
    content = re.sub(r'<think>.*?</think>', '', content, flags=re.DOTALL).strip()
    
    # ★ 족쇄 4: 혹시라도 남은 쓸데없는 인사말/도입부 첫 문장 날려버리기
    content = re.sub(r'^(Here is|번역:|Translated|제목:|Headline:).*?\n', '', content, flags=re.IGNORECASE).strip()
    
    # 제목일 경우 쓸데없이 붙은 양끝 따옴표 제거
    if is_title:
        content = content.strip('"\'-`')
    
    # ★ 족쇄 5: 무한 반복 버그 감지 (똑같은 글자가 10번 이상 반복되면 차라리 원문 출력)
    if re.search(r'(.)\1{10,}', content):
        print("⚠️ 무한 반복 버그 감지! 원문으로 대체합니다.")
        return "(AI 번역 오류로 원문을 표시합니다)\n\n" + eng_text
        
    return content
