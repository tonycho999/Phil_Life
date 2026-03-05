import sys
import os

# 현재 폴더(bot)를 경로에 추가해서 분리된 부품 파일들을 잘 불러오게 함
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from newsbot_kr import run_newsbot_kr
from newsbot_en import run_newsbot_en

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
        
    print("==================================================")
    print("🎉 모든 뉴스 봇의 DB 작성 작업이 완료되었습니다!")

if __name__ == "__main__":
    main()
