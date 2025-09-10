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
  displayName?: string;           // Custom display name for the value
  action_btn?: ReactNode;         // numeric Y axis
  xKey?: keyof T;                 // X axis (default "date")
  defaultFilter?: Record<string, string>;
  hasDates?: boolean;             // whether data has a "date" field
  defaultChartType?: "bar" | "line";
}

function pad(n: number) { return String(n).padStart(2, "0"); }
function startOfDay(d: Date) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate()+n); return x; }

// ISO week helpers
function startOfISOWeek(d: Date) {
  const x = startOfDay(d);
  const day = (x.getDay() || 7); // Mon=1..Sun=7
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
  const y = date.getFullYear(), m = pad(date.getMonth()+1), dd = pad(date.getDate()), hh = pad(date.getHours());
  switch (mode) {
    case "hourly":  return `${y}-${m}-${dd} ${hh}:00`;
    case "2hourly": return `${y}-${m}-${dd} ${hh}:00–${pad((date.getHours()+2)%24)}:00`;
    case "daily":   return `${y}-${m}-${dd}`;
    case "weekly":  { const {year, week} = getISOWeekNumber(date); return `${year}-W${week}`; }
    case "monthly": return `${y}-${m}`;
    case "annual":  return `${y}`;
  }
}

export default function Chart<T extends Record<string, any>>({
  data,
  filterableAttributes,
  valueKey,
  yAxisLabel,
  displayName = "Value", // Default display name
  xKey = "date",
  action_btn,
  defaultFilter = {},
  hasDates = false,
  defaultChartType = "bar",
}: ChartProps<T>) {
  const [chartType, setChartType] = useState<"bar"|"line">(defaultChartType);
  const [filters, setFilters] = useState<Record<string,string>>(defaultFilter);
  const [from, setFrom] = useState<string>(() => new Date().toISOString().slice(0,10)); // YYYY-MM-DD
  const [to, setTo]     = useState<string>(() => new Date().toISOString().slice(0,10));
  const [granularity, setGranularity] = useState<Granularity>("auto");

  // Presets (native select) — keeps UI minimal
  function applyPreset(preset: string) {
    const today = new Date();
    const yest = addDays(today, -1);
    if (preset === "today") { setFrom(today.toISOString().slice(0,10)); setTo(from => today.toISOString().slice(0,10)); }
    if (preset === "yesterday") { const s = yest.toISOString().slice(0,10); setFrom(s); setTo(s); }
    if (preset === "thisWeek") { const s = startOfISOWeek(today); setFrom(s.toISOString().slice(0,10)); setTo(today.toISOString().slice(0,10)); }
    if (preset === "lastWeek") {
      const end = addDays(startOfISOWeek(today), -1);
      const start = addDays(end, -6);
      setFrom(start.toISOString().slice(0,10)); setTo(end.toISOString().slice(0,10));
    }
    if (preset === "thisMonth") {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      setFrom(start.toISOString().slice(0,10)); setTo(today.toISOString().slice(0,10));
    }
    if (preset === "lastMonth") {
      const start = new Date(today.getFullYear(), today.getMonth()-1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      setFrom(start.toISOString().slice(0,10)); setTo(end.toISOString().slice(0,10));
    }
  }

  // Determine effective mode
  const mode: Exclude<Granularity,"auto"> = useMemo(() => {
    if (!hasDates || xKey !== "date") return "daily"; // categorical default
    if (granularity !== "auto") return granularity as Exclude<Granularity,"auto">;
    const start = new Date(from), end = new Date(to);
    const diffMs = +startOfDay(addDays(end,1)) - +startOfDay(start); // inclusive days span
    const diffDays = diffMs / 86400000;
    if (diffDays <= 1) return "hourly";
    if (diffDays <= 2) return "2hourly";
    if (diffDays <= 7) return "daily";
    if (diffDays <= 60) return "weekly";
    if (diffDays <= 365) return "monthly";
    return "annual";
  }, [granularity, hasDates, xKey, from, to]);

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
        const d = r.date ? new Date(r.date) : null;
        return d ? d >= startOfDay(s) && d <= addDays(startOfDay(e), 1) : true;
      });
    }
    return rows;
  }, [data, filters, hasDates, from, to]);

  // Group
  const grouped = useMemo(() => {
    if (!hasDates || xKey !== "date") {
      // Categorical X — group by xKey
      const map: Record<string, { label: string; value: number }> = {};
      for (const row of filtered) {
        const label = String(row[xKey]);
        if (!map[label]) map[label] = { label, value: 0 };
        map[label].value += Number(row[valueKey]) || 0;
      }
      return Object.values(map).sort((a,b) => a.label.localeCompare(b.label));
    }
    // Time X — group by bucket start timestamp
    const map: Record<number, { ts: number; label: string; value: number }> = {};
    for (const row of filtered) {
      const d = row.date ? new Date(row.date) : null;
      if (!d) continue;
      const start = bucketStart(d, mode);
      const ts = +start;
      if (!map[ts]) map[ts] = { ts, label: formatLabel(start, mode), value: 0 };
      map[ts].value += Number(row[valueKey]) || 0;
    }
    return Object.values(map).sort((a,b) => a.ts - b.ts);
  }, [filtered, valueKey, xKey, hasDates, mode]);

  // Build options for native selects
  const optionsByAttr = useMemo(() => {
    const o: Record<string, string[]> = {};
    for (const attr of filterableAttributes) {
      const set = new Set<string>();
      data.forEach(d => d[attr] != null && set.add(String(d[attr])));
      o[String(attr)] = Array.from(set).sort();
    }
    return o;
  }, [data, filterableAttributes]);

  // ==== UI ====
  return (
    <div className="w-full rounded border border-gray-200 p-3 md:p-4 shadow-sm bg-white">
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
            <label className="text-xs text-gray-600 capitalize">{String(attr)}</label>
            <select
              className="rounded border border-gray-300 px-2 py-1 text-sm"
              value={filters[String(attr)] ?? ""}
              onChange={(e)=>setFilters(f=>({...f, [String(attr)]: e.target.value}))}
            >
              <option value="">All {String(attr)}</option>
              {optionsByAttr[String(attr)].map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
        ))}

        {/* Date controls (only if dates) */}
        {hasDates && (
          <>
            <div className="flex items-center gap-1">
              <label className="text-xs text-gray-600">From</label>
              <input
                type="date"
                className="rounded border border-gray-300 px-2 py-1 text-sm"
                value={from}
                onChange={(e)=>setFrom(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1">
              <label className="text-xs text-gray-600">To</label>
              <input
                type="date"
                className="rounded border border-gray-300 px-2 py-1 text-sm"
                value={to}
                min={from}
                onChange={(e)=>setTo(e.target.value)}
              />
            </div>

            {/* Presets */}
            <div className="flex items-center gap-1">
              <label className="text-xs text-gray-600">Preset</label>
              <select
                className="rounded border border-gray-300 px-2 py-1 text-sm"
                defaultValue=""
                onChange={(e)=>{ if (e.target.value) { applyPreset(e.target.value); e.currentTarget.value = ""; } }}
              >
                <option value="">—</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="thisWeek">This Week</option>
                <option value="lastWeek">Last Week</option>
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
              </select>
            </div>

            {/* Granularity */}
            {xKey === "date" && (
              <div className="flex items-center gap-1">
                <label className="text-xs text-gray-600">Group</label>
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
              </div>
            )}
          </>
        )}


        {/*  */}
        <div className="flex gap-4 items-center ml-auto">
        {action_btn && action_btn}
        
        {/* Reset */}
        <button
          className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50"
          onClick={()=>{
            setFilters({});
            const s = new Date().toISOString().slice(0,10);
            setFrom(s); setTo(s); setGranularity("auto");
          }}
        >
          Reset
        </button>
        </div>
      </div>

      {/* Mode info */}
      {hasDates && xKey === "date" && (
        <div className="mt-2 text-xs text-gray-500">Mode: <span className="font-medium">{mode}</span></div>
      )}

      {/* Chart */}
      <div className="mt-3 h-[420px] h-sm:h-[500px] h-md:h-[720px] h-lg:h-[1000px] h-xl:h-[1250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "line" ? (
            <LineChart data={grouped}>
              <CartesianGrid strokeDasharray="3 3" />
              <YAxis label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" name={displayName} />
            </LineChart>
          ) : (
            <BarChart data={grouped}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" angle={-45} textAnchor="end" interval={0} height={70} tick={{ fontSize: 12, fill: "#374151"}} />
              <YAxis label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name={displayName} fill="#3A8DC7" activeBar={{ fill: "#3A8DC7" }} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}