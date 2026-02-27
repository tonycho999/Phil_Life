"use client";

import { useEffect, useState } from "react";

export default function TopInfoBar() {
  const [exchange, setExchange] = useState({ usd: 0, krw: 0 });
  const [weather, setWeather] = useState({ manila: 0, cebu: 0 });

  useEffect(() => {
    // 1. 환율 API (Frankfurter - 무료/키없음)
    fetch("https://api.frankfurter.app/latest?from=USD&to=PHP,KRW")
      .then((res) => res.json())
      .then((data) => {
        // 1 USD -> PHP
        const usdToPhp = data.rates.PHP;
        // 1 PHP -> KRW 계산 (1 USD = ? KRW 이므로 나누기)
        const phpToKrw = data.rates.KRW / usdToPhp;
        setExchange({ usd: usdToPhp, krw: phpToKrw });
      })
      .catch((e) => console.error("환율 로딩 실패", e));

    // 2. 날씨 API (Open-Meteo - 무료/키없음)
    // 마닐라(14.59, 120.98), 세부(10.31, 123.89)
    fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=14.59,10.31&longitude=120.98,123.89&current=temperature_2m&timezone=Asia%2FManila"
    )
      .then((res) => res.json())
      .then((data) => {
        // data[0]: 마닐라, data[1]: 세부
        setWeather({
          manila: data[0].current.temperature_2m,
          cebu: data[1].current.temperature_2m,
        });
      })
      .catch((e) => console.error("날씨 로딩 실패", e));
  }, []);

  return (
    <div className="bg-gray-50 border-b border-gray-200 py-1 text-xs text-center text-gray-500">
      <div className="max-w-7xl mx-auto px-4 flex justify-center gap-4 flex-wrap">
        {/* 환율 정보 */}
        <span className="text-red-600 font-bold">
          $1 = {exchange.usd ? exchange.usd.toFixed(2) : "--"} PHP
        </span>
        <span className="text-blue-600 font-bold">
          1 PHP = {exchange.krw ? exchange.krw.toFixed(2) : "--"} KRW
        </span>
        
        {/* 구분선 */}
        <span className="text-gray-300">|</span>

        {/* 날씨 정보 */}
        <span>
          ⛅ 마닐라 {weather.manila ? Math.round(weather.manila) : "--"}°C
        </span>
        <span>
          🌴 세부 {weather.cebu ? Math.round(weather.cebu) : "--"}°C
        </span>
      </div>
    </div>
  );
}
