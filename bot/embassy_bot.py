import os
import time
import re
from datetime import datetime, timedelta, timezone
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from dotenv import load_dotenv
from supabase import create_client
from db import insert_post

# 크롬 브라우저 완벽 위장 라이브러리
from curl_cffi import requests

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
PROXY_URL = os.getenv("PROXY_URL")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
BOT_UUID = "7586917d-1c8e-46b9-80a9-1eba201d9a5f"

# ★ 수정됨: curl_cffi의 자체 위장 기능을 100% 활용하기 위해 수동 HEADERS 삭제
PROXIES = {"http": PROXY_URL, "https": PROXY_URL} if PROXY_URL else None

# 🇵🇭 [핵심] 필리핀 시간(PST, UTC+8) 세팅 및 오늘/어제 날짜 계산
ph_tz = timezone(timedelta(hours=8))
ph_now = datetime.now(ph_tz)

# 허용되는 날짜 목록 (예: ['2026-03-09', '2026-03-08'])
ALLOWED_DATES = [
    ph_now.strftime("%Y-%m-%d"),
    (ph_now - timedelta(days=1)).strftime("%Y-%m-%d")
]

def extract_date_from_text(text):
    """게시판 텍스트에서 날짜(202X.X.X 또는 202X-X-X 등)를 찾아내 YYYY-MM-DD 형식으로 변환"""
    match = re.search(r'\b(202\d)[-./년\s]+(0?[1-9]|1[0-2])[-./월\s]+(0?[1-9]|[12]\d|3[01])[일]?\b', text)
    if match:
        y, m, d = match.groups()
        return f"{y}-{int(m):02d}-{int(d):02d}"
    return None

def get_recent_titles(prefix, category_main, category_sub):
    try:
        res = supabase.table("posts").select("title").eq("author_id", BOT_UUID).eq("category_main", category_main).eq("category_sub", category_sub).like("title", f"%{prefix}%").order("created_at", desc=True).limit(30).execute()
        return [item['title'] for item in res.data]
    except Exception as e:
        print(f"❌ DB 조회 에러 ({prefix}): {e}")
        return []

def fetch_with_retry(url, max_retries=3):
    """★ 수정됨: 헤더 충돌 방지 및 프록시 고장 대비 폴백(Fallback) 기능 추가"""
    for attempt in range(max_retries):
        try:
            # 시도 1, 2번은 프록시 사용 / 마지막 3번째 시도는 프록시 없이 직접 접속 시도
            use_proxy = PROXIES if attempt < 2 else None
            if attempt == 2 and PROXIES:
                print("  ⚠️ 프록시 서버 응답이 없어, 프록시 없이 직접 접속을 시도합니다.")

            # headers 인자 삭제 (curl_cffi가 알아서 완벽한 크롬 헤더를 세팅함)
            response = requests.get(url, proxies=use_proxy, timeout=60, impersonate="chrome110")
            response.encoding = 'utf-8'
            return response
            
        except Exception as e:
            # ★ 수정됨: 서버가 안 열리는 '진짜 이유(e)'를 로그에 함께 출력
            error_msg = str(e).split('\n')[0][:100] # 에러 메시지가 너무 길면 자름
            print(f"  ⏳ 연결 지연 (시도 {attempt + 1}/{max_retries}) | 에러: {error_msg}")
            time.sleep(5)
            
    return None

def extract_and_insert(recent_titles, base_url, rows, prefix, category_main, category_sub, content_selector, enforce_date=False):
    new_count = 0
    for row in rows:
        title_tag = row.find('a')
        if not title_tag: continue
        
        raw_title = title_tag.get_text(strip=True)
        if not raw_title: continue
            
        link = urljoin(base_url, title_tag['href'])
        final_title = f"{prefix} {raw_title}"
        
        if final_title in recent_titles: continue

        # ⏰ 날짜 필터링
        if enforce_date:
            row_text = row.get_text(separator=' ')
            post_date = extract_date_from_text(row_text)
            
            if post_date and post_date not in ALLOWED_DATES:
                print(f"  ↪ 🚫 패스 (오래된 글): {post_date} | {raw_title[:20]}...")
                continue
        
        print(f"🔔 새 게시물 통과: {final_title}")
        
        c_res = fetch_with_retry(link)
        html_content = ""
        
        if c_res:
            c_soup = BeautifulSoup(c_res.text, 'html.parser')
            content_area = c_soup.select_one(content_selector)
            
            if content_area:
                for s in content_area(['script', 'style', 'meta', 'link']): 
                    s.decompose()
                html_content = content_area.decode_contents()
        
        if not html_content or not html_content.strip():
            html_content = f"본문 내용을 불러올 수 없습니다. 원문 링크: <a href='{link}' target='_blank'>{link}</a>"
            
        insert_post(BOT_UUID, category_main, category_sub, final_title, html_content)
        recent_titles.append(final_title)
        new_count += 1
        time.sleep(3) 
        
    return new_count

