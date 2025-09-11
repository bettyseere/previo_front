import { ReactNode } from "react";
import Chart from "../../../Commons/Chart";

interface Props {
    action_btn?: ReactNode,
    data: any[]
}

export default function UserDataChart({action_btn, data}: Props) {
  return (
    <div className="p-4">
      {/* Athlete comparison with date filtering */}
      <Chart
        data={data}
        filterableAttributes={["activity", "measurement"]}
        valueKey="results"
        // yAxisLabel="Results"
        hasDates={true} // ← Enable date filtering
        xKey="created_at"  // ← Still group by athlete for categorical display
        action_btn={action_btn}
        displayName="Performance"
         defaultSelection={{
          activity: "first",
          measurement: "first"
        }}
      />
    </div>
  );
}