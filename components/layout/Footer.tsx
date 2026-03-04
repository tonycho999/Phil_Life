import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-12 py-8 text-gray-500">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* 상단: 링크 메뉴 */}
        <ul className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-sm font-medium mb-6">
          <li>
            <Link href="/about" className="hover:text-blue-600 transition">사이트 소개</Link>
          </li>
          <li className="hidden md:block text-gray-300">|</li>
          <li>
            <Link href="/terms" className="hover:text-blue-600 transition">이용약관</Link>
          </li>
          <li className="hidden md:block text-gray-300">|</li>
          <li>
            <Link href="/privacy" className="text-gray-800 font-bold hover:text-blue-600 transition">개인정보처리방침</Link>
          </li>
          <li className="hidden md:block text-gray-300">|</li>
          <li>
            <Link href="/rules" className="hover:text-blue-600 transition">운영원칙</Link>
          </li>
          <li className="hidden md:block text-gray-300">|</li>
          <li>
            <Link href="/partnership" className="hover:text-blue-600 transition">광고 및 제휴 문의</Link>
          </li>
        </ul>

        {/* 하단: 정보 및 카피라이트 */}
        <div className="text-xs space-y-2 text-center md:text-left text-gray-400">
          <p>
            <span className="font-bold text-gray-500">필카페24 (PhilCafe24)</span> 
            <span className="mx-2">|</span> 
            고객센터 이메일: <a href="mailto:support@philcafe24.com" className="hover:underline">support@philcafe24.com</a>
          </p>
          <p>
            본 사이트에 등록된 모든 콘텐츠는 저작권법의 보호를 받으며, 무단 전재, 복사, 배포 등을 금합니다.<br className="hidden md:block" />
            게시판에 작성된 게시물의 저작권과 책임은 작성자 본인에게 있습니다.
          </p>
          <p className="pt-2 font-medium">
            Copyright © {currentYear} PhilCafe24. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}
