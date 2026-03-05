import os
import json
import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from db import insert_post
from ai_selector import translate_to_korean

load_dotenv()
GNEWS_API_KEY = os.getenv("GNEWS_API_KEY")

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

def run_newsbot_en():
    print("\n🤖 [필뉴스] 12시간 내 해외 뉴스 수집 및 AI 전체 번역을 시작합니다...")
    bot_uuid = get_bot_uuid("필뉴스")
    if not bot_uuid: return

    # ★ 넉넉하게 20개까지 뒤져보도록 max=20 으로 변경
    url = f"https://gnews.io/api/v4/search?q=Philippines&lang=en&max=20&sortby=publishedAt&apikey={GNEWS_API_KEY}"
    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        now = datetime.now(timezone.utc)
        inserted_count = 0 
        
        for article in data.get('articles', []):
            pub_str = article['publishedAt'].replace('Z', '+00:00')
            pub_date = datetime.fromisoformat(pub_str)
            
            # ★ 24시간 -> 12시간 이내로 변경!
            if now - pub_date <= timedelta(hours=12):
                eng_title = article['title']
                link = article['url']
                image_url = article.get('image')
                
                full_eng_text = scrape_article_en(link)
                if not full_eng_text:
                    full_eng_text = article['description']
                    
                # ★ 필터링: 영문 본문 길이가 너무 짧으면(약 250자 미만) 사진만 있는 기사로 간주하고 패스!
                if not full_eng_text or len(full_eng_text.replace(" ", "")) < 250:
                    print(f"⏩ [스킵] 내용이 너무 짧은 영문 기사입니다: {eng_title}")
                    continue

                print(f"🧠 [{eng_title}] 기사 번역 중...")
                kor_title = translate_to_korean(eng_title)
                kor_content = translate_to_korean(full_eng_text)
                
                content = ""
                if image_url:
                    content += f"<img src='{image_url}' alt='news image' style='max-width: 100%; border-radius: 8px; margin-bottom: 15px;'/><br>"
                
                formatted_content = kor_content.replace('\n', '<br>')
                content += f"<div class='news-body' style='line-height: 1.8; color: #374151;'>{formatted_content}</div><br><br><p><a href='{link}' target='_blank' style='color: #2563eb; font-weight: bold;'>📰 원문 보기 (English)</a></p>"

                insert_post(bot_uuid, "news", "local", kor_title, content)
                print(f"✅ 영문 기사 번역 및 등록 완료!")
                inserted_count += 1
                
                # (기존에 있던 3개 제한 코드는 완전히 삭제했습니다!)
                    
        if inserted_count == 0:
            print("⚠️ 12시간 내 쓸만한 해외 뉴스가 없습니다.")
        else:
            print(f"🎉 총 {inserted_count}개의 해외 뉴스를 번역하여 수집했습니다.")
    else:
        print(f"❌ API 에러: {response.status_code}")

if __name__ == "__main__":
    run_newsbot_en()
