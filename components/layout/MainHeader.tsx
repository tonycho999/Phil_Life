"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MENUS, SITE_NAME } from "@/lib/constants";
import { useAuth } from "@/components/auth/AuthProvider";
import NicknameModal from "@/components/auth/NicknameModal";
import { Search, Sun, Cloud, CloudRain, CloudLightning, Snowflake, DollarSign, Coins, RefreshCcw } from "lucide-react";

const WEATHER_API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY || "";

// ★ API 검색용 도시 이름 (API가 인식하는 영문명)
const CITY_QUERIES = [
  "Manila", "Cebu", "Angeles", "Davao", "Boracay", 
  "Baguio", "Iloilo", "Tagbilaran", "Legazpi", "Santa Rosa", 
  "Cavite City", "Subic", "Vigan"
];

// ★ 화면 표시용 한글 이름 매핑
const CITY_LABELS: { [key: string]: string } = {
  "Manila": "마닐라",
  "Cebu": "세부",
  "Angeles": "앙헬레스/클락",
  "Davao": "다바오",
  "Boracay": "보라카이",
  "Baguio": "바기오",
  "Iloilo": "일로일로",
  "Tagbilaran": "보홀",       // 보홀의 주도(Tagbilaran) 날씨를 보홀로 표시
  "Legazpi": "레가스피",
  "Santa Rosa": "라구나",     // 라구나의 주요도시(Santa Rosa) 날씨를 라구나로 표시
  "Cavite City": "카비테",
  "Subic": "수빅",
  "Vigan": "비간"
};

