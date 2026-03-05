import os
import re
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# ★ Gemini API 키 로드
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def get_flash_model_list() -> list:
    """
    [최신 Flash 모델 자동 추출 및 정렬 로직]
    사용 가능한 모델 목록을 불러와서 최신 버전(이름 역순)부터 시도하도록 리스트를 만듭니다.
    """
    try:
        models = genai.list_models()
        flash_models = []
        
        for m in models:
            if 'generateContent' in m.supported_generation_methods:
                name = m.name.lower()
                # 'pro', 'lite', 'exp', 'vision' 등 불안정/고가 모델 제외
                if 'gemini' in name and 'flash' in name:
                    if all(bad not in name for bad in ['pro', 'lite', 'exp', 'vision']):
                        flash_models.append(m.name)
        
        if flash_models:
            # 이름을 역순 정렬하여 최신 버전(예: 3.5 -> 3.0 -> 2.5)이 맨 앞에 오도록 함
            flash_models.sort(reverse=True)
            return flash_models
            
        # ★ 만약 아무것도 안 잡히면 최후의 보루: 2.5 Flash
        return ["models/gemini-2.5-flash"]
        
    except Exception as e:
        print(f"⚠️ 모델 목록 검색 실패: {e}")
        return ["models/gemini-2.5-flash"]

def generate_text(prompt: str, temperature: float = 0.5, system_prompt: str = "") -> str:
    """Gemini AI로 텍스트를 생성하는 공통 함수 (에러 시 자동 릴레이 시도 포함)"""
    if not GEMINI_API_KEY:
        return "❌ [오류] GEMINI_API_KEY가 설정되지 않았습니다."

    available_models = get_flash_model_list()

    # ★ 핵심: 최신 버전부터 순서대로 번역을 맡겨보고, 404 에러 등으로 튕기면 다음 버전으로 자동 넘어감!
    for model_name in available_models:
        print(f"🧠 [AI 모델 시도] {model_name} (최신 Flash 최적화)")
        try:
            model = genai.GenerativeModel(
                model_name=model_name,
                system_instruction=system_prompt if system_prompt else None,
                generation_config=genai.types.GenerationConfig(
                    temperature=temperature,
                )
            )
            
            response = model.generate_content(prompt)
            return response.text.strip()
            
        except Exception as e:
            # 구글이 메뉴판엔 올려두고 막상 안 빌려주면(404 등) 쿨하게 다음 모델로 패스!
            print(f"⚠️ [{model_name} 거부됨]: 다음 버전으로 재시도합니다. (사유: {e})")
            continue
            
    return "❌ [AI 통신 최종 실패] 사용 가능한 모든 Flash 모델이 응답을 거부했습니다."

# ==========================================
# ★ 다중인격 번역 로직 (편집장 vs 전문 번역가)
# ==========================================
def translate_to_korean(eng_text: str, is_title: bool = False) -> str:
    """영어 뉴스를 전문적인 한국어로 번역합니다."""
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
    
    temperature = 0.4 if is_title else 0.1
    content = generate_text(user_prompt, temperature=temperature, system_prompt=system_prompt)
    
    if content.startswith("❌"):
        return content
        
    content = re.sub(r'<think>.*?</think>', '', content, flags=re.DOTALL).strip()
    content = re.sub(r'^(Here is|번역:|Translated|제목:|Headline:|\*\*).*?\n', '', content, flags=re.IGNORECASE).strip()
    
    if is_title:
        content = content.strip('"\'-`* ')
    
    return content
