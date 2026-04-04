"use client";

import dynamic from "next/dynamic";

const RealCityMapClient = dynamic(() => import("./RealCityMapClient"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[430px] items-center justify-center rounded-[28px] border border-white/10 bg-[#0b1020] text-sm text-slate-400">
      Загрузка карты...
    </div>
  ),
});

export default function RealCityMap() {
  return <RealCityMapClient />;
}