export default function MainHeader() {
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();
  const [keyword, setKeyword] = useState("");

  const [exchange, setExchange] = useState({ usd: 0, php: 0, loading: true });
  const [weatherList, setWeatherList] = useState<any[]>([]);
  const [weatherLoading, setWeatherLoading] = useState(true);

  // 도시가 5개 이상이면 자동으로 스크롤
  const shouldScroll = weatherList.length >= 5;

  const getWeatherIcon = (main: string) => {
    switch (main) {
      case "Clear": return <Sun size={14} className="text-orange-500" />;
      case "Clouds": return <Cloud size={14} className="text-gray-400" />;
      case "Rain": return <CloudRain size={14} className="text-blue-500" />;
      case "Thunderstorm": return <CloudLightning size={14} className="text-yellow-600" />;
      case "Snow": return <Snowflake size={14} className="text-cyan-400" />;
      default: return <Cloud size={14} className="text-blue-300" />;
    }
  };

  useEffect(() => {
    // 1. 환율 정보
    const fetchRates = async () => {
      try {
        const usdRes = await fetch("https://api.frankfurter.app/latest?from=USD&to=KRW");
        const usdData = await usdRes.json();
        const phpRes = await fetch("https://api.frankfurter.app/latest?from=PHP&to=KRW");
        const phpData = await phpRes.json();

        setExchange({
          usd: usdData.rates.KRW,
          php: phpData.rates.KRW,
          loading: false
        });
      } catch (e) {
        console.error("환율 로딩 실패", e);
      }
    };

    // 2. 날씨 정보
    const fetchWeather = async () => {
      if (!WEATHER_API_KEY) {
        setWeatherLoading(false);
        return;
      }
      try {
        const promises = CITY_QUERIES.map(async (queryCity) => {
          // 필리핀 코드(PH)와 섭씨(metric) 설정
          const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${queryCity},PH&appid=${WEATHER_API_KEY}&units=metric`);
          if (!res.ok) return null;
          const data = await res.json();
          
          return {
            city: CITY_LABELS[queryCity] || queryCity, // 한글 이름으로 변환
            temp: Math.round(data.main.temp),
            main: data.weather.main
          };
        });

        const results = await Promise.all(promises);
        setWeatherList(results.filter(item => item !== null));
        setWeatherLoading(false);
      } catch (e) {
        setWeatherLoading(false);
      }
    };

    fetchRates();
    fetchWeather();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    router.push(`/?q=${keyword}`);
  };

  return (
    <>
      {user && profile && !profile.nickname && (
        <NicknameModal userId={user.id} onComplete={refreshProfile} />
      )}

      <header className="bg-white sticky top-0 z-50 shadow-md">
        
        {/* 상단 정보 바 */}
        <div className="bg-slate-50 border-b border-gray-200 h-10 flex items-center overflow-hidden text-xs">
          <div className="max-w-7xl mx-auto w-full flex h-full">
            
            {/* 좌측: 환율 (고정) */}
            <div className="w-[30%] md:w-[25%] lg:w-[20%] h-full bg-blue-50/50 flex items-center justify-center px-2 border-r border-gray-200 shrink-0 z-10">
               {exchange.loading ? (
                 <span className="text-gray-400 flex items-center gap-1"><RefreshCcw size={10} className="animate-spin"/> 로딩중..</span>
               ) : (
                 <div className="flex flex-col md:flex-row items-center gap-1 md:gap-3 font-bold text-slate-700 whitespace-nowrap">
                    <span className="flex items-center gap-1 text-blue-700">
                      <DollarSign size={12} /> {exchange.usd.toFixed(0)}
                    </span>
                    <span className="hidden md:inline text-gray-300">|</span>
                    <span className="flex items-center gap-1 text-green-700">
                      <Coins size={12} /> {exchange.php.toFixed(1)}
                    </span>
                 </div>
               )}
            </div>

            {/* 우측: 날씨 (도시가 많으므로 흐르는 애니메이션 적용) */}
            <div className="flex-1 h-full flex items-center overflow-hidden bg-white relative">
               {weatherLoading ? (
                 <div className="pl-4 text-gray-400">날씨 로딩 중...</div>
               ) : (
                 <div className={shouldScroll ? "animate-marquee gap-8 px-4" : "flex items-center gap-6 px-4 w-full justify-end"}>
                    
                    {/* 1. 기본 목록 */}
                    {weatherList.map((w, i) => (
                      <div key={i} className="flex items-center gap-2 shrink-0 text-gray-600 font-medium">
                         <span className="font-bold text-gray-800">📍{w.city}</span>
                         <span className="flex items-center gap-1">{getWeatherIcon(w.main)} {w.temp}°</span>
                      </div>
                    ))}

                    {/* 2. 스크롤 모드일 때만 목록 복제 (끊김 방지) */}
                    {shouldScroll && (
                      <>
                        <span className="text-gray-300 mx-4">|</span>
                        {weatherList.map((w, i) => (
                          <div key={`dup-${i}`} className="flex items-center gap-2 shrink-0 text-gray-600 font-medium">
                             <span className="font-bold text-gray-800">📍{w.city}</span>
                             <span className="flex items-center gap-1">{getWeatherIcon(w.main)} {w.temp}°</span>
                          </div>
                        ))}
                      </>
                    )}
                 </div>
               )}
            </div>

          </div>
        </div>

        {/* 메인 헤더 */}
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-7">
          <div className="flex justify-between items-center gap-8">
            <Link href="/" className="font-black text-3xl md:text-4xl text-blue-700 tracking-tighter shrink-0 hover:text-blue-800 transition">
              {SITE_NAME}
            </Link>

            <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:block">
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="필리핀 생활 정보, 뉴스, 커뮤니티 검색" 
                  className="w-full bg-gray-100 border border-gray-200 rounded-full py-3 px-6 pl-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-500 transition-all shadow-inner"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
                 <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5 group-focus-within:text-blue-500 transition" />
              </div>
            </form>
            <div className="shrink-0 w-8"></div>
          </div>
        </div>
        
        {/* 메뉴바 */}
        <div className="max-w-7xl mx-auto px-4 pb-0">
            <nav className="bg-blue-700 text-white rounded-t-xl overflow-hidden shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]">
                <ul className="flex justify-between items-center overflow-x-auto scrollbar-hide divide-x divide-blue-600">
                {MENUS.map((menu: any) => (
                    <li key={menu.id} className="flex-1 text-center hover:bg-blue-800 transition relative group">
                    <Link href={`/${menu.id}`} className="block py-4 text-base font-bold whitespace-nowrap">
                        {menu.label}
                    </Link>
                    </li>
                ))}
                </ul>
            </nav>
        </div>
      </header>
    </>
  );
}
