import React, { ReactNode, useMemo, useState } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer
} from "recharts";

type Granularity = "auto" | "hourly" | "2hourly" | "daily" | "weekly" | "monthly" | "annual";

interface ChartProps<T> {
  data: T[];
  filterableAttributes: (keyof T)[];
  yAxisLabel?: string;  
  valueKey: keyof T; 
  displayName?: string;
  action_btn?: ReactNode;
  xKey?: keyof T;       // default "date"
  defaultFilter?: Record<string, string>;
  hasDates?: boolean;
  defaultChartType?: "bar" | "line";
}

function pad(n: number) { return String(n).padStart(2, "0"); }
function startOfDay(d: Date) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate()+n); return x; }

// ISO week helpers
function startOfISOWeek(d: Date) {
  const x = startOfDay(d);
  const day = (x.getDay() || 7);
  if (day !== 1) x.setDate(x.getDate() - (day - 1));
  return x;
}
function getISOWeekNumber(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1));
  const weekNo = Math.ceil((((date as any) - (yearStart as any)) / 86400000 + 1) / 7);
  return { year: date.getUTCFullYear(), week: weekNo };
}

// Label buckets
function bucketStart(date: Date, mode: Exclude<Granularity,"auto">): Date {
  const d = new Date(date);
  switch (mode) {
    case "hourly": d.setMinutes(0,0,0); return d;
    case "2hourly": d.setHours(Math.floor(d.getHours()/2)*2,0,0,0); return d;
    case "daily": return startOfDay(d);
    case "weekly": return startOfISOWeek(d);
    case "monthly": return new Date(d.getFullYear(), d.getMonth(), 1);
    case "annual": return new Date(d.getFullYear(), 0, 1);
  }
}

function formatLabel(date: Date, mode: Exclude<Granularity,"auto">) {
  const y = String(date.getFullYear()).slice(-2);
  const m = pad(date.getMonth()+1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());

  switch (mode) {
    case "hourly":  return `${hh}`;
    case "2hourly": return `${hh}`;
    case "daily":   return `${dd}-${m}-${y}`;
    case "weekly":  { const {year, week} = getISOWeekNumber(date); return `${week}/${year}`; }
    case "monthly": return `${m}-${y}`;
    case "annual":  return `${date.getFullYear()}`;
  }
}

