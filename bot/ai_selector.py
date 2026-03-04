import os
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

def generate_text(prompt: str, temperature: float = 0.5) -> str:
    """프롬프트를 받아 Groq AI로 텍스트를 생성하는 공통 함수"""
    if not valid_groq_keys:
        return "❌ [오류] Groq API 키가 설정되지 않았습니다."

    for i, key in enumerate(valid_groq_keys):
        try:
            client = Groq(api_key=key)
            
            # ★ 동적으로 가장 안전한 모델을 가져옵니다.
            selected_model = get_dynamic_model(client)
            print(f"🧠 [AI 모델] {selected_model} (키: {i+1}번 사용 중)")
            
            chat_completion = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=selected_model,
                temperature=temperature,
            )
            return chat_completion.choices[0].message.content.strip()
        except Exception as e:
            print(f"⚠️ [Groq 경고] {i+1}번 키 실패. 다음 키로 재시도합니다... (사유: {e})")
            continue
            
    return "❌ [Groq 최종 실패] 모든 API 키 한도 초과 또는 에러"

def translate_to_korean(eng_text: str) -> str:
    """영어 뉴스를 전문적인 한국어로 번역합니다."""
    if not eng_text: 
        return ""
    
    prompt = f"""
    You are a professional translator for a Korean community in the Philippines.
    Translate the following English news text into natural, professional Korean.
    Just provide the translated text, no extra comments or quotation marks.
    
    Text to translate:
    {eng_text}
    """
    return generate_text(prompt, temperature=0.3)
