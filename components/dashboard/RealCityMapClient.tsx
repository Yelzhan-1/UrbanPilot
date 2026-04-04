"use client";

import { Fragment } from "react";
import {
  CircleMarker,
  MapContainer,
  Polyline,
  TileLayer,
  Tooltip,
  ZoomControl,
} from "react-leaflet";
import type { LatLngExpression, PathOptions } from "leaflet";

type Tone = "high" | "medium" | "low";

type Hotspot = {
  id: string;
  name: string;
  position: [number, number];
  tone: Tone;
  metric: string;
  label: string;
};

const center: LatLngExpression = [43.238949, 76.889709];

const hotspots: Hotspot[] = [
  {
    id: "almaly-traffic",
    name: "Алмалинский район",
    position: [43.2567, 76.9286],
    tone: "high",
    metric: "92",
    label: "Перегрузка трафика",
  },
  {
    id: "bostandyk-air",
    name: "Бостандыкский район",
    position: [43.222, 76.9092],
    tone: "medium",
    metric: "74",
    label: "Рост загрязнения воздуха",
  },
  {
    id: "medeu-sensor",
    name: "Медеуский район",
    position: [43.1636, 77.0583],
    tone: "low",
    metric: "41",
    label: "Проверка сети датчиков",
  },
  {
    id: "auezov-load",
    name: "Ауэзовский район",
    position: [43.2378, 76.8405],
    tone: "medium",
    metric: "67",
    label: "Плотность потока",
  },
  {
    id: "nauryzbay-utility",
    name: "Наурызбайский район",
    position: [43.1773, 76.7929],
    tone: "low",
    metric: "38",
    label: "Стабильный режим",
  },
  {
    id: "turksib-risk",
    name: "Турксибский район",
    position: [43.337, 76.9502],
    tone: "high",
    metric: "88",
    label: "Нагрузка на узлы",
  },
];

const corridors: [number, number][][] = [
  [
    [43.2567, 76.9286],
    [43.2378, 76.8405],
    [43.1773, 76.7929],
  ],
  [
    [43.337, 76.9502],
    [43.2567, 76.9286],
    [43.222, 76.9092],
    [43.1636, 77.0583],
  ],
];

function getToneStyles(tone: Tone): {
  glow: PathOptions;
  core: PathOptions;
  line: string;
  pill: string;
} {
  if (tone === "high") {
    return {
      glow: {
        color: "#fb7185",
        fillColor: "#fb7185",
        fillOpacity: 0.14,
        weight: 0,
      },
      core: {
        color: "#fff1f2",
        fillColor: "#fb7185",
        fillOpacity: 0.96,
        weight: 2,
      },
      line: "#fb7185",
      pill: "border-rose-400/20 bg-slate-950/80 text-rose-200",
    };
  }

  if (tone === "medium") {
    return {
      glow: {
        color: "#fbbf24",
        fillColor: "#fbbf24",
        fillOpacity: 0.14,
        weight: 0,
      },
      core: {
        color: "#fffbeb",
        fillColor: "#fbbf24",
        fillOpacity: 0.96,
        weight: 2,
      },
      line: "#fbbf24",
      pill: "border-amber-400/20 bg-slate-950/80 text-amber-100",
    };
  }

  return {
    glow: {
      color: "#34d399",
      fillColor: "#34d399",
      fillOpacity: 0.14,
      weight: 0,
    },
    core: {
      color: "#ecfdf5",
      fillColor: "#34d399",
      fillOpacity: 0.96,
      weight: 2,
    },
    line: "#34d399",
    pill: "border-emerald-400/20 bg-slate-950/80 text-emerald-100",
  };
}

function toneLabel(tone: Tone) {
  if (tone === "high") return "Высокий риск";
  if (tone === "medium") return "Под наблюдением";
  return "Стабильный режим";
}

