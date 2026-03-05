import os
import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from db import insert_post
from ai_selector import translate_to_korean

load_dotenv()

GNEWS_API_KEY = os.getenv("GNEWS_API_KEY")

def scrape_article_en(url):
    """해외 뉴스 사이트에 접속해 영어 본문을 긁어옵니다."""
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        res = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(res.text, 'html.parser')
        
        paragraphs = soup.find_all('p')
        article_text = "\n\n".join([p.get_text(strip=True) for p in paragraphs if len(p.get_text(strip=True)) > 30])
        
        # 너무 길면 Groq AI 토큰이 터지므로 안전하게 4000자에서 자릅니다.
        return article_text[:4000] 
    except Exception as e:
        print(f"⚠️ 영문 본문 스크래핑 실패: {e}")
        return ""

def run_newsbot_en():
    print("\n🤖 [필뉴스] 24시간 내 해외 뉴스 수집 및 AI 전체 번역을 시작합니다...")
    if not GNEWS_API_KEY:
        print("❌ Gnews API 키가 없습니다.")
        return

    url = f"https://gnews.io/api/v4/search?q=Philippines&lang=en&max=10&sortby=publishedAt&apikey={GNEWS_API_KEY}"

    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        now = datetime.now(timezone.utc)
        
        for article in data.get('articles', []):
            # 발행일 변환 (ex: 2026-03-05T08:00:00Z)
            pub_str = article['publishedAt'].replace('Z', '+00:00')
            pub_date = datetime.fromisoformat(pub_str)
            
            # ★ 24시간 이내 뉴스인지 검사
            if now - pub_date <= timedelta(hours=24):
                eng_title = article['title']
                link = article['url']
                image_url = article.get('image')
                
                print(f"📥 24시간 내 기사 발견! 영문 본문을 가져옵니다: {eng_title}")
                full_eng_text = scrape_article_en(link)
                
                if not full_eng_text:
                    full_eng_text = article['description']
                    
                print("🧠 Groq AI를 켜고 기사 전체를 전문 번역 중입니다. (수 초 소요)...")
                kor_title = translate_to_korean(eng_title)
                kor_content = translate_to_korean(full_eng_text)
                
                # 본문 조립 (이미지 + 번역된 텍스트 + 원문 링크)
                content = ""
                if image_url:
                    content += f"<img src='{image_url}' alt='news image' style='max-width: 100%; border-radius: 8px; margin-bottom: 15px;'/><br>"
                
                # Groq가 번역한 줄바꿈(\n)을 웹용(<br>)으로 예쁘게 변경
                formatted_content = kor_content.replace('\n', '<br>')
                
                content += f"<div class='news-body' style='line-height: 1.8; color: #374151;'>{formatted_content}</div><br><br><p><a href='{link}' target='_blank' style='color: #2563eb; font-weight: bold;'>📰 원문 보기 (English)</a></p>"

                # ★ db.py 호출 (news, local 카테고리로 지정!)
                insert_post(
                    bot_id="bot-news-phil", 
                    main_cat="news", 
                    sub_cat="local", 
                    title=kor_title,
                    content=content
                )
                return # 번역 후 하나 등록 완료하면 쿨하게 퇴장
                
        print("⚠️ 지난 24시간 이내에 작성된 필리핀 관련 해외 뉴스가 없습니다.")
    else:
        print(f"❌ [Gnews API 에러] {response.status_code}: {response.text}")

if __name__ == "__main__":
    run_newsbot_en()
