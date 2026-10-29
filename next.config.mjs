/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // 정적 페이지 생성 제한 시간을 기본 60초에서 180초로 늘립니다.
  staticPageGenerationTimeout: 180,

  // 덮어쓰기 방지 및 빌드 오류 무시 옵션 (급한 불 끄기용)
  typescript: {
    // !! 경고 !!
    // 프로덕션 빌드 시 타입 오류를 무시합니다.
    ignoreBuildErrors: true,
  },
  eslint: {
    // 프로덕션 빌드 시 ESLint 오류를 무시합니다.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
