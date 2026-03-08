import os
import time
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from dotenv import load_dotenv
from supabase import create_client
from db import insert_post
import urllib3

# SSL 경고 숨기기
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
PROXY_URL = os.getenv("PROXY_URL")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
BOT_UUID = "7586917d-1c8e-46b9-80a9-1eba201d9a5f"

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
}

PROXIES = {"http": PROXY_URL, "https": PROXY_URL} if PROXY_URL else None

def get_recent_titles(prefix):
    try:
        res = supabase.table("posts").select("title").eq("author_id", BOT_UUID).eq("category_sub", "notice").like("title", f"%{prefix}%").order("created_at", desc=True).limit(30).execute()
        return [item['title'] for item in res.data]
    except Exception as e:
        print(f"❌ DB 조회 에러 ({prefix}): {e}")
        return []

def fetch_with_retry(url, max_retries=3):
    """타임아웃 발생 시 끈질기게 재시도하는 전용 함수"""
    for attempt in range(max_retries):
        try:
            # 타임아웃을 60초로 넉넉하게 늘림
            response = requests.get(url, headers=HEADERS, proxies=PROXIES, timeout=60, verify=False)
            response.raise_for_status() # 상태 코드가 200 정상인지 확인
            response.encoding = 'utf-8'
            return response
        except requests.exceptions.Timeout:
            print(f"⏳ 대사관 서버 응답 지연 (시도 {attempt + 1}/{max_retries})... 5초 후 다시 두드립니다.")
            time.sleep(5)
        except Exception as e:
            print(f"⚠️ 연결 오류 발생 (시도 {attempt + 1}/{max_retries})... 재시도 중.")
            time.sleep(5)
    return None

def scrape_embassy():
    print(f"\n🏛️ [필뉴스] 주필리핀 대한민국 대사관 공지사항 확인 중... (프록시: {'O' if PROXIES else 'X'})")
    recent_titles = get_recent_titles("[대사관 공지]")
    
    list_url = "https://overseas.mofa.go.kr/ph-ko/brd/m_3640/list.do"
    base_url = "https://overseas.mofa.go.kr"
    
    res = fetch_with_retry(list_url)
    if not res:
        print("❌ 대사관 목록 페이지 접속에 최종 실패했습니다. 나중에 다시 시도합니다.")
        return

    try:
        soup = BeautifulSoup(res.text, 'html.parser')
        rows = soup.select('.board-list tbody tr, .board_list tbody tr')
        
        new_count = 0
        for row in rows:
            title_tag = row.select_one('td.title a, td.tit a')
            if not title_tag: continue
            
            raw_title = title_tag.get_text(strip=True)
            link = urljoin(base_url, title_tag['href'])
            final_title = f"[대사관 공지] {raw_title}"
            
            if final_title in recent_titles: continue
            
            print(f"🔔 새 대사관 공지 발견: {final_title}")
            
            # 본문 가져오기
            c_res = fetch_with_retry(link)
            html_content = ""
            
            if c_res:
                c_soup = BeautifulSoup(c_res.text, 'html.parser')
                content_area = c_soup.select_one('.boardTxt, .cont_box, .board_view')
                
                if content_area:
                    # 스크립트 등 불순물 제거 후 원본 HTML 복사
                    for s in content_area(['script', 'style', 'meta', 'link']): 
                        s.decompose()
                    html_content = content_area.decode_contents()
            
            if not html_content or not html_content.strip():
                html_content = f"본문 내용을 불러올 수 없습니다. 원문 링크: <a href='{link}' target='_blank'>{link}</a>"
                
            insert_post(BOT_UUID, "news", "notice", final_title, html_content)
            recent_titles.append(final_title)
            new_count += 1
            
            # 프록시 및 서버 과부하 방지를 위해 글 하나당 3초 휴식
            time.sleep(3)
            
        if new_count == 0:
            print("💤 새로 올라온 대사관 공지가 없습니다.")
        else:
            print(f"🎉 대사관 공지 {new_count}개 복사 완료!")
    except Exception as e:
        print(f"❌ 대사관 데이터 파싱 에러: {e}")

if __name__ == "__main__":
    scrape_embassy()
