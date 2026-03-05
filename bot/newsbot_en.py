import os
import json
import requests
import difflib
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

# ★ 중복 기준 35%로 대폭 하향! 조금만 겹쳐도 차단
def is_similar(new_title, existing_titles):
    for title in existing_titles:
        similarity = difflib.SequenceMatcher(None, new_title, title).ratio()
        if similarity > 0.35: 
            return True
        if new_title in title or title in new_title:
            return True
    return False

def run_newsbot_en():
    print("\n🤖 [필뉴스] 24시간 내 테마별 교민 맞춤형 해외 뉴스 수집을 시작합니다...")
    bot_uuid = get_bot_uuid("필뉴스")
    if not bot_uuid: return

    recent_titles = []
    try:
        res = supabase.table("posts").select("title").eq("author_id", bot_uuid).order("created_at", desc=True).limit(50).execute()
        recent_titles = [item['title'] for item in res.data]
    except Exception as e:
        pass

    # ★ 5개의 테마별 검색어 분할 (뉴스 쏠림 현상 완벽 방지)
    search_queries = [
        "Philippines AND (Korea OR Korean)",                     # 1그룹: 한국/교민 관련
        "Philippines AND (visa OR immigration OR foreigner)",    # 2그룹: 이민/비자/외국인
        "Philippines AND (crime OR accident OR emergency)",      # 3그룹: 사건/사고/긴급
        "Philippines AND (airport OR flight)",                   # 4그룹: 교통/항공/공항
        "Philippines AND (typhoon OR earthquake)"                # 5그룹: 재난/날씨
    ]
    
    url = "https://gnews.io/api/v4/search"
    now = datetime.now(timezone.utc)
    total_inserted_count = 0 
    
    for idx, query in enumerate(search_queries, 1):
        print(f"\n🔎 [테마 {idx}/5] 검색 중: {query}")
        params = {
            "q": query,
            "lang": "en",
            "max": 10, # 각 테마별 최대 10개씩만 안전하게 가져옴
            "sortby": "publishedAt",
            "apikey": GNEWS_API_KEY
        }
        
        try:
            response = requests.get(url, params=params)
            if response.status_code == 200:
                data = response.json()
                
                for article in data.get('articles', []):
                    pub_str = article['publishedAt'].replace('Z', '+00:00')
                    pub_date = datetime.fromisoformat(pub_str)
                    
                    if now - pub_date <= timedelta(hours=24):
                        eng_title = article['title']
                        link = article['url']
                        image_url = article.get('image')
                        
                        full_eng_text = scrape_article_en(link)
                        # 본문을 못 가져오면 요약본(Description)을 '단신 속보'처럼 사용
                        if not full_eng_text:
                            full_eng_text = article.get('description', '')
                            
                        # 100자 미만 깡통 기사 컷
                        if not full_eng_text or len(full_eng_text.replace(" ", "")) < 100:
                            print(f"⏩ [스킵] 내용 부족: {eng_title}")
                            continue

                        kor_title = translate_to_korean(eng_title)
                        
                        # 테마가 달라도 같은 사건을 다룰 수 있으므로 중복 필터가 확실히 걸러줍니다.
                        if is_similar(kor_title, recent_titles):
                            print(f"🔄 [중복 스킵] 비슷한 기사 차단: {kor_title}")
                            continue

                        print(f"🧠 [{kor_title}] 번역 중...")
                        kor_content = translate_to_korean(full_eng_text)
                        
                        content = ""
                        if image_url:
                            content += f"<img src='{image_url}' alt='news image' style='max-width: 100%; border-radius: 8px; margin-bottom: 15px;'/><br>"
                        
                        formatted_content = kor_content.replace('\n', '<br>')
                        content += f"<div class='news-body' style='line-height: 1.8; color: #374151;'>{formatted_content}</div><br><br><p><a href='{link}' target='_blank' style='color: #2563eb; font-weight: bold;'>📰 원문 보기 (English)</a></p>"

                        insert_post(bot_uuid, "news", "local", kor_title, content)
                        print(f"✅ 기사 등록 완료!")
                        
                        recent_titles.append(kor_title)
                        total_inserted_count += 1
            else:
                print(f"❌ API 에러 (테마 {idx}): {response.status_code}")
        except Exception as e:
            print(f"❌ 요청 중 에러 발생 (테마 {idx}): {e}")
            
    if total_inserted_count == 0:
        print("\n⚠️ 24시간 내 새롭게 통과된 테마별 해외 뉴스가 없습니다.")
    else:
        print(f"\n🎉 총 {total_inserted_count}개의 다채로운 테마별 해외 뉴스를 수집했습니다.")

if __name__ == "__main__":
    run_newsbot_en()
