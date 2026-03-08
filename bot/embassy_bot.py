import os
import time
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from dotenv import load_dotenv
from supabase import create_client
from db import insert_post

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
# ★ 추가됨: GitHub Secrets에서 프록시 주소 불러오기
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

# ★ 프록시 세팅 준비
PROXIES = None
if PROXY_URL:
    PROXIES = {
        "http": PROXY_URL,
        "https": PROXY_URL
    }

def get_recent_titles(prefix):
    try:
        res = supabase.table("posts").select("title").eq("author_id", BOT_UUID).eq("category_sub", "notice").like("title", f"%{prefix}%").order("created_at", desc=True).limit(30).execute()
        return [item['title'] for item in res.data]
    except Exception as e:
        print(f"❌ DB 조회 에러 ({prefix}): {e}")
        return []

def scrape_embassy():
    print(f"\n🏛️ [필뉴스] 주필리핀 대한민국 대사관 공지사항 확인 중... (프록시 사용: {'O' if PROXIES else 'X'})")
    recent_titles = get_recent_titles("[대사관 공지]")
    
    list_url = "https://overseas.mofa.go.kr/ph-ko/brd/m_3640/list.do"
    base_url = "https://overseas.mofa.go.kr"
    
    try:
        # ★ 수정됨: proxies=PROXIES 를 추가하여 IPRoyal 프록시망을 통해 접속합니다.
        res = requests.get(list_url, headers=HEADERS, proxies=PROXIES, timeout=30, verify=False)
        res.encoding = 'utf-8'
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
            
            try:
                c_res = requests.get(link, headers=HEADERS, proxies=PROXIES, timeout=30, verify=False)
            except Exception:
                print("연결 지연... 3초 후 프록시 재시도합니다.")
                time.sleep(3)
                c_res = requests.get(link, headers=HEADERS, proxies=PROXIES, timeout=30, verify=False)
                
            c_res.encoding = 'utf-8'
            c_soup = BeautifulSoup(c_res.text, 'html.parser')
            content_area = c_soup.select_one('.boardTxt, .cont_box, .board_view')
            
            html_content = ""
            if content_area:
                for s in content_area(['script', 'style', 'meta', 'link']): 
                    s.decompose()
                html_content = content_area.decode_contents()
            
            if not html_content.strip():
                html_content = f"본문 내용을 불러올 수 없습니다. 원문 링크: <a href='{link}' target='_blank'>{link}</a>"
                
            insert_post(BOT_UUID, "news", "notice", final_title, html_content)
            recent_titles.append(final_title)
            new_count += 1
            time.sleep(2) # 프록시 사용 시 여유를 두기 위해 2초 대기
            
        if new_count == 0:
            print("💤 새로 올라온 대사관 공지가 없습니다.")
        else:
            print(f"🎉 대사관 공지 {new_count}개 복사 완료!")
    except Exception as e:
        print(f"❌ 대사관 스크래핑 에러: {e}")

def scrape_hanin():
    print("\n🤝 [필뉴스] 필리핀 한인총연합회 소식 확인 중...")
    recent_titles = get_recent_titles("[한인회 소식]")
    
    list_url = "http://korea.com.ph/bbs/board.php?bo_table=notice"
    base_url = "http://korea.com.ph"
    
    try:
        # 한인회도 동일하게 프록시 적용
        res = requests.get(list_url, headers=HEADERS, proxies=PROXIES, timeout=30)
        res.encoding = 'utf-8'
        soup = BeautifulSoup(res.text, 'html.parser')
        
        rows = soup.select('.bo_tit a, td.td_subject a')
        
        new_count = 0
        for title_tag in rows:
            raw_title = title_tag.get_text(strip=True)
            if not raw_title or "댓글" in raw_title: continue
            
            link = urljoin(base_url, title_tag['href'])
            final_title = f"[한인회 소식] {raw_title}"
            
            if final_title in recent_titles: continue
            
            print(f"🔔 새 한인회 소식 발견: {final_title}")
            
            c_res = requests.get(link, headers=HEADERS, proxies=PROXIES, timeout=30)
            c_res.encoding = 'utf-8'
            c_soup = BeautifulSoup(c_res.text, 'html.parser')
            content_area = c_soup.select_one('#bo_v_con, .bo_v_con, .content')
            
            html_content = ""
            if content_area:
                for s in content_area(['script', 'style', 'meta', 'link']): 
                    s.decompose()
                html_content = content_area.decode_contents()
            
            if not html_content.strip():
                html_content = f"본문 내용을 불러올 수 없습니다. 원문 링크: <a href='{link}' target='_blank'>{link}</a>"
                
            insert_post(BOT_UUID, "news", "notice", final_title, html_content)
            recent_titles.append(final_title)
            new_count += 1
            time.sleep(2)
            
        if new_count == 0:
            print("💤 새로 올라온 한인회 소식이 없습니다.")
        else:
            print(f"🎉 한인회 소식 {new_count}개 복사 완료!")
    except Exception as e:
        print(f"❌ 한인회 스크래핑 에러: {e}")

def run_official_news_bot():
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    
    print("🚀 공식 교민 소식(대사관/한인회) 원문 복사를 시작합니다.")
    scrape_embassy()
    scrape_hanin()
    print("\n🏁 교민 소식 업데이트 활동을 모두 마쳤습니다.")

if __name__ == "__main__":
    run_official_news_bot()
