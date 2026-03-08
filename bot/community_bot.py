import os
import json
import random
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
import google.generativeai as genai
from supabase import create_client

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
genai.configure(api_key=GEMINI_API_KEY)

# Gemini 모델 설정 (JSON 반환 강제)
generation_config = {"response_mime_type": "application/json"}
model = genai.GenerativeModel('gemini-2.5-flash', generation_config=generation_config)
# 일반 텍스트용 모델
text_model = genai.GenerativeModel('gemini-2.5-flash')

def load_profiles():
    filepath = os.path.join(os.path.dirname(os.path.abspath(__file__)), "bot_profiles.json")
    with open(filepath, "r", encoding="utf-8") as f:
        profiles = json.load(f)
    
    # 운영자(뉴스/정보 봇)와 일반 유저(소통 봇) 분리
    admin_ids = [p['id'] for p in profiles if "운영자" in p.get('role', '')]
    user_profiles = [p for p in profiles if "운영자" not in p.get('role', '')]
    all_bot_ids = [p['id'] for p in profiles]
    
    return user_profiles, admin_ids, all_bot_ids

def pick_random_bot(user_profiles, action_type="post"):
    # post_probability = [글쓰기 확률, 댓글쓰기 확률]
    idx = 0 if action_type == "post" else 1
    
    # 각 유저의 해당 행동 확률을 가중치로 사용하여 랜덤 픽 (확률이 높은 애들이 자주 뽑힘)
    weights = [p.get("post_probability", [0.1, 0.1])[idx] for p in user_profiles]
    chosen_bot = random.choices(user_profiles, weights=weights, k=1)[0]
    return chosen_bot

