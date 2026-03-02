import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import NicknameGuard from "@/components/auth/NicknameGuard"; // 1. 임포트 추가

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>
          {/* 2. 여기에 Guard를 넣어야 닉네임 없을 때 흰 화면이 덮칩니다 */}
          <NicknameGuard /> 
          
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
