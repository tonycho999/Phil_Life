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
    [비용 최적화 & 안정성 우선 모델 자동 선택 로직]
    'lite'나 'exp(실험)' 같은 불안정한 모델을 피하고, 
    가장 안정적이고 가성비 좋은 정규 'flash' 모델을 선택합니다.
    """
    try:
        models = genai.list_models()
        available_flash_models = []
        
        for m in models:
            # 텍스트 생성(generateContent)을 지원하는 모델 중에서
            if 'generateContent' in m.supported_generation_methods:
                name = m.name.lower()
                # 'pro', 'lite', 'exp' 등 에러를 뿜거나 비싼 모델 싹 다 제외!
                if 'gemini' in name and 'flash' in name:
                    if 'pro' not in name and 'lite' not in name and 'exp' not in name:
                        available_flash_models.append(m.name)
        
        if available_flash_models:
            # 필터링된 가장 안정적인 정규 Flash 모델을 우선적으로 선택합니다.
            # (만약 2.0-flash나 1.5-flash가 있다면 그것을 씁니다)
            for model_name in available_flash_models:
                if '1.5-flash' in model_name or '2.0-flash' in model_name:
                    return model_name
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
    print(f"🧠 [AI 모델] {selected_model_name} 사용 중 (가성비+안정성 최적화)")

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
