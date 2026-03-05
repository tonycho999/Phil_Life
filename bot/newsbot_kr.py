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
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
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
    except Exception as e:
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

def run_newsbot_kr():
    print("\n🤖 [필한뉴스] 네이버 최신 뉴스 검색 및 본문 추출을 시작합니다...")
    bot_uuid = get_bot_uuid("필한뉴스")
    if not bot_uuid: return

    url = "https://openapi.naver.com/v1/search/news.json"
    headers = {"X-Naver-Client-Id": NAVER_CLIENT_ID, "X-Naver-Client-Secret": NAVER_CLIENT_SECRET}
    
    # ★ 넉넉하게 20개까지 뒤져봅니다.
    params = {"query": "필리핀", "display": 20, "sort": "date"} 

    response = requests.get(url, headers=headers, params=params)

    if response.status_code == 200:
        data = response.json()
        now = datetime.now(timezone.utc)
        inserted_count = 0 
        
        for item in data['items']:
            pub_date = parsedate_to_datetime(item['pubDate']) 
            
            # ★ 24시간 -> 12시간 이내로 변경!
            if now - pub_date <= timedelta(hours=12):
                title = clean_html(item['title'])
                link = item['link']
                full_text = scrape_article(link)
                
                # ★ 필터링: 본문이 비어있거나, 글자 수가 200자 미만(사진만 있거나 너무 짧은 기사)이면 패스!
                text_only = full_text.replace("<br>", "").replace(" ", "")
                if not full_text or len(text_only) < 150: 
                    print(f"⏩ [스킵] 내용이 너무 짧은 기사입니다: {title}")
                    continue 
                
                content = f"<div class='news-body' style='line-height: 1.8; color: #374151;'>{full_text}</div><br><br><p><a href='{link}' target='_blank' style='color: #2563eb; font-weight: bold;'>📰 언론사 원문 보기</a></p>"

                insert_post(bot_uuid, "news", "local", title, content)
                print(f"✅ 기사 등록 완료: {title}")
                inserted_count += 1
                
                # (기존에 있던 3개 제한 코드는 완전히 삭제했습니다!)
                    
        if inserted_count == 0:
            print("⚠️ 12시간 내 쓸만한 한국 뉴스가 없습니다.")
        else:
            print(f"🎉 총 {inserted_count}개의 한국 뉴스를 수집했습니다.")
    else:
        print(f"❌ API 에러: {response.status_code}")

if __name__ == "__main__":
    run_newsbot_kr()
