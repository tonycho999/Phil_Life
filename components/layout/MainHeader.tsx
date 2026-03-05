"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MENUS, SITE_NAME } from "@/lib/constants";
import { useAuth } from "@/components/auth/AuthProvider";
import NicknameModal from "@/components/auth/NicknameModal";
// ★ User, LogIn 아이콘이 추가되었습니다.
import { Search, Sun, Cloud, CloudRain, CloudLightning, Snowflake, DollarSign, Coins, RefreshCcw, Loader2, Menu, X, ChevronRight, User, LogIn } from "lucide-react";

const WEATHER_API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY || "";

const CITY_QUERIES = [
  "Manila", "Cebu", "Angeles", "Davao", "Malay", 
  "Baguio", "Iloilo", "Tagbilaran", "Legazpi", "Santa Rosa", 
  "Cavite City", "Subic", "Vigan"
];

const CITY_LABELS: { [key: string]: string } = {
  "Manila": "마닐라", "Cebu": "세부", "Angeles": "앙헬레스", "Davao": "다바오",
  "Malay": "보라카이", "Baguio": "바기오", "Iloilo": "일로일로",
  "Tagbilaran": "보홀", "Legazpi": "레가스피", "Santa Rosa": "라구나",
  "Cavite City": "카비테", "Subic": "수빅", "Vigan": "비간"
};

export default function MainHeader() {
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();
  const [keyword, setKeyword] = useState("");

  const [exchange, setExchange] = useState({ usd: 0, php: 0, loading: true });
  const [weatherList, setWeatherList] = useState<any[]>([]);
  const [weatherLoading, setWeatherLoading] = useState(true);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

    const fetchWeather = async () => {
      if (!WEATHER_API_KEY) {
        setWeatherLoading(false);
        return;
      }
      try {
        const promises = CITY_QUERIES.map(async (queryCity) => {
          const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${queryCity},PH&appid=${WEATHER_API_KEY}&units=metric`);
          if (!res.ok) return null;
          const data = await res.json();
          
          return {
            city: CITY_LABELS[queryCity] || queryCity,
            temp: Math.round(data.main.temp),
            main: data.weather.main
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

      <header className="bg-logoBg sticky top-0 z-50 shadow-md">
        
        {/* 상단 정보 바 */}
        <div className="bg-slate-50 border-b border-gray-200 h-10 flex items-center overflow-hidden text-xs">
          <div className="max-w-7xl mx-auto w-full flex h-full">
            <div className="w-[30%] md:w-[25%] lg:w-[20%] h-full bg-blue-50/50 flex items-center justify-center px-2 border-r border-gray-200 shrink-0 z-10">
               {exchange.loading ? (
                 <span className="text-gray-400 flex items-center gap-1"><RefreshCcw size={10} className="animate-spin"/> 로딩..</span>
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

            <div className="flex-1 h-full flex items-center overflow-hidden bg-white relative">
               {weatherLoading ? (
                 <div className="flex items-center gap-2 px-4 text-gray-400">
                    <Loader2 size={12} className="animate-spin" /> 날씨 정보를 가져오는 중...
                 </div>
               ) : (
                 <div className="animate-marquee flex items-center gap-8 px-4">
                    {[...weatherList, ...weatherList, ...weatherList].map((w, i) => (
                      <div key={i} className="flex items-center gap-2 shrink-0 text-gray-600 font-medium">
                         <span className="font-bold text-gray-800">📍{w.city}</span>
                         <span className="flex items-center gap-1">{getWeatherIcon(w.main)} {w.temp}°</span>
                         {(i + 1) % weatherList.length === 0 && i !== (weatherList.length * 3 - 1) && (
                            <span className="text-gray-300 mx-4">|</span>
                         )}
                      </div>
                    ))}
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* 메인 헤더 */}
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-5">
          <div className="flex justify-between items-center gap-4 md:gap-8">
            <Link href="/" className="shrink-0 flex items-center">
              <Image 
                src="/images/logo.png" 
                alt={SITE_NAME} 
                width={180} 
                height={52} 
                priority 
                className="object-contain hover:opacity-80 transition w-32 md:w-[180px]"/>
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
            
            {/* ★ 수정된 우측 상단 퀵 메뉴: PC에서는 숨기고(md:hidden), 쓸데없는 코드 제거! */}
            <div className="flex items-center gap-3 shrink-0">
              {user ? (
                <Link href="/profile" className="md:hidden flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-blue-600 transition">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="avatar" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <User size={18} />
                    </div>
                  )}
                </Link>
              ) : (
                <Link href="/login" className="md:hidden flex items-center gap-1.5 text-sm font-bold text-gray-600 hover:text-blue-600 transition">
                  <LogIn size={24} />
                </Link>
              )}

              {/* 모바일 햄버거 메뉴 버튼 (전체 카테고리) */}
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-1 text-gray-600 hover:text-blue-600 transition ml-1"
              >
                <Menu size={26} />
              </button>
            </div>

          </div>
        </div>
        
        {/* 메뉴바 */}
        <div className="max-w-7xl mx-auto px-0 md:px-4 pb-0">
            <nav className="bg-blue-700 text-white md:rounded-t-xl overflow-hidden shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]">
                <ul className="flex items-center overflow-x-auto scrollbar-hide divide-x divide-blue-600">
                {MENUS.map((menu: any) => (
                    <li key={menu.id} className="flex-1 shrink-0 text-center hover:bg-blue-800 transition relative group">
                    <Link href={`/${menu.id}`} className="block px-4 py-3 text-sm md:text-base font-bold whitespace-nowrap">
                        {menu.label}
                    </Link>
                    </li>
                ))}
                </ul>
            </nav>
        </div>
      </header>

      {/* 모바일 슉! 슬라이드 드로어 메뉴 */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[999] flex md:hidden">
          <div 
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-[80%] max-w-[320px] bg-white h-full shadow-2xl flex flex-col ml-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-blue-50/50">
              {user ? (
                <Link href="/profile" className="flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <User size={20} />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-800 text-sm">{profile?.nickname || '회원'}님</span>
                    <span className="text-xs text-blue-600 font-medium">마이페이지 관리 〉</span>
                  </div>
                </Link>
              ) : (
                <Link href="/login" className="font-bold text-base text-blue-800 flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                  <LogIn size={18} /> 로그인 해주세요
                </Link>
              )}
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-800 rounded-lg transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-5">
              {MENUS.map((menu: any) => (
                <div key={menu.id} className="mb-6">
                  <Link 
                    href={`/${menu.id}`} 
                    className="flex items-center justify-between font-bold text-[17px] text-gray-800 mb-3"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {menu.label}
                    <ChevronRight size={18} className="text-gray-400" />
                  </Link>
                  <ul className="space-y-2 pl-3 border-l-2 border-blue-100">
                    {menu.sub?.map((sub: any) => (
                      <li key={sub.id}>
                        <Link 
                          href={`/${menu.id}/${sub.id}`}
                          className="block text-gray-600 py-1.5 text-sm hover:text-blue-600 hover:font-bold transition"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {sub.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
