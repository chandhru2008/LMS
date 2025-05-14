import { useEffect, useState } from "react";

// Define TypeScript interface for each leave balance object
interface LeaveBalance {
  type: string;
  used: number;
  remaining: number;
}

function LeaveBalances() {
  const [data, setData] = useState<LeaveBalance[]>([]);

  useEffect(() => {
    async function fetchLeaveBalances(): Promise<void> {
      try {
        const response = await fetch("http://localhost:3001/leave-balances", {
          method: 'GET',
          credentials: 'include',
        });
        if (response.ok) {
          const result = await response.json();
          setData(result.leaveBalance); // Ensure response shape is: { leaveBalance: [...] }
        } else {
          console.log("Something went wrong");
        }
      } catch (e) {
        console.log("Error:", e);
      }
    }

    fetchLeaveBalances();
  }, []);

  const calculatePercentage = (used: number, remaining: number): number => {
    const total = used + remaining;
    return total === 0 ? 0 : Math.round((remaining / total) * 100);
  };

  return (
    <div className="w-full py-10 bg-gray-50 min-h-[80%]">
      <h1 className="text-3xl font-bold text-center mb-10">Leave Balances</h1>
      <div className="flex flex-wrap gap-6 justify-center">
        {data.length === 0 ? (
          <div className="text-center text-gray-500">No leave balances found.</div>
        ) : (
          data.map((lb, index) => {
            const percentage = calculatePercentage(lb.used, lb.remaining);
            return (
              <div
                key={index}
                className="bg-white shadow-lg rounded-xl p-6 w-100 text-center border"
              >
                <h2 className="text-lg font-semibold mb-2">{lb.type}</h2>
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="#e5e7eb"
                      strokeWidth="10"
                      fill="none"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="#10b981"
                      strokeWidth="10"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${
                        2 * Math.PI * 40 * (1 - percentage / 100)
                      }`}
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                    {percentage}%
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p><strong>Used:</strong> {lb.used}</p>
                  <p><strong>Remaining:</strong> {lb.remaining}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default LeaveBalances;