export default function Chart<T extends Record<string, any>>({
  data,
  filterableAttributes,
  valueKey,
  yAxisLabel,
  displayName = "Value",
  xKey = "date",
  action_btn,
  defaultFilter = {},
  hasDates = false,
  defaultChartType = "bar",
}: ChartProps<T>) {
  const [chartType, setChartType] = useState<"bar"|"line">(defaultChartType);
  const [filters, setFilters] = useState<Record<string,string>>(defaultFilter);
  const [from, setFrom] = useState<string>(() => new Date().toISOString().slice(0,10));
  const [to, setTo]     = useState<string>(() => new Date().toISOString().slice(0,10));
  const [granularity, setGranularity] = useState<Granularity>("auto");
  const [preset, setPreset] = useState<string>("");

  // Apply presets
  function applyPreset(p: string) {
    const today = new Date();
    const yest = addDays(today, -1);
    if (p === "today") { setFrom(today.toISOString().slice(0,10)); setTo(today.toISOString().slice(0,10)); }
    if (p === "yesterday") { const s = yest.toISOString().slice(0,10); setFrom(s); setTo(s); }
    if (p === "thisWeek") { const s = startOfISOWeek(today); setFrom(s.toISOString().slice(0,10)); setTo(today.toISOString().slice(0,10)); }
    if (p === "lastWeek") {
      const end = addDays(startOfISOWeek(today), -1);
      const start = addDays(end, -6);
      setFrom(start.toISOString().slice(0,10)); setTo(end.toISOString().slice(0,10));
    }
    if (p === "thisMonth") {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      setFrom(start.toISOString().slice(0,10)); setTo(today.toISOString().slice(0,10));
    }
    if (p === "lastMonth") {
      const start = new Date(today.getFullYear(), today.getMonth()-1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      setFrom(start.toISOString().slice(0,10)); setTo(end.toISOString().slice(0,10));
    }
    setPreset(p);
  }

  // Determine effective mode
  const mode: Exclude<Granularity,"auto"> = useMemo(() => {
    if (!hasDates) return "daily";
    if (granularity !== "auto") return granularity as Exclude<Granularity,"auto">;
    const start = new Date(from), end = new Date(to);
    const diffMs = +startOfDay(addDays(end,1)) - +startOfDay(start);
    const diffDays = diffMs / 86400000;
    if (diffDays <= 1) return "hourly";
    if (diffDays <= 2) return "2hourly";
    if (diffDays <= 7) return "daily";
    if (diffDays <= 60) return "weekly";
    if (diffDays <= 365) return "monthly";
    return "annual";
  }, [granularity, hasDates, from, to]);

  // Filter rows
  const filtered = useMemo(() => {
    let rows = data;
    for (const key of Object.keys(filters)) {
      const val = filters[key];
      if (val) rows = rows.filter(r => String(r[key]) === val);
    }
    if (hasDates) {
      const s = new Date(from); const e = new Date(to);
      rows = rows.filter(r => {
        const d = r[xKey] ? new Date(r[xKey]) : null;
        return d ? d >= startOfDay(s) && d <= addDays(startOfDay(e), 1) : true;
      });
    }
    return rows;
  }, [data, filters, hasDates, from, to, xKey]);

  // Group by X
  const grouped = useMemo(() => {
    if (!hasDates) {
      const map: Record<string, { label: string; value: number }> = {};
      for (const row of filtered) {
        const label = String(row[xKey]);
        if (!map[label]) map[label] = { label, value: 0 };
        map[label].value += Number(row[valueKey]) || 0;
      }
      return Object.values(map).sort((a,b) => a.label.localeCompare(b.label));
    }
    const map: Record<number, { ts: number; label: string; value: number }> = {};
    for (const row of filtered) {
      const d = row[xKey] ? new Date(row[xKey]) : null;
      if (!d) continue;
      const start = bucketStart(d, mode);
      const ts = +start;
      if (!map[ts]) map[ts] = { ts, label: formatLabel(start, mode), value: 0 };
      map[ts].value += Number(row[valueKey]) || 0;
    }
    return Object.values(map).sort((a,b) => a.ts - b.ts);
  }, [filtered, valueKey, xKey, hasDates, mode]);

  // Build filter options
  const optionsByAttr = useMemo(() => {
    const o: Record<string, string[]> = {};
    for (const attr of filterableAttributes) {
      const set = new Set<string>();
      data.forEach(d => d[attr] != null && set.add(String(d[attr])));
      o[String(attr)] = Array.from(set).sort();
    }
    return o;
  }, [data, filterableAttributes]);

  return (
    <div className="w-full rounded border-gray-200 shadow-sm bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-end gap-2 md:gap-3">
        {/* Chart type */}
        <div className="flex items-center gap-1">
          <label className="text-xs text-gray-600">Type</label>
          <select
            className="ml-1 rounded border border-gray-300 px-2 py-1 text-sm"
            value={chartType}
            onChange={(e)=>setChartType(e.target.value as any)}
          >
            <option value="bar">Bar</option>
            <option value="line">Line</option>
          </select>
        </div>

        {/* Filters */}
        {filterableAttributes.map((attr) => (
          <div key={String(attr)} className="flex items-center gap-1">
            <select
              className="rounded border border-gray-300 px-2 py-1 text-sm"
              value={filters[String(attr)] ?? ""}
              onChange={(e)=>setFilters(f=>({...f, [String(attr)]: e.target.value}))}
            >
              <option value="">Select {String(attr)}</option>
              {optionsByAttr[String(attr)].map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
        ))}

        {/* Date controls */}
        {hasDates && (
          <>
            <input type="date" className="rounded border px-2 py-1 text-sm"
              value={from} onChange={(e)=>setFrom(e.target.value)} />
            <input type="date" className="rounded border px-2 py-1 text-sm"
              value={to} min={from} onChange={(e)=>setTo(e.target.value)} />

            {/* Presets */}
            <select
              className="rounded border border-gray-300 px-2 py-1 text-sm hidden"
              value={preset}
              onChange={(e)=>applyPreset(e.target.value)}
            >
              <option value="">—</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="thisWeek">This Week</option>
              <option value="lastWeek">Last Week</option>
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
            </select>

            {/* Granularity */}
            <select
              className="rounded border border-gray-300 px-2 py-1 text-sm"
              value={granularity}
              onChange={(e)=>setGranularity(e.target.value as Granularity)}
            >
              <option value="auto">Auto</option>
              <option value="hourly">Hourly</option>
              <option value="2hourly">2-hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="annual">Annual</option>
            </select>
          </>
        )}

        <div className="flex gap-4 items-center ml-auto">
          <button
            className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50"
            onClick={()=>{
              setFilters({});
              const s = new Date().toISOString().slice(0,10);
              setFrom(s); setTo(s); setGranularity("auto"); setPreset("");
            }}
          >
            Reset
          </button>
          {action_btn && action_btn}
        </div>
      </div>

      {/* Chart */}
      <div className="mt-3 h-[420px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "line" ? (
            <LineChart data={grouped}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" angle={-30} textAnchor="end" interval={0} height={70} tick={{ fontSize: 12, fontWeight: 500 }}  />
              <YAxis label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}  tick={{ fontSize: 12, fontWeight: 500 }}  />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" name={displayName} stroke="#3A8DC7" />
            </LineChart>
          ) : (
            <BarChart data={grouped}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" angle={-30} textAnchor="end" interval={0} height={70} tick={{ fontSize: 12, fontWeight: 500 }}  />
              <YAxis label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}  tick={{ fontSize: 12, fontWeight: 500 }}  />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name={displayName} fill="#3A8DC7" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
