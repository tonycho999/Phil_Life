import os
import re
import json
import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from dotenv import load_dotenv
from db import insert_post
from supabase import create_client

load_dotenv()
NAVER_CLIENT_ID = os.getenv("NAVER_CLIENT_ID")
NAVER_CLIENT_SECRET = os.getenv("NAVER_CLIENT_SECRET")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def clean_html(raw_html):
    cleanr = re.compile('<.*?>|&([a-z0-9]+|#[0-9]{1,6}|#x[0-9a-f]{1,6});')
    return re.sub(cleanr, '', raw_html)

def scrape_article(url):
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        res = requests.get(url, headers=headers, timeout=10)
        res.encoding = 'utf-8'
        soup = BeautifulSoup(res.text, 'html.parser')
        
        content_area = soup.select_one('#dic_area, #newsct_article, #articeBody')
        if content_area:
            raw_text = content_area.get_text(separator='\n', strip=True)
        else:
            raw_text = "\n".join([p.get_text(strip=True) for p in soup.find_all('p')])

        lines = raw_text.split('\n')
        blacklist = ['구독되었습니다', 'Copyright', '무단 전재', '재배포 금지', '이동 통신망을 이용하여', '기자의 다른 기사', '섹션 정보', '만나보세요']
        clean_lines = []
        
        for line in lines:
            line = line.strip()
            if len(line) < 20: continue 
            if any(bad in line for bad in blacklist): continue 
            clean_lines.append(line)
            
        return "<br><br>".join(clean_lines)
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

# ★ 핵심: 제목 유사도 검사 함수 (핵심 단어가 50% 이상 겹치면 중복 처리)
def is_similar(new_title, existing_titles):
    new_words = set(new_title.replace(",", "").replace("'", "").replace('"', "").split())
    for title in existing_titles:
        existing_words = set(title.replace(",", "").replace("'", "").replace('"', "").split())
        if not new_words or not existing_words: continue
        
        overlap = len(new_words.intersection(existing_words))
        shortest = min(len(new_words), len(existing_words))
        
        # 짧은 제목 기준으로 단어의 절반(50%) 이상이 겹치거나, 아예 똑같으면 중복!
        if shortest >= 3 and (overlap / shortest) >= 0.5: 
            return True
        if new_title in title or title in new_title:
            return True
    return False

def run_newsbot_kr():
    print("\n🤖 [필한뉴스] 네이버 최신 뉴스 검색을 시작합니다...")
    bot_uuid = get_bot_uuid("필한뉴스")
    if not bot_uuid: return

    # ★ DB에서 필한뉴스가 최근에 쓴 기사 제목 50개를 가져와서 기억해둡니다.
    recent_titles = []
    try:
        res = supabase.table("posts").select("title").eq("author_id", bot_uuid).order("created_at", desc=True).limit(50).execute()
        recent_titles = [item['title'] for item in res.data]
    except Exception as e:
        print(f"⚠️ 기존 제목 불러오기 에러: {e}")

    url = "https://openapi.naver.com/v1/search/news.json"
    headers = {"X-Naver-Client-Id": NAVER_CLIENT_ID, "X-Naver-Client-Secret": NAVER_CLIENT_SECRET}
    params = {"query": "필리핀", "display": 20, "sort": "date"} 

    response = requests.get(url, headers=headers, params=params)

    if response.status_code == 200:
        data = response.json()
        now = datetime.now(timezone.utc)
        inserted_count = 0 
        
        for item in data['items']:
            pub_date = parsedate_to_datetime(item['pubDate']) 
            
            if now - pub_date <= timedelta(hours=12):
                title = clean_html(item['title'])
                
                # ★ 중복 필터 작동!
                if is_similar(title, recent_titles):
                    print(f"🔄 [중복 스킵] 이미 비슷한 기사가 있습니다: {title}")
                    continue

                link = item['link']
                full_text = scrape_article(link)
                
                text_only = full_text.replace("<br>", "").replace(" ", "")
                if not full_text or len(text_only) < 150: 
                    print(f"⏩ [스킵] 내용이 너무 짧은 기사입니다: {title}")
                    continue 
                
                content = f"<div class='news-body' style='line-height: 1.8; color: #374151;'>{full_text}</div><br><br><p><a href='{link}' target='_blank' style='color: #2563eb; font-weight: bold;'>📰 언론사 원문 보기</a></p>"

                insert_post(bot_uuid, "news", "local", title, content)
                print(f"✅ 기사 등록 완료: {title}")
                
                # ★ 방금 쓴 기사도 목록에 추가해서, 이번 턴에서 중복되는 것을 막습니다.
                recent_titles.append(title) 
                inserted_count += 1
                    
        if inserted_count == 0:
            print("⚠️ 12시간 내 새롭고 쓸만한 한국 뉴스가 없습니다.")
        else:
            print(f"🎉 총 {inserted_count}개의 한국 뉴스를 수집했습니다.")
    else:
        print(f"❌ API 에러: {response.status_code}")

if __name__ == "__main__":
    run_newsbot_kr()
