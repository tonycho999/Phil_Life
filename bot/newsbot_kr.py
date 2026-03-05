import os
import re
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
    """뉴스 링크에 직접 접속하여 기사 본문(p 태그 위주)을 모두 긁어옵니다."""
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        res = requests.get(url, headers=headers, timeout=10)
        res.encoding = 'utf-8'
        soup = BeautifulSoup(res.text, 'html.parser')
        
        # 언론사마다 구조가 다르므로, 가장 보편적인 <p> 태그의 텍스트들을 모아옵니다.
        paragraphs = soup.find_all('p')
        # 너무 짧은 메뉴 텍스트 등은 제외하고 30자 이상인 진짜 문단만 추출
        article_text = "<br><br>".join([p.get_text(strip=True) for p in paragraphs if len(p.get_text(strip=True)) > 30])
        return article_text
    except Exception as e:
        print(f"⚠️ 본문 스크래핑 실패: {e}")
        return ""

def run_newsbot_kr():
    print("\n🤖 [필한뉴스] 네이버 최신 뉴스 검색 및 본문 추출을 시작합니다...")
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
            pub_date = parsedate_to_datetime(item['pubDate']) # 발행일 변환
            
            # ★ 24시간 이내의 뉴스인지 검사
            if now - pub_date <= timedelta(hours=24):
                title = clean_html(item['title'])
                link = item['link']
                
                print(f"📥 24시간 내 기사 발견! 본문을 가져옵니다: {title}")
                full_text = scrape_article(link)
                
                # 스크래핑을 실패했거나 본문이 텅 비었다면, API 요약본으로 대체
                if not full_text:
                    full_text = clean_html(item['description'])
                
                content = f"<div class='news-body' style='line-height: 1.8; color: #374151;'>{full_text}</div><br><br><p><a href='{link}' target='_blank' style='color: #2563eb; font-weight: bold;'>📰 언론사 원문 보기</a></p>"

                # ★ db.py 호출 (news, local 카테고리로 지정!)
                insert_post(
                    bot_id="bot-news-korea", 
                    main_cat="news", 
                    sub_cat="local", 
                    title=title,
                    content=content
                )
                return # 가장 최신 글 하나만 올리고 쿨하게 퇴장 (도배 방지)
                
        print("⚠️ 지난 24시간 이내에 작성된 필리핀 관련 한국 뉴스가 없습니다.")
    else:
        print(f"❌ [네이버 API 에러] {response.status_code}: {response.text}")

if __name__ == "__main__":
    run_newsbot_kr()