# 1. 🏛️ 대사관 공지사항
def scrape_embassy():
    print(f"\n🏛️ [대사관] 주필리핀 대한민국 대사관 확인 중... (오늘/어제 필터 적용)")
    prefix = "[대사관 공지]"
    recent_titles = get_recent_titles(prefix, "news", "notice")
    list_url = "https://overseas.mofa.go.kr/ph-ko/brd/m_3640/list.do"
    base_url = "https://overseas.mofa.go.kr"
    
    res = fetch_with_retry(list_url)
    if not res: return
    soup = BeautifulSoup(res.text, 'html.parser')
    rows = soup.select('.board-list tbody tr, .board_list tbody tr') 
    
    count = extract_and_insert(recent_titles, base_url, rows, prefix, "news", "notice", '.boardTxt, .cont_box, .board_view', enforce_date=True)
    print(f"🎉 대사관 공지 {count}개 복사 완료!" if count else "💤 오늘/어제 올라온 새 대사관 공지 없음.")

# 2. 🎭 한국문화원(KCC) 공지사항
def scrape_kcc():
    print(f"\n🎭 [문화원] 주필리핀 한국문화원(KCC) 확인 중... (오늘/어제 필터 적용)")
    prefix = "[한국문화원]"
    recent_titles = get_recent_titles(prefix, "news", "notice")
    list_url = "https://phil.korean-culture.org/ko/1065/board/428/list"
    base_url = "https://phil.korean-culture.org"
    
    res = fetch_with_retry(list_url)
    if not res: return
    soup = BeautifulSoup(res.text, 'html.parser')
    rows = soup.select('table.board_list tbody tr')
    
    count = extract_and_insert(recent_titles, base_url, rows, prefix, "news", "notice", '.board_view, .txt_area, #print_area', enforce_date=True)
    print(f"🎉 한국문화원 소식 {count}개 복사 완료!" if count else "💤 오늘/어제 올라온 새 한국문화원 소식 없음.")

# 3. 💼 KOTRA 마닐라 무역관 뉴스
def scrape_kotra():
    print(f"\n💼 [KOTRA] 필리핀 경제/무역 동향 확인 중... (오늘/어제 필터 적용)")
    prefix = "[경제 동향]"
    recent_titles = get_recent_titles(prefix, "info", "tip") 
    list_url = "https://dream.kotra.or.kr/kotranews/cms/biz/news/1/actionKotraBoardList.do?MENU_CD=F0138&p_nsCd=254"
    base_url = "https://dream.kotra.or.kr"
    
    res = fetch_with_retry(list_url)
    if not res: return
    soup = BeautifulSoup(res.text, 'html.parser')
    rows = soup.select('.board_list tbody tr')
    
    count = extract_and_insert(recent_titles, base_url, rows, prefix, "info", "tip", '.cont, .board_view_cont', enforce_date=True)
    print(f"🎉 KOTRA 경제 뉴스 {count}개 복사 완료!" if count else "💤 오늘/어제 올라온 새 KOTRA 뉴스 없음.")

# 4. ✈️ 항공사 특가 프로모션
def scrape_airlines():
    print(f"\n✈️ [항공권] 특가 및 프로모션 소식 확인 중...")
    prefix = "[특가 프로모션]"
    recent_titles = get_recent_titles(prefix, "travel", "review") 
    list_url = "https://www.philippineairlines.com/en/promotions"
    base_url = "https://www.philippineairlines.com"
    
    res = fetch_with_retry(list_url)
    if not res: return
    soup = BeautifulSoup(res.text, 'html.parser')
    rows = soup.select('.promo-card, .promo-item')
    
    count = extract_and_insert(recent_titles, base_url, rows, prefix, "travel", "review", '.promo-details, .content, .main-content', enforce_date=True)
    print(f"🎉 프로모션 소식 {count}개 복사 완료!" if count else "💤 새 특가 프로모션 없음.")

def run_official_news_bot():
    print("🚀 다채널 교민 소식 통합 봇 업데이트를 시작합니다.")
    scrape_embassy()
    scrape_kcc()
    scrape_kotra()
    scrape_airlines()
    print("\n🏁 모든 수집 활동을 마쳤습니다.")

if __name__ == "__main__":
    run_official_news_bot()
