import { ReactNode } from "react";
import Chart from "../../../../../Commons/Chart";

interface Props {
  action_btn?: ReactNode;
  data: any[];
}

export default function TeamDataChart({ action_btn, data }: Props) {
  // Helpers
  const safeNumber = (v: any): number | undefined => {
    const n = typeof v === "string" ? parseFloat(v) : Number(v);
    return Number.isFinite(n) ? n : undefined;
  };

  const roundNum = (n: number, digits = 3): number => {
    // toFixed returns a string — convert back to number so Chart gets numbers
    return Number(n.toFixed(digits));
  };

  // Transform data so each "rsi", "pat", "power" (and computed jh) becomes its own row
  const clean_data = () => {
    return data.flatMap((item) => {
      const { rsi, pat, power, ct, ft, fd, ...rest } = item;
      const out: any[] = [];

      // Build a converted base object (keeps rest fields like athlete, activity, etc.)
      const base = { ...rest };

      // convert ct/ft/fd to /1000 and round if present (stored on base so measurements include them)
      const ctN = safeNumber(ct);
      if (ctN !== undefined) {
        base.results = roundNum(ctN / 1000)
        // base.measurement = "Ct"
      };

      const ftN = safeNumber(ft);
      if (ftN !== undefined) {
        const ftVal = roundNum(ftN / 1000);
        console.log(ftVal)

        // Push FT row
        out.push({ ...base, results: roundNum(ftVal), measurement: "ft" });

        // Compute JH from FT and push JH row
        const jh = 4.9 * Math.pow(0.5 * (ftN / 1000), 2);
        out.push({ ...base, results: roundNum(jh), measurement: "jh" });
      }

      const fdN = safeNumber(fd);
      if (fdN !== undefined) {
        base.results = roundNum(fdN / 1000);
        // base.measurement = "Fd"
      }

      // rsi / pat / power -> new rows (guarded with safeNumber and proper rounding)
      const rsiN = safeNumber(rsi);
      if (rsiN !== undefined) out.push({ ...base, results: roundNum(rsiN), measurement: "rsi" });

      const patN = safeNumber(pat);
      if (patN !== undefined) out.push({ ...base, results: roundNum(patN), measurement: "Wpeak/Kg" });

      const powerN = safeNumber(power);
      if (powerN !== undefined) out.push({ ...base, results: roundNum(powerN), measurement: "PaTpeak" });

      // If nothing was derived, keep the converted base object as-is
      if (out.length === 0) {
        out.push(base);
      }

      return out;
    });
  };

  const transformed = clean_data();

  return (
    <div className="p-4">
      {/* Athlete comparison with date filtering */}
      <Chart
        data={transformed}
        filterableAttributes={["activity", "measurement", "athlete"]}
        valueKey="results"
        hasDates={false} // ← no date filtering
        xKey="athlete" // ← group by athlete
        action_btn={action_btn}
        displayName="Performance"
        defaultSelection={{
          activity: "first",
          measurement: "first",
          athlete: "all",
        }}
      />
    </div>
  );
}