def run_community_bot():
    print("🗣️ [소통 봇] 가상 유저 커뮤니티 활동을 시작합니다...")
    
    user_profiles, admin_ids, all_bot_ids = load_profiles()
    
    # 1. 오늘의 목표량 설정 (매일 자정 기준으로 시드가 변경되어 하루 종일 동일한 목표치 유지)
    ph_tz = timezone(timedelta(hours=8))
    now = datetime.now(ph_tz)
    today_str = now.strftime('%Y-%m-%d')
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    
    random.seed(today_str)
    TARGET_POSTS = random.randint(1, 4)
    TARGET_COMMENTS = random.randint(8, 11)
    random.seed() # 이후 랜덤은 다시 무작위로 복구
    
    print(f"🎯 오늘의 커뮤니티 목표: 글 {TARGET_POSTS}개 / 댓글 {TARGET_COMMENTS}개")

    # 2. 오늘 우리가 쓴 글/댓글 개수 파악하기 (DB 읽기)
    try:
        # 오늘 쓰여진 모든 글 가져오기
        today_posts_res = supabase.table("posts").select("id, author_id").gte("created_at", today_start).execute()
        my_posts_today = [p for p in today_posts_res.data if p['author_id'] in [u['id'] for u in user_profiles]]
        current_post_count = len(my_posts_today)
        
        # 오늘 쓰여진 모든 댓글 가져오기 (댓글 테이블 이름이 'comments'라고 가정)
        today_comments_res = supabase.table("comments").select("id, author_id").gte("created_at", today_start).execute()
        my_comments_today = [c for c in today_comments_res.data if c['author_id'] in [u['id'] for u in user_profiles]]
        current_comment_count = len(my_comments_today)
    except Exception as e:
        print(f"❌ DB 조회 에러: {e}")
        return

    print(f"📊 현재 달성량: 글 {current_post_count}개 / 댓글 {current_comment_count}개")

    # -------------------------------------------------------------------
    # [행동 1] 게시글 작성 로직 (자유게시판 한정)
    # -------------------------------------------------------------------
    if current_post_count < TARGET_POSTS:
        # 1시간마다 실행되므로, 남은 개수에 비례해 이번 턴에 글을 쓸 확률 부여 (몰아서 쓰기 방지)
        if random.random() < 0.4: 
            bot = pick_random_bot(user_profiles, "post")
            print(f"✍️ [글쓰기 당첨] {bot['nickname']} (나이:{bot['age']}, 직업:{bot['job']}, 지역:{bot['location']})")
            
            prompt = f"""
            너는 필리핀 커뮤니티의 실제 회원이야. 아래 너의 프로필에 완벽하게 빙의해.
            - 나이: {bot['age']}세
            - 직업: {bot['job']}
            - 거주지: {bot['location']}
            - MBTI: {bot['mbti']}
            - 성향: {bot['activity_type']}
            
            [규칙]
            1. 자유게시판에 올릴 짧은 일상 글을 작성해.
            2. {bot['location']}의 날씨나 풍경, 또는 {bot['job']}과 관련된 소소한 일상 이야기를 해.
            3. 절대 AI 티를 내지 말고, {bot['age']}대 나이에 맞는 자연스러운 인터넷 말투(ㅋㅋ, ㅎㅎ, ㅠㅠ 등)를 써.
            4. JSON 형식으로만 응답해. 키 값은 "title"과 "content"야. content는 HTML 없이 순수 텍스트로 줘.
            """
            
            try:
                res = model.generate_content(prompt)
                post_data = json.loads(res.text)
                
                # DB 저장 (category_main은 커뮤니티/자유게시판에 맞게 수정 필요)
                post_insert = {
                    "author_id": bot['id'],
                    "category_main": "community", 
                    "category_sub": "free",
                    "title": post_data['title'],
                    "content": post_data['content']
                }
                supabase.table("posts").insert(post_insert).execute()
                print(f"✅ 글 작성 완료: {post_data['title']}")
            except Exception as e:
                print(f"❌ 글 작성 에러: {e}")

    # -------------------------------------------------------------------
    # [행동 2] 댓글 작성 로직 (오직 봇들이 쓴 글에만)
    # -------------------------------------------------------------------
    if current_comment_count < TARGET_COMMENTS:
        # 댓글은 1턴에 1~2개씩 달도록 함
        if random.random() < 0.7:
            # 타겟 게시글 찾기: 최근 3일 이내, 봇(운영자+유저 전체)이 작성한 글
            three_days_ago = (now - timedelta(days=3)).isoformat()
            try:
                recent_posts_res = supabase.table("posts").select("id, author_id, category_main, title, content").gte("created_at", three_days_ago).execute()
                # 봇이 쓴 글만 필터링 (진짜 유저 글 철저히 배제)
                target_posts = [p for p in recent_posts_res.data if p['author_id'] in all_bot_ids]
                
                if target_posts:
                    target = random.choice(target_posts)
                    bot = pick_random_bot(user_profiles, "comm")
                    
                    print(f"💬 [댓글 당첨] {bot['nickname']} -> [{target['category_main']}] 게시글에 댓글 작성 시도")
                    
                    # 게시판 성격에 따른 프롬프트 분기
                    if target['category_main'] in ['news', 'info', 'travel']:
                        # 정보/뉴스 게시판: 짧은 감사 인사
                        prompt = f"""
                        너는 {bot['age']}세 {bot['job']}이야. 누군가 유용한 정보글(제목: {target['title']})을 올렸어.
                        이 본문에 대해 "좋은 정보 감사합니다", "퍼가요", "유용하네요" 같은 짧은 1문장짜리 감사 댓글을 남겨. 
                        문장 부호나 이모티콘을 살짝 섞어서 사람처럼 써. 다른 말은 절대 하지 마.
                        """
                    else:
                        # 자유게시판: 페르소나 기반 티키타카
                        prompt = f"""
                        너는 {bot['location']}에 사는 {bot['age']}세 {bot['job']}이야. 성격은 {bot['mbti']}야.
                        아래 다른 유저가 쓴 글을 읽고, 너의 입장에서 1~2줄짜리 짧고 친근한 공감 댓글을 달아줘. 
                        절대 AI 티 내지 말고 친근한 커뮤니티 유저처럼 써.
                        
                        [원문 제목]: {target['title']}
                        [원문 내용]: {target['content'][:300]}
                        """
                        
                    res = text_model.generate_content(prompt)
                    comment_text = res.text.strip().replace('"', '')
                    
                    # DB 저장 (댓글 테이블명과 컬럼 구조는 관리자님의 실제 DB에 맞춰주세요)
                    comment_insert = {
                        "post_id": target['id'],
                        "author_id": bot['id'],
                        "content": comment_text
                    }
                    supabase.table("comments").insert(comment_insert).execute()
                    print(f"✅ 댓글 작성 완료: {comment_text}")
            except Exception as e:
                print(f"❌ 댓글 작성 에러: {e}")

    print("🏁 이번 시간 소통 봇 활동 종료.")

if __name__ == "__main__":
    run_community_bot()
