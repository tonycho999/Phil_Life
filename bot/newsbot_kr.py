import os
import re
import json
import requests
import difflib
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
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        res = requests.get(url, headers=headers, timeout=10)
        res.encoding = 'utf-8'
        soup = BeautifulSoup(res.text, 'html.parser')
        
        # ★ 네이버 일반 뉴스, 연예, 스포츠 등 본문 영역 ID를 꼼꼼하게 전부 타겟팅
        content_area = soup.select_one('#dic_area, #newsct_article, #artc_body, #newsEndContents, [itemprop="articleBody"]')
        
        if content_area:
            raw_text = content_area.get_text(separator='\n', strip=True)
        else:
            # ★ 핵심 수정: 진짜 본문 상자를 못 찾으면, 엉뚱한 거 긁지 말고 깔끔하게 포기!
            return ""

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

# ★ 중복 기준 35%로 대폭 하향! 조금만 겹쳐도 차단
def is_similar(new_title, existing_titles):
    for title in existing_titles:
        similarity = difflib.SequenceMatcher(None, new_title, title).ratio()
        if similarity > 0.35: 
            return True
        if new_title in title or title in new_title:
            return True
    return False

def run_newsbot_kr():
    print("\n🤖 [필한뉴스] 네이버 최신 뉴스 검색을 시작합니다... (정치/선거 기사 차단 모드)")
    bot_uuid = get_bot_uuid("필한뉴스")
    if not bot_uuid: return

    recent_titles = []
    try:
        res = supabase.table("posts").select("title").eq("author_id", bot_uuid).order("created_at", desc=True).limit(50).execute()
        recent_titles = [item['title'] for item in res.data]
    except Exception as e:
        pass

    url = "https://openapi.naver.com/v1/search/news.json"
    headers = {"X-Naver-Client-Id": NAVER_CLIENT_ID, "X-Naver-Client-Secret": NAVER_CLIENT_SECRET}
    
    # ★ 1차 방어: 네이버 검색어에 강력한 마이너스(-) 키워드 추가 (정치, 선거 등 원천 차단)
    search_query = "필리핀 -정치 -선거 -대통령 -국회 -여당 -야당 -민주당 -국민의힘 -총선 -공천"
    params = {"query": search_query, "display": 20, "sort": "date"} 

    response = requests.get(url, headers=headers, params=params)

    if response.status_code == 200:
        data = response.json()
        now = datetime.now(timezone.utc)
        inserted_count = 0 
        
        # ★ 2차 방어: 파이썬 단에서 혹시라도 뚫고 들어온 정치 단어(제목+본문) 컷트용 블랙리스트
        politics_blacklist = ['정치', '선거', '대통령', '국회', '여당', '야당', '더불어민주당', '국민의힘', '총선', '공천', '마르코스', '두테르테', '의원', '출마', '당대표']
        
        for item in data['items']:
            pub_date = parsedate_to_datetime(item['pubDate']) 
            
            if now - pub_date <= timedelta(hours=12):
                title = clean_html(item['title'])
                
                # ★ 2차 방어 실행: 제목에 정치 단어가 있으면 즉시 버림
                if any(bad_word in title for bad_word in politics_blacklist):
                    print(f"🛑 [정치 스킵] 제목 필터링: {title}")
                    continue
                
                if is_similar(title, recent_titles):
                    print(f"🔄 [중복 스킵] 비슷한 기사 차단: {title}")
                    continue

                link = item['link']
                full_text = scrape_article(link)
                
                # ★ 2차 방어 실행: 본문 스크래핑 후에도 내용에 정치 단어가 있으면 즉시 버림
                if any(bad_word in full_text for bad_word in politics_blacklist):
                    print(f"🛑 [정치 스킵] 본문 필터링: {title}")
                    continue
                
                text_only = full_text.replace("<br>", "").replace(" ", "")
                if not full_text or len(text_only) < 150: 
                    print(f"⏩ [스킵] 내용 부족(또는 파싱 불가): {title}")
                    continue 
                
                content = f"<div class='news-body' style='line-height: 1.8; color: #374151;'>{full_text}</div><br><br><p><a href='{link}' target='_blank' style='color: #2563eb; font-weight: bold;'>📰 언론사 원문 보기</a></p>"

                insert_post(bot_uuid, "news", "local", title, content)
                print(f"✅ 기사 등록 완료: {title}")
                
                recent_titles.append(title) 
                inserted_count += 1
                    
        if inserted_count == 0:
            print("⚠️ 12시간 내 통과된 한국 뉴스가 없습니다. (모두 필터링됨)")
        else:
            print(f"🎉 총 {inserted_count}개의 한국 뉴스를 수집했습니다.")
    else:
        print(f"❌ API 에러: {response.status_code}")

if __name__ == "__main__":
    run_newsbot_kr()