export default function RealCityMapClient() {
  return (
    <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[#0b1120]">
      <div className="absolute inset-0 z-[350] bg-[linear-gradient(180deg,rgba(2,6,23,0.08),rgba(2,6,23,0.04))]" />
      <div className="absolute inset-x-0 top-0 z-[400] h-24 bg-[linear-gradient(180deg,rgba(2,6,23,0.34),transparent)]" />
      <div className="absolute inset-x-0 bottom-0 z-[400] h-28 bg-[linear-gradient(0deg,rgba(2,6,23,0.44),transparent)]" />

      <MapContainer
        center={center}
        zoom={11}
        minZoom={10}
        maxZoom={14}
        zoomControl={false}
        scrollWheelZoom={false}
        className="urbanpilot-leaflet h-[540px] w-full"
      >
        <ZoomControl position="bottomright" />

        <TileLayer
          attribution="&copy; OpenStreetMap contributors &copy; CARTO"
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {corridors.map((path, index) => (
          <Polyline
            key={`corridor-${index}`}
            positions={path}
            pathOptions={{
              color: index === 0 ? "#38bdf8" : "#a78bfa",
              weight: 3,
              opacity: 0.34,
              lineCap: "round",
              lineJoin: "round",
              dashArray: "8 10",
            }}
          />
        ))}

        {hotspots.map((spot, index) => {
          const styles = getToneStyles(spot.tone);

          return (
            <Fragment key={`${spot.id}-${index}`}>
              <CircleMarker
                center={spot.position}
                radius={22}
                pathOptions={styles.glow}
              />

              <CircleMarker
                center={spot.position}
                radius={10}
                pathOptions={styles.core}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                  <div className="min-w-[180px]">
                    <div className="text-sm font-semibold text-slate-900">
                      {spot.name}
                    </div>

                    <div className="mt-1 text-xs text-slate-600">
                      {spot.label}
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                        Индекс
                      </span>
                      <span className="text-sm font-semibold text-slate-900">
                        {spot.metric}
                      </span>
                    </div>
                  </div>
                </Tooltip>
              </CircleMarker>
            </Fragment>
          );
        })}
      </MapContainer>

      <div className="pointer-events-none absolute inset-0 z-[500]">
        <div className="flex h-full flex-col justify-between p-4 md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="pointer-events-auto max-w-[340px] rounded-[22px] border border-white/10 bg-slate-950/82 px-4 py-3 backdrop-blur-xl">
              <div className="text-[11px] uppercase tracking-[0.18em] text-cyan-200">
                Городской слой
              </div>
              <div className="mt-2 text-lg font-semibold tracking-tight text-white">
                Пространственный мониторинг города
              </div>
              <div className="mt-2 text-sm leading-6 text-slate-300">
                Точки показывают зоны внимания, а линии — основные коридоры
                городской нагрузки.
              </div>
            </div>

            <div className="pointer-events-auto grid grid-cols-2 gap-2">
              <div className="rounded-[20px] border border-white/10 bg-slate-950/82 px-4 py-3 backdrop-blur-xl">
                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                  Точки внимания
                </div>
                <div className="mt-2 text-2xl font-semibold tracking-tight text-white">
                  6
                </div>
              </div>

              <div className="rounded-[20px] border border-white/10 bg-slate-950/82 px-4 py-3 backdrop-blur-xl">
                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                  Коридоры
                </div>
                <div className="mt-2 text-2xl font-semibold tracking-tight text-white">
                  2
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="pointer-events-auto flex flex-wrap gap-2">
              {(["high", "medium", "low"] as Tone[]).map((tone) => {
                const styles = getToneStyles(tone);

                return (
                  <div
                    key={tone}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium backdrop-blur-xl ${styles.pill}`}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: styles.line }}
                    />
                    {toneLabel(tone)}
                  </div>
                );
              })}
            </div>

            <div className="pointer-events-auto grid gap-2 sm:grid-cols-3">
              <div className="rounded-[20px] border border-white/10 bg-slate-950/82 px-4 py-3 backdrop-blur-xl">
                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                  Транспорт
                </div>
                <div className="mt-2 text-lg font-semibold text-white">86</div>
              </div>

              <div className="rounded-[20px] border border-white/10 bg-slate-950/82 px-4 py-3 backdrop-blur-xl">
                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                  Экология
                </div>
                <div className="mt-2 text-lg font-semibold text-white">72</div>
              </div>

              <div className="rounded-[20px] border border-white/10 bg-slate-950/82 px-4 py-3 backdrop-blur-xl">
                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                  Инфраструктура
                </div>
                <div className="mt-2 text-lg font-semibold text-white">58</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .urbanpilot-leaflet {
          background: #0b1120;
        }

        .urbanpilot-leaflet .leaflet-tile {
          filter: saturate(0.92) brightness(0.88) contrast(1.08);
        }

        .urbanpilot-leaflet .leaflet-control-zoom {
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 12px 40px rgba(2, 6, 23, 0.28);
        }

        .urbanpilot-leaflet .leaflet-control-zoom a {
          background: rgba(2, 6, 23, 0.84);
          color: white;
          border: none;
          width: 40px;
          height: 40px;
          line-height: 40px;
          backdrop-filter: blur(14px);
        }

        .urbanpilot-leaflet .leaflet-control-zoom a:hover {
          background: rgba(15, 23, 42, 0.94);
        }

        .urbanpilot-leaflet .leaflet-control-attribution {
          background: rgba(2, 6, 23, 0.68);
          color: rgba(226, 232, 240, 0.72);
          border-top-left-radius: 10px;
          backdrop-filter: blur(10px);
        }

        .urbanpilot-leaflet .leaflet-control-attribution a {
          color: rgba(186, 230, 253, 0.88);
        }

        .urbanpilot-leaflet .leaflet-tooltip {
          border: 1px solid rgba(255, 255, 255, 0.9);
          border-radius: 16px;
          padding: 10px 12px;
          background: rgba(255, 255, 255, 0.96);
          box-shadow: 0 16px 40px rgba(2, 6, 23, 0.22);
        }

        .urbanpilot-leaflet .leaflet-tooltip-top:before {
          border-top-color: rgba(255, 255, 255, 0.96);
        }
      `}</style>
    </div>
  );
}