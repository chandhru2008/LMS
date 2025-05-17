import { useEffect, useState } from "react";

interface LeaveType {
  id: number;
  name: string;
  max_allowed_days: number;
}

interface LeaveHistoryItem {
  id: string;
  start_date: string;
  end_date: string;
  description: string;
  status: string;
  manager_approval: string;
  HR_approval: string;
  director_approval: string;
  leaveType: LeaveType;
}

function LeaveHistory() {
  const [data, setData] = useState<LeaveHistoryItem[]>([]);

  useEffect(() => {
    async function fetchLeaveHistory() {
      try {
        const response = await fetch("https://lms-zwod.onrender.com/leave-requests/my", {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const result = await response.json();
          setData(result.leaveRequest || []);
          console.log("Leave History:", result);
        }
      } catch (error) {
        console.error("Error fetching leave history:", error);
      }
    }

    fetchLeaveHistory();
  }, []);

  return (
    <div className="mt-10">
      <h2 className="text-3xl font-semibold text-center my-[15px]">Leave History</h2>
      <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200 w-[80%] mx-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-semibold">Leave Type</th>
              <th className="text-left px-6 py-3 text-sm font-semibold">From</th>
              <th className="text-left px-6 py-3 text-sm font-semibold">To</th>
              <th className="text-left px-6 py-3 text-sm font-semibold">Status</th>
              <th className="text-left px-6 py-3 text-sm font-semibold">Manager Approval</th>
              <th className="text-left px-6 py-3 text-sm font-semibold">HR Approval</th>
              <th className="text-left px-6 py-3 text-sm font-semibold">Director Approval</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:bg-gray-50 ${
                    item.status === "Rejected" ? "bg-red-100" : item.status === "Approved" ? "bg-green-100" : ""
                  }`}
                >
                  <td className="px-6 py-4 border-b">{item.leaveType.name}</td>
                  <td className="px-6 py-4 border-b">
                    {new Date(item.start_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 border-b">
                    {new Date(item.end_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 border-b">
                    <span
                      className={`font-medium ${
                        item.status === "Approved"
                          ? "text-green-700"
                          : item.status === "Rejected"
                          ? "text-red-700"
                          : "text-yellow-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 border-b">{item.manager_approval}</td>
                  <td className="px-6 py-4 border-b">{item.HR_approval}</td>
                  <td className="px-6 py-4 border-b">{item.director_approval}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center px-6 py-4 text-gray-500">
                  No leave history available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LeaveHistory;
