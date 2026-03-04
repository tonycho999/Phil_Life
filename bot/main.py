import os
import re
import requests
from dotenv import load_dotenv
from groq import Groq

# 환경 변수 로드
load_dotenv()

# API 키 가져오기
NAVER_CLIENT_ID = os.getenv("NAVER_CLIENT_ID")
NAVER_CLIENT_SECRET = os.getenv("NAVER_CLIENT_SECRET")
GNEWS_API_KEY = os.getenv("GNEWS_API_KEY")

# ★ GROQ 키 2개를 리스트로 준비
GROQ_KEYS = [
    os.getenv("GROQ_API_KEY_1"),
    os.getenv("GROQ_API_KEY_2")
]
# 값이 비어있지 않은 유효한 키만 걸러내기
valid_groq_keys = [key for key in GROQ_KEYS if key]

# HTML 태그 제거용 함수
def clean_html(raw_html):
    cleanr = re.compile('<.*?>|&([a-z0-9]+|#[0-9]{1,6}|#x[0-9a-f]{1,6});')
    return re.sub(cleanr, '', raw_html)

# ---------------------------------------------------------
# 1. 필한뉴스 (Naver API) 작동 로직
# ---------------------------------------------------------
def fetch_naver_news():
    print("\n🤖 [필한뉴스] 네이버에서 필리핀 뉴스를 검색합니다...")
    url = "https://openapi.naver.com/v1/search/news.json"
    headers = {
        "X-Naver-Client-Id": NAVER_CLIENT_ID,
        "X-Naver-Client-Secret": NAVER_CLIENT_SECRET
    }
    params = {"query": "필리핀", "display": 1, "sort": "sim"}
    
    response = requests.get(url, headers=headers, params=params)
    
    if response.status_code == 200:
        data = response.json()
        if data['items']:
            item = data['items'][0]
            title = clean_html(item['title'])
            desc = clean_html(item['description'])
            link = item['link']
            
            print("✅ [필한뉴스 성공]")
            print(f"🔹 제목: {title}")
            print(f"🔹 요약: {desc}")
            return {"title": title, "content": f"{desc}\n\n자세히 보기: {link}"}
    else:
        print(f"❌ [네이버 API 에러] {response.status_code}: {response.text}")
    return None

# ---------------------------------------------------------
# 2. 필뉴스 (Gnews + Groq 번역 API) 작동 로직
# ---------------------------------------------------------
def translate_to_korean(text):
    if not text: return ""
    if not valid_groq_keys:
        print("❌ [경고] 설정된 Groq API 키가 없습니다!")
        return text

    prompt = f"""
    You are a professional translator for a Korean community in the Philippines.
    Translate the following English news text into natural, professional Korean.
    Just provide the translated text, no extra comments.
    
    Text to translate:
    {text}
    """
    
    # ★ 핵심: 1번 키 시도 -> 실패하면 2번 키로 재시도
    for i, key in enumerate(valid_groq_keys):
        try:
            client = Groq(api_key=key)
            chat_completion = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama-3.3-70b-versatile",
                temperature=0.3,
            )
            return chat_completion.choices[0].message.content.strip()
        except Exception as e:
            print(f"⚠️ [Groq 번역 경고] {i+1}번 키 실패, 다음 키를 시도합니다... (사유: {e})")
            continue # 에러 나면 다음 키로 넘어감
            
    print("❌ [Groq 번역 최종 실패] 모든 API 키의 요청 한도가 초과되었거나 문제가 발생했습니다.")
    return text

def fetch_gnews_and_translate():
    print("\n🤖 [필뉴스] Gnews에서 영어 뉴스를 가져와 Groq로 번역합니다...")
    url = f"https://gnews.io/api/v4/search?q=Philippines&lang=en&max=1&apikey={GNEWS_API_KEY}"
    
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        if data.get('articles'):
            article = data['articles'][0]
            eng_title = article['title']
            eng_desc = article['description']
            link = article['url']
            
            print(f"📥 [원본 영어 제목] {eng_title}")
            
            # 한국어로 번역
            kor_title = translate_to_korean(eng_title)
            kor_desc = translate_to_korean(eng_desc)
            
            print("✅ [필뉴스 번역 성공]")
            print(f"🔹 한국어 제목: {kor_title}")
            print(f"🔹 한국어 요약: {kor_desc}")
            return {"title": kor_title, "content": f"{kor_desc}\n\n자세히 보기: {link}"}
    else:
        print(f"❌ [Gnews API 에러] {response.status_code}: {response.text}")
    return None

if __name__ == "__main__":
    print("🚀 뉴스 봇 테스트 스크립트를 시작합니다!")
    fetch_naver_news()
    fetch_gnews_and_translate()
    print("\n🎉 모든 테스트가 완료되었습니다!")
