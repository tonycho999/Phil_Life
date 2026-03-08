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
    # [행동 1] 게시글 작성 로직 (자유게시판 & QnA 교차 작성)
    # -------------------------------------------------------------------
    if current_post_count < TARGET_POSTS:
        # 1시간마다 실행되므로, 남은 개수에 비례해 이번 턴에 글을 쓸 확률 부여 (몰아서 쓰기 방지)
        if random.random() < 0.4: 
            bot = pick_random_bot(user_profiles, "post")
            
            # ★ 수정됨: free(자유게시판)와 qna(질문답변) 중 랜덤 선택
            target_sub = random.choice(["free", "qna"])
            
            # 카테고리에 맞춰 프롬프트 지시사항 다르게 설정
            if target_sub == "free":
                post_instruction = f"자유게시판에 올릴 짧은 일상 글을 작성해. {bot['location']}의 날씨나 풍경, 또는 {bot['job']}과 관련된 소소한 일상 이야기를 해."
            else:
                post_instruction = f"Q&A(질문답변) 게시판에 올릴 짧은 질문 글을 작성해. {bot['location']} 지역의 맛집, 여행 정보, 생활 꿀팁, 또는 {bot['job']} 관련해서 궁금한 점을 다른 유저들에게 물어봐."

            print(f"✍️ [글쓰기 당첨] {bot['nickname']} -> [{target_sub}] 게시판 작성")
            
            prompt = f"""
            너는 필리핀 커뮤니티의 실제 회원이야. 아래 너의 프로필에 완벽하게 빙의해.
            - 나이: {bot['age']}세
            - 직업: {bot['job']}
            - 거주지: {bot['location']}
            - MBTI: {bot['mbti']}
            - 성향: {bot['activity_type']}
            
            [규칙]
            1. {post_instruction}
            2. 절대 AI 티를 내지 말고, {bot['age']}대 나이에 맞는 자연스러운 인터넷 말투(ㅋㅋ, ㅎㅎ, ㅠㅠ 등)를 써.
            3. JSON 형식으로만 응답해. 키 값은 "title"과 "content"야. content는 HTML 없이 순수 텍스트로 줘.
            """
            
            try:
                res = model.generate_content(prompt)
                post_data = json.loads(res.text)
                
                # DB 저장
                post_insert = {
                    "author_id": bot['id'],
                    "category_main": "community", 
                    "category_sub": target_sub,
                    "title": post_data['title'],
                    "content": post_data['content']
                }
                supabase.table("posts").insert(post_insert).execute()
                print(f"✅ 글 작성 완료: {post_data['title']}")
            except Exception as e:
                print(f"❌ 글 작성 에러: {e}")

    # -------------------------------------------------------------------
    # [행동 2] 댓글 작성 로직 (조회수 +1 포함)
    # -------------------------------------------------------------------
    if current_comment_count < TARGET_COMMENTS:
        # 댓글은 1턴에 1~2개씩 달도록 함
        if random.random() < 0.7:
            # 타겟 게시글 찾기: 최근 3일 이내, 봇(운영자+유저 전체)이 작성한 글
            three_days_ago = (now - timedelta(days=3)).isoformat()
            try:
                recent_posts_res = supabase.table("posts").select("id, author_id, category_main, category_sub, title, content, view_count").gte("created_at", three_days_ago).execute()
                # 봇이 쓴 글만 필터링 (진짜 유저 글 철저히 배제)
                target_posts = [p for p in recent_posts_res.data if p['author_id'] in all_bot_ids]
                
                if target_posts:
                    target = random.choice(target_posts)
                    bot = pick_random_bot(user_profiles, "comm")
                    
                    print(f"💬 [댓글 당첨] {bot['nickname']} -> [{target['category_main']}/{target['category_sub']}] 게시글에 댓글 작성 시도")
                    
                    # 게시판 성격에 따른 프롬프트 분기
                    if target['category_main'] in ['news', 'info', 'travel']:
                        prompt = f"""
                        너는 필리핀에 거주하는 {bot['age']}세 {bot['job']}이야. 
                        아래 기사/정보글을 읽고, 그 '분위기'에 맞는 자연스러운 리액션 댓글을 딱 1문장(짧게) 작성해.

                        - 만약 스포츠 경기 결과라면: 응원, 환호, 아쉬움 (예: 와 대박이네요!, 한국팀 화이팅!)
                        - 만약 사건/사고/재난/날씨라면: 걱정, 안타까움, 주의 당부 (예: 아이고 다치신 분 없기를 ㅠㅠ, 다들 조심하세요)
                        - 만약 유용한 생활/비자/여행 정보라면: 감사, 스크랩 (예: 오 꿀팁 감사합니다!, 좋은 정보 퍼가요~)
                        - 정치나 일반 사회 뉴스라면: 짧은 감상평 (예: 세상이 참 각박하네요, 앞으로 더 좋아지길 바랍니다)

                        [원문 제목]: {target['title']}
                        [원문 내용]: {target['content'][:300]}
                        
                        절대 AI 티 내지 말고 친근하고 자연스러운 인터넷 말투를 써. 다른 인사말 없이 딱 댓글 내용만 출력해.
                        """
                    else:
                        # ★ 수정됨: 커뮤니티(자유/질문답변) 게시판 대응 프롬프트
                        prompt = f"""
                        너는 {bot['location']}에 사는 {bot['age']}세 {bot['job']}이야. 성격은 {bot['mbti']}야.
                        아래 다른 유저가 쓴 글을 읽고, 너의 입장에서 1~2줄짜리 짧고 친근한 공감 댓글을 달아줘. 
                        
                        만약 원문이 질문을 하는 내용이라면 아는 선에서 답변이나 조언을 해주고, 단순한 일상 글이라면 친근하게 맞장구를 쳐줘.
                        절대 AI 티 내지 말고 사람 냄새 나는 커뮤니티 유저처럼 써.
                        
                        [원문 제목]: {target['title']}
                        [원문 내용]: {target['content'][:300]}
                        """
                        
                    res = text_model.generate_content(prompt)
                    comment_text = res.text.strip().replace('"', '')
                    
                    # DB 저장 (댓글)
                    comment_insert = {
                        "post_id": target['id'],
                        "author_id": bot['id'],
                        "content": comment_text
                    }
                    supabase.table("comments").insert(comment_insert).execute()
                    
                    # 무조건 조회수(view_count) 1 추가
                    current_views = target.get('view_count') or 0
                    supabase.table("posts").update({"view_count": current_views + 1}).eq("id", target['id']).execute()
                    
                    print(f"✅ 댓글 작성 및 조회수(+1) 증가 완료: {comment_text}")
            except Exception as e:
                print(f"❌ 댓글 작성/조회수 업데이트 에러: {e}")

    # -------------------------------------------------------------------
    # [행동 3] 눈팅족 (조회수 펌핑) 로직 ★ 추가됨
    # -------------------------------------------------------------------
    print("👀 [눈팅족 활동] 가상 유저들의 게시글 눈팅(조회수 증가)을 시작합니다...")
    try:
        three_days_ago = (now - timedelta(days=3)).isoformat()
        # 최근 3일 이내의 모든 글 (사람이 쓴 글 포함) 조회수 펌핑 대상
        recent_all_posts_res = supabase.table("posts").select("id, title, view_count").gte("created_at", three_days_ago).execute()
        
        if recent_all_posts_res.data:
            # 최대 10개의 게시글 랜덤 샘플링
            sample_size = min(10, len(recent_all_posts_res.data))
            lurker_targets = random.sample(recent_all_posts_res.data, sample_size)
            
            for t_post in lurker_targets:
                c_views = t_post.get('view_count') or 0
                # 눈팅족이 방문했으므로 조회수 2씩 추가
                supabase.table("posts").update({"view_count": c_views + 2}).eq("id", t_post['id']).execute()
                
            print(f"✅ 눈팅족 활동 완료: 총 {sample_size}개 게시글 조회수 +2 증가 처리됨.")
    except Exception as e:
        print(f"❌ 눈팅족 활동 에러: {e}")

    print("🏁 이번 시간 소통 봇 활동 종료.")

if __name__ == "__main__":
    run_community_bot()
