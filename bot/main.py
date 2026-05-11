import sys
import os

# 현재 폴더(bot)를 경로에 추가해서 분리된 부품 파일들을 잘 불러오게 함
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from newsbot_kr import run_newsbot_kr
from newsbot_en import run_newsbot_en

# ★ 아래 3개의 봇은 잠시 휴식 (비활성화 상태) - 나중에 쓸 때 #을 지워주세요.
# from ph_travel import process_tasks as run_ph_travel
# from ph_info import process_tasks as run_ph_info
# from embassy_bot import run_official_news_bot

def main():
    print("🚀 [실전] 필카페24 자동화 봇 통합 스크립트 시작!")
    print("==================================================")
    
    # 1. 한국 뉴스 봇(네이버) 출동 [작동 중]
    try:
        run_newsbot_kr()
    except Exception as e:
        print(f"❌ 필한뉴스 에러: {e}")

    print("--------------------------------------------------")
    
    # 2. 해외 뉴스 봇(Gnews + AI 번역) 출동 [작동 중]
    try:
        run_newsbot_en()
    except Exception as e:
        print(f"❌ 필뉴스 에러: {e}")
        
    print("--------------------------------------------------")
    
    # ==========================================
    # 🛑 아래부터는 임시 중지된 봇들입니다. 🛑
    # ==========================================

    # 3. 필여행 봇(골프장/호텔 정보 자동 포스팅) 출동 - 잠시 중지
    # try:
    #     print("🤖 [필여행] 골프장/호텔 정보 포스팅 봇 출동!")
    #     run_ph_travel()
    # except Exception as e:
    #     print(f"❌ 필여행 에러: {e}")
    #
    # print("--------------------------------------------------")
    
    # 4. 필정보 봇(비자/교육/법률 등 정보 자동 포스팅) 출동 - 잠시 중지
    # try:
    #     print("🤖 [필정보] 생활/실무 정보 포스팅 봇 출동!")
    #     run_ph_info()
    # except Exception as e:
    #     print(f"❌ 필정보 에러: {e}")
    #
    # print("--------------------------------------------------")
    
    # ★ 5. 교민/정보/여행 스크래핑 봇 출동 - 잠시 중지
    # try:
    #     print("🤖 [필뉴스] 대사관/문화원/KOTRA/항공권 정보 스크래핑 출동!")
    #     run_official_news_bot()
    # except Exception as e:
    #     print(f"❌ 통합 스크래핑 봇 에러: {e}")
        
    print("==================================================")
    print("🎉 모든 봇의 DB 작성 작업이 성공적으로 완료되었습니다!")

if __name__ == "__main__":
    main()
