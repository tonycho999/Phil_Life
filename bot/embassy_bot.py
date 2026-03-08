import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from dotenv import load_dotenv
from supabase import create_client
from db import insert_post

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# '필뉴스' 봇 고유 ID
BOT_UUID = "7586917d-1c8e-46b9-80a9-1eba201d9a5f"

def get_recent_titles(prefix):
    """DB에서 최근 작성된 제목을 가져와 중복을 방지합니다."""
    try:
        res = supabase.table("posts").select("title").eq("author_id", BOT_UUID).eq("category_sub", "notice").like("title", f"%{prefix}%").order("created_at", desc=True).limit(30).execute()
        return [item['title'] for item in res.data]
    except Exception as e:
        print(f"❌ DB 조회 에러 ({prefix}): {e}")
        return []

def scrape_embassy():
    """1. 주필리핀 대한민국 대사관 공지사항 원문 스크래핑"""
    print("\n🏛️ [필뉴스] 주필리핀 대한민국 대사관 공지사항 확인 중...")
    recent_titles = get_recent_titles("[대사관 공지]")
    
    list_url = "https://overseas.mofa.go.kr/ph-ko/brd/m_3640/list.do"
    base_url = "https://overseas.mofa.go.kr"
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    
    try:
        res = requests.get(list_url, headers=headers, timeout=10)
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
            
            c_res = requests.get(link, headers=headers, timeout=10)
            c_res.encoding = 'utf-8'
            c_soup = BeautifulSoup(c_res.text, 'html.parser')
            content_area = c_soup.select_one('.boardTxt, .cont_box, .board_view')
            
            html_content = ""
            if content_area:
                # 사이트 깨짐 방지를 위해 스크립트 태그만 제거하고 원본 HTML 그대로 유지
                for s in content_area(['script', 'style', 'meta', 'link']): 
                    s.decompose()
                # 꾸밈없이 원본 태그(내용) 그대로 복사
                html_content = content_area.decode_contents()
            
            if not html_content.strip():
                html_content = f"본문 내용을 불러올 수 없습니다. 원문 링크: <a href='{link}' target='_blank'>{link}</a>"
                
            insert_post(BOT_UUID, "news", "notice", final_title, html_content)
            recent_titles.append(final_title)
            new_count += 1
            
        if new_count == 0:
            print("💤 새로 올라온 대사관 공지가 없습니다.")
        else:
            print(f"🎉 대사관 공지 {new_count}개 복사 완료!")
    except Exception as e:
        print(f"❌ 대사관 스크래핑 에러: {e}")

def scrape_hanin():
    """2. 필리핀 한인총연합회 공지사항 원문 스크래핑"""
    print("\n🤝 [필뉴스] 필리핀 한인총연합회 소식 확인 중...")
    recent_titles = get_recent_titles("[한인회 소식]")
    
    list_url = "http://korea.com.ph/bbs/board.php?bo_table=notice"
    base_url = "http://korea.com.ph"
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    
    try:
        res = requests.get(list_url, headers=headers, timeout=10)
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
            
            c_res = requests.get(link, headers=headers, timeout=10)
            c_res.encoding = 'utf-8'
            c_soup = BeautifulSoup(c_res.text, 'html.parser')
            content_area = c_soup.select_one('#bo_v_con, .bo_v_con, .content')
            
            html_content = ""
            if content_area:
                # 사이트 깨짐 방지를 위해 스크립트 태그만 제거하고 원본 HTML 그대로 유지
                for s in content_area(['script', 'style', 'meta', 'link']): 
                    s.decompose()
                # 꾸밈없이 원본 태그(내용) 그대로 복사
                html_content = content_area.decode_contents()
            
            if not html_content.strip():
                html_content = f"본문 내용을 불러올 수 없습니다. 원문 링크: <a href='{link}' target='_blank'>{link}</a>"
                
            insert_post(BOT_UUID, "news", "notice", final_title, html_content)
            recent_titles.append(final_title)
            new_count += 1
            
        if new_count == 0:
            print("💤 새로 올라온 한인회 소식이 없습니다.")
        else:
            print(f"🎉 한인회 소식 {new_count}개 복사 완료!")
    except Exception as e:
        print(f"❌ 한인회 스크래핑 에러: {e}")

def run_official_news_bot():
    print("🚀 공식 교민 소식(대사관/한인회) 원문 복사를 시작합니다.")
    scrape_embassy()
    scrape_hanin()
    print("\n🏁 교민 소식 업데이트 활동을 모두 마쳤습니다.")

if __name__ == "__main__":
    run_official_news_bot()
