import os
import json
import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from db import insert_post
from ai_selector import translate_to_korean
from supabase import create_client

load_dotenv()
GNEWS_API_KEY = os.getenv("GNEWS_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def scrape_article_en(url):
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        res = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(res.text, 'html.parser')
        paragraphs = soup.find_all('p')
        article_text = "\n\n".join([p.get_text(strip=True) for p in paragraphs if len(p.get_text(strip=True)) > 30])
        return article_text[:4000] 
    except:
        return ""

def get_bot_uuid(nickname):
    filepath = os.path.join(os.path.dirname(os.path.abspath(__file__)), "bot_profiles.json")
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            profiles = json.load(f)
            for p in profiles:
                if p.get("nickname") == nickname:
                    return p.get("id")
    except:
        return None

# ★ 핵심: 제목 유사도 검사 함수
def is_similar(new_title, existing_titles):
    new_words = set(new_title.replace(",", "").replace("'", "").replace('"', "").split())
    for title in existing_titles:
        existing_words = set(title.replace(",", "").replace("'", "").replace('"', "").split())
        if not new_words or not existing_words: continue
        
        overlap = len(new_words.intersection(existing_words))
        shortest = min(len(new_words), len(existing_words))
        
        if shortest >= 3 and (overlap / shortest) >= 0.5: 
            return True
        if new_title in title or title in new_title:
            return True
    return False

def run_newsbot_en():
    print("\n🤖 [필뉴스] 12시간 내 해외 뉴스 수집을 시작합니다...")
    bot_uuid = get_bot_uuid("필뉴스")
    if not bot_uuid: return

    # ★ DB에서 필뉴스가 최근에 쓴 한국어 기사 제목 50개를 가져옵니다.
    recent_titles = []
    try:
        res = supabase.table("posts").select("title").eq("author_id", bot_uuid).order("created_at", desc=True).limit(50).execute()
        recent_titles = [item['title'] for item in res.data]
    except Exception as e:
        pass

    url = f"https://gnews.io/api/v4/search?q=Philippines&lang=en&max=20&sortby=publishedAt&apikey={GNEWS_API_KEY}"
    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        now = datetime.now(timezone.utc)
        inserted_count = 0 
        
        for article in data.get('articles', []):
            pub_str = article['publishedAt'].replace('Z', '+00:00')
            pub_date = datetime.fromisoformat(pub_str)
            
            if now - pub_date <= timedelta(hours=12):
                eng_title = article['title']
                link = article['url']
                image_url = article.get('image')
                
                full_eng_text = scrape_article_en(link)
                if not full_eng_text:
                    full_eng_text = article['description']
                    
                if not full_eng_text or len(full_eng_text.replace(" ", "")) < 250:
                    print(f"⏩ [스킵] 너무 짧은 영문 기사입니다: {eng_title}")
                    continue

                # ★ 똑똑한 로직: 제목만 먼저 번역해서 DB와 비교합니다.
                kor_title = translate_to_korean(eng_title)
                if is_similar(kor_title, recent_titles):
                    print(f"🔄 [중복 스킵] 이미 번역된 비슷한 기사가 있습니다: {kor_title}")
                    continue # 중복이면 본문 번역 안 하고 넘어감!

                print(f"🧠 [{kor_title}] 본문 전문 번역 중...")
                kor_content = translate_to_korean(full_eng_text)
                
                content = ""
                if image_url:
                    content += f"<img src='{image_url}' alt='news image' style='max-width: 100%; border-radius: 8px; margin-bottom: 15px;'/><br>"
                
                formatted_content = kor_content.replace('\n', '<br>')
                content += f"<div class='news-body' style='line-height: 1.8; color: #374151;'>{formatted_content}</div><br><br><p><a href='{link}' target='_blank' style='color: #2563eb; font-weight: bold;'>📰 원문 보기 (English)</a></p>"

                insert_post(bot_uuid, "news", "local", kor_title, content)
                print(f"✅ 기사 등록 완료!")
                
                recent_titles.append(kor_title) # 목록에 추가
                inserted_count += 1
                    
        if inserted_count == 0:
            print("⚠️ 12시간 내 새롭고 쓸만한 해외 뉴스가 없습니다.")
        else:
            print(f"🎉 총 {inserted_count}개의 해외 뉴스를 번역하여 수집했습니다.")
    else:
        print(f"❌ API 에러: {response.status_code}")

if __name__ == "__main__":
    run_newsbot_en()
