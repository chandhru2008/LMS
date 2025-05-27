import { useEffect, useState } from "react";

interface LeaveBalance {
  total: number;
  type: string;
  used: number;
  remaining: number;
}

const leaveTypeColors: Record<string, string> = {
  "Annual Leave": "#3b82f6",
  "Sick Leave": "#10b981",
  "Maternity Leave": "#8b5cf6",
  "Paternity Leave": "#ec4899",
  "Unpaid Leave": "#f59e0b",
  "Other Leave": "#64748b",
};

function LeaveBalances() {
  const [data, setData] = useState<LeaveBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaveBalances(): Promise<void> {
      try {
        setIsLoading(true);
        const response = await fetch("http://localhost:3001/leave-balances", {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const result = await response.json();
          setData(result);
          
        } else {
          console.log("Failed to fetch leave balances");
        }
      } catch (e) {
        console.log("Error:", e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLeaveBalances();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-opacity-40 flex items-center justify-center z-50 mx-[100px]">
        <div className="bg-white rounded-xl p-6 shadow-xl flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading leave balances...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center z-50 w-[100%] h-[80%] mx-auto my-[30px]">
      <div className="bg-white rounded-2xl shadow-2xl w-[100%] max-w-3xl max-h-[85vh] overflow-y-auto p-8">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800">Leave Balances</h2>
          <p className="text-gray-500 text-sm">Overview of your available and used leaves</p>
        </div>

        {data.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No leave balances available
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6 ">
            {data.map((balance, index) => {
              const color = leaveTypeColors[balance.type] || "#3b82f6";
              return (
                <div
                  key={index}
                  className="border border-gray-100 rounded-lg shadow-sm p-5 transition hover:shadow-md"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold" style={{ color }}>
                      {balance.type}
                    </h3>
                    <span
                      className="text-xs font-semibold px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: `${color}20`,
                        color: color,
                      }}
                    >
                      {balance.remaining} left
                    </span>
                  </div>
                  <div className="text-sm space-y-1 text-gray-600 mt-4">
                    <div className="flex justify-between">
                      <span>Total Allowed</span>
                      <span className="font-medium text-gray-800">{balance.total} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Used</span>
                      <span className="font-medium text-gray-800">{balance.used} days</span>
                    </div>
                  </div>
                  <div className="mt-4 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${(balance.used / balance.total) * 100}%`,
                        backgroundColor: color,
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default LeaveBalances;
