import os
import re
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# ★ Gemini API 키 로드
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def get_dynamic_gemini_model() -> str:
    """
    [비용 최적화 모델 자동 선택 로직]
    1. 구글 서버에서 현재 사용 가능한 모든 모델 목록을 가져옴
    2. 무겁고 비싼 'pro' 모델은 무조건 제외
    3. 빠르고 저렴한 'flash' 모델만 필터링 (flash-8b 같은 초저가 모델이 있다면 최우선)
    """
    try:
        models = genai.list_models()
        available_flash_models = []
        
        for m in models:
            # 텍스트 생성(generateContent)을 지원하는 모델 중에서
            if 'generateContent' in m.supported_generation_methods:
                name = m.name.lower()
                # 'gemini'와 'flash'가 포함되어 있고, 'pro'는 없는 모델만 쏙쏙 뽑아냅니다.
                if 'gemini' in name and 'flash' in name and 'pro' not in name:
                    available_flash_models.append(m.name)
        
        if available_flash_models:
            # Flash 중에서도 '8b'나 'lite' 같은 초경량/초저가 모델이 있으면 가장 먼저 선택!
            for model_name in available_flash_models:
                if '8b' in model_name or 'lite' in model_name:
                    return model_name
            # 없으면 검색된 첫 번째 Flash 모델 사용
            return available_flash_models[0]
            
        print("⚠️ Flash 모델을 찾지 못했습니다. 기본 모델로 폴백합니다.")
        return "models/gemini-1.5-flash"
        
    except Exception as e:
        print(f"⚠️ 모델 검색 중 에러 발생: {e}. 기본 모델을 사용합니다.")
        return "models/gemini-1.5-flash"

def generate_text(prompt: str, temperature: float = 0.5, system_prompt: str = "") -> str:
    """Gemini AI로 텍스트를 생성하는 공통 함수"""
    if not GEMINI_API_KEY:
        return "❌ [오류] GEMINI_API_KEY가 설정되지 않았습니다."

    selected_model_name = get_dynamic_gemini_model()
    print(f"🧠 [AI 모델] {selected_model_name} 사용 중 (가성비 Flash 최적화)")

    try:
        # Gemini 1.5 이상부터 지원하는 system_instruction 기능으로 강력한 족쇄 채우기
        model = genai.GenerativeModel(
            model_name=selected_model_name,
            system_instruction=system_prompt if system_prompt else None,
            generation_config=genai.types.GenerationConfig(
                temperature=temperature,
            )
        )
        
        response = model.generate_content(prompt)
        return response.text.strip()
        
    except Exception as e:
        print(f"⚠️ [Gemini 에러 발생]: {e}")
        return f"❌ [AI 통신 실패] 사유: {e}"

# ==========================================
# ★ 다중인격 번역 로직 (편집장 vs 전문 번역가)
# ==========================================
def translate_to_korean(eng_text: str, is_title: bool = False) -> str:
    """영어 뉴스를 전문적인 한국어로 번역합니다. (is_title=True 이면 헤드라인 압축 모드)"""
    if not eng_text: 
        return ""
    
    if is_title:
        system_prompt = """You are a veteran news editor with 20 years of experience at a top Korean news agency. 
Your task is to translate the given English text into a catchy, punchy, and natural Korean news headline.
- MUST be concise (around 30-40 characters).
- MUST sound like a real Korean news headline (e.g., ending with nouns like '추방', '검거', '논란', '합의').
- Output ONLY the translated headline text. No quotes, no explanations, no markdown."""
    else:
        system_prompt = "You are a professional news translator. Your ONLY job is to translate the given English text into natural, professional Korean. Output ONLY the translated Korean text. Do NOT add any conversational filler, explanations, markdown, or notes."
        
    user_prompt = f"Translate this:\n\n{eng_text}"
    
    # Gemini는 똑똑해서 온도를 0.4 / 0.1 정도로 살짝만 주어도 말을 아주 잘 듣습니다.
    temperature = 0.4 if is_title else 0.1
    content = generate_text(user_prompt, temperature=temperature, system_prompt=system_prompt)
    
    if content.startswith("❌"):
        return content
        
    # 만에 하나 들어올 수 있는 불필요한 태그나 문구 필터링 (보험용)
    content = re.sub(r'<think>.*?</think>', '', content, flags=re.DOTALL).strip()
    content = re.sub(r'^(Here is|번역:|Translated|제목:|Headline:|\*\*).*?\n', '', content, flags=re.IGNORECASE).strip()
    
    if is_title:
        content = content.strip('"\'-`* ')
    
    return content
