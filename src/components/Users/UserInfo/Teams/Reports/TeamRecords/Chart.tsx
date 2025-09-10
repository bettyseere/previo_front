import { ReactNode } from "react";
import Chart from "../../../../../Commons/Chart";

interface Props {
    action_btn?: ReactNode,
    data: any[]
}

export default function TeamDataChart({action_btn, data}: Props) {
  return (
    <div className="p-4">
      {/* Athlete comparison with date filtering */}
      <Chart
        data={data}
        filterableAttributes={["activity", "measurement", "athlete"]}
        valueKey="results"
        // yAxisLabel="Results"
        hasDates={false} // ← Enable date filtering
        xKey="athlete"  // ← Still group by athlete for categorical display
        action_btn={action_btn}
        displayName="Performance Results"
      />
    </div>
  );
}