"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MENUS, SITE_NAME } from "@/lib/constants";
import { useAuth } from "@/components/auth/AuthProvider";
import NicknameModal from "@/components/auth/NicknameModal";
import { Search, Sun, Cloud, CloudRain, CloudLightning, Snowflake, DollarSign, Coins, RefreshCcw } from "lucide-react";

// ★ 수정됨: Vercel 환경변수에서 API 키를 가져옵니다.
const WEATHER_API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY || "";

const CITIES = ["Manila", "Cebu", "Clark", "Davao", "Boracay", "Baguio", "Iloilo"];

export default function MainHeader() {
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();
  const [keyword, setKeyword] = useState("");

  // 실시간 데이터 상태
  const [exchange, setExchange] = useState({ usd: 0, php: 0, loading: true });
  const [weatherList, setWeatherList] = useState<any[]>([]);
  const [weatherLoading, setWeatherLoading] = useState(true);

  // 날씨 상태에 따른 아이콘 매핑
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
    // 1. 환율 정보 가져오기 (Frankfurter 무료 API 사용)
    const fetchRates = async () => {
      try {
        // 달러 -> 원화
        const usdRes = await fetch("https://api.frankfurter.app/latest?from=USD&to=KRW");
        const usdData = await usdRes.json();
        
        // 페소 -> 원화
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

    // 2. 날씨 정보 가져오기 (OpenWeatherMap API)
    const fetchWeather = async () => {
      // 키가 없으면 경고만 남기고 로딩 종료
      if (!WEATHER_API_KEY) {
        console.warn("날씨 API 키가 환경변수에 설정되지 않았습니다.");
        setWeatherLoading(false);
        return;
      }

      try {
        const promises = CITIES.map(async (city) => {
          const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city},PH&appid=${WEATHER_API_KEY}&units=metric`);
          if (!res.ok) return null;
          const data = await res.json();
          return {
            city: city === "Manila" ? "마닐라" : city === "Cebu" ? "세부" : city === "Clark" ? "클락" : city === "Davao" ? "다바오" : city === "Boracay" ? "보라카이" : city === "Baguio" ? "바기오" : "일로일로",
            temp: Math.round(data.main.temp),
            main: data.weather.main,
            desc: data.weather.description
          };
        });

        const results = await Promise.all(promises);
        setWeatherList(results.filter(item => item !== null));
        setWeatherLoading(false);
      } catch (e) {
        console.error("날씨 로딩 실패", e);
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
        
        {/* ★ 최상단 정보 바 (실시간 데이터 적용) */}
        <div className="bg-slate-50 border-b border-gray-200 h-10 flex items-center overflow-hidden text-xs">
          <div className="max-w-7xl mx-auto w-full flex h-full">
            
            {/* 좌측: 실시간 환율 (고정) */}
            <div className="w-[30%] md:w-[25%] lg:w-[20%] h-full bg-blue-50/50 flex items-center justify-center px-2 border-r border-gray-200 shrink-0 z-10">
               {exchange.loading ? (
                 <span className="text-gray-400 flex items-center gap-1"><RefreshCcw size={10} className="animate-spin"/> 환율 로딩..</span>
               ) : (
                 <div className="flex flex-col md:flex-row items-center gap-1 md:gap-3 font-bold text-slate-700 whitespace-nowrap">
                    <span className="flex items-center gap-1 text-blue-700">
                      <DollarSign size={12} /> USD = {exchange.usd.toFixed(1)}₩
                    </span>
                    <span className="hidden md:inline text-gray-300">|</span>
                    <span className="flex items-center gap-1 text-green-700">
                      <Coins size={12} /> PHP = {exchange.php.toFixed(2)}₩
                    </span>
                 </div>
               )}
            </div>

            {/* 우측: 실시간 날씨 (Marquee 애니메이션) */}
            <div className="flex-1 h-full flex items-center overflow-hidden bg-white relative">
               {weatherLoading ? (
                 <div className="pl-4 text-gray-400">날씨 정보를 불러오는 중입니다...</div>
               ) : (
                 <div className="animate-marquee flex items-center gap-8 px-4 text-gray-600 font-medium">
                    {/* 데이터 반복 1회차 */}
                    {weatherList.map((w, i) => (
                      <div key={i} className="flex items-center gap-2">
                         <span className="font-bold text-gray-800">📍{w.city}</span>
                         <span className="flex items-center gap-1">{getWeatherIcon(w.main)} {w.temp}°C</span>
                      </div>
                    ))}
                    <span className="text-gray-300 mx-4">|</span>
                    {/* 데이터 반복 2회차 (끊김 방지용) */}
                    {weatherList.map((w, i) => (
                      <div key={`dup-${i}`} className="flex items-center gap-2">
                         <span className="font-bold text-gray-800">📍{w.city}</span>
                         <span className="flex items-center gap-1">{getWeatherIcon(w.main)} {w.temp}°C</span>
                      </div>
                    ))}
                 </div>
               )}
            </div>

          </div>
        </div>

        {/* 메인 헤더 (검색 및 로고) */}
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
                    <Link 
                        href={`/${menu.id}`} 
                        className="block py-4 text-base font-bold whitespace-nowrap"
                    >
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
