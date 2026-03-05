import os
import re
import json
import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from dotenv import load_dotenv
from db import insert_post

load_dotenv()

NAVER_CLIENT_ID = os.getenv("NAVER_CLIENT_ID")
NAVER_CLIENT_SECRET = os.getenv("NAVER_CLIENT_SECRET")

def clean_html(raw_html):
    cleanr = re.compile('<.*?>|&([a-z0-9]+|#[0-9]{1,6}|#x[0-9a-f]{1,6});')
    return re.sub(cleanr, '', raw_html)

def scrape_article(url):
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        res = requests.get(url, headers=headers, timeout=10)
        res.encoding = 'utf-8'
        soup = BeautifulSoup(res.text, 'html.parser')
        paragraphs = soup.find_all('p')
        article_text = "<br><br>".join([p.get_text(strip=True) for p in paragraphs if len(p.get_text(strip=True)) > 30])
        return article_text
    except Exception as e:
        return ""

# ★ 추가됨: json 파일에서 닉네임으로 진짜 UUID를 찾아오는 똑똑한 함수
def get_bot_uuid(nickname):
    filepath = os.path.join(os.path.dirname(os.path.abspath(__file__)), "bot_profiles.json")
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            profiles = json.load(f)
            for p in profiles:
                if p.get("nickname") == nickname:
                    return p.get("id")
    except Exception as e:
        print(f"⚠️ 프로필 읽기 오류: {e}")
    return None

def run_newsbot_kr():
    print("\n🤖 [필한뉴스] 네이버 최신 뉴스 검색 및 본문 추출을 시작합니다...")
    
    # ★ 여기서 가짜 ID 대신 진짜 UUID를 가져옵니다!
    bot_uuid = get_bot_uuid("필한뉴스")
    if not bot_uuid:
        print("❌ '필한뉴스'의 진짜 UUID를 찾지 못했습니다. bot_profiles.json을 확인해주세요.")
        return

    if not NAVER_CLIENT_ID or not NAVER_CLIENT_SECRET:
        print("❌ 네이버 API 키가 없습니다.")
        return

    url = "https://openapi.naver.com/v1/search/news.json"
    headers = {"X-Naver-Client-Id": NAVER_CLIENT_ID, "X-Naver-Client-Secret": NAVER_CLIENT_SECRET}
    params = {"query": "필리핀", "display": 10, "sort": "date"} 

    response = requests.get(url, headers=headers, params=params)

    if response.status_code == 200:
        data = response.json()
        now = datetime.now(timezone.utc)
        
        for item in data['items']:
            pub_date = parsedate_to_datetime(item['pubDate']) 
            
            if now - pub_date <= timedelta(hours=24):
                title = clean_html(item['title'])
                link = item['link']
                
                print(f"📥 24시간 내 기사 발견! 본문을 가져옵니다: {title}")
                full_text = scrape_article(link)
                
                if not full_text:
                    full_text = clean_html(item['description'])
                
                content = f"<div class='news-body' style='line-height: 1.8; color: #374151;'>{full_text}</div><br><br><p><a href='{link}' target='_blank' style='color: #2563eb; font-weight: bold;'>📰 언론사 원문 보기</a></p>"

                # ★ 가져온 진짜 bot_uuid를 사용합니다!
                insert_post(
                    bot_id=bot_uuid, 
                    main_cat="news", 
                    sub_cat="local", 
                    title=title,
                    content=content
                )
                return 
                
        print("⚠️ 지난 24시간 이내에 작성된 필리핀 관련 한국 뉴스가 없습니다.")
    else:
        print(f"❌ [네이버 API 에러] {response.status_code}: {response.text}")

if __name__ == "__main__":
    run_newsbot_kr()
