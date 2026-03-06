import sys
import os

# 현재 폴더(bot)를 경로에 추가해서 분리된 부품 파일들을 잘 불러오게 함
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from newsbot_kr import run_newsbot_kr
from newsbot_en import run_newsbot_en
# ★ 수정된 부분: ph_travel.py에서 실행 함수를 가져오고, 이름을 run_ph_travel로 부릅니다.
from ph_travel import process_tasks as run_ph_travel
# ★ 추가된 부분: ph_info.py에서 실행 함수를 가져오고, 이름을 run_ph_info로 부릅니다.
from ph_info import process_tasks as run_ph_info

def main():
    print("🚀 [실전] 필카페24 뉴스 자동화 봇 통합 스크립트 시작!")
    print("==================================================")
    
    # 1. 한국 뉴스 봇(네이버) 출동
    try:
        run_newsbot_kr()
    except Exception as e:
        print(f"❌ 필한뉴스 에러: {e}")

    print("--------------------------------------------------")
    
    # 2. 해외 뉴스 봇(Gnews + AI 번역) 출동
    try:
        run_newsbot_en()
    except Exception as e:
        print(f"❌ 필뉴스 에러: {e}")
        
    print("--------------------------------------------------")
    
    # 3. 필여행 봇(골프장/호텔 정보 자동 포스팅) 출동
    try:
        print("🤖 [필여행] 골프장/호텔 정보 포스팅 봇 출동!")
        run_ph_travel()
    except Exception as e:
        print(f"❌ 필여행 에러: {e}")

    print("--------------------------------------------------")
    
    # 4. 필정보 봇(비자/교육/법률 등 정보 자동 포스팅) 출동
    try:
        print("🤖 [필정보] 생활/실무 정보 포스팅 봇 출동!")
        run_ph_info()
    except Exception as e:
        print(f"❌ 필정보 에러: {e}")
        
    print("==================================================")
    print("🎉 모든 뉴스 봇의 DB 작성 작업이 완료되었습니다!")

if __name__ == "__main__":
    main()
