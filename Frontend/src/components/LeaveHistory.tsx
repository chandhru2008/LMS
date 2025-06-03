import { useEffect, useState } from "react";
import type { IApproval, ILeaveHistoryItem } from "../types";
import { useAuth } from "./AuthProvider";

function LeaveHistory() {
  const [data, setData] = useState<ILeaveHistoryItem[]>([]);
  const { authData } = useAuth();

  useEffect(() => {
    async function fetchLeaveHistory() {
      try {
        const response = await fetch("http://localhost:3001/leave-requests/my", {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const result = await response.json();
          setData(result.leaveRequest || []);
        }
      } catch (error) {
        console.error("Error fetching leave history:", error);
      }
    }

    fetchLeaveHistory();
  }, []);

  const role = authData?.role || "";

  const getApprovalStatus = (approvals: IApproval[], forRole: string) => {
    let lookupRole = forRole;

    if (role === "hr" && forRole === "manager") {
      lookupRole = "hr_manager";
    }

    const approval = approvals.find(
      (a) => a.approverRole.toLowerCase() === lookupRole.toLowerCase()
    );
    return approval ? approval.status : "N/A";
  };

  const shouldShowManager = role === "employee" || role === "hr";
  const shouldShowHR = role === "employee" || role === "manager";
  const shouldShowDirector = role !== "director";

  async function handleCancel(id: string) {
    const confirmCancel = window.confirm("Are you sure you want to cancel this leave request?");
    if (!confirmCancel) return;

    try {
      const res = await fetch(`http://localhost:3001/leave-requests/cancel`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, decision: "Cancelled" }),
      });

      if (res.ok) {
        setData((prev) => prev.filter((item) => item.id !== id));
      } else {
        console.log("Failed to cancel leave request.");
      }
    } catch (err) {
      console.error("Cancel error:", err);
    }
  }

  return (
    <div className="mt-10 mx-auto">
      <h2 className="text-3xl font-semibold text-center my-4">Leave History</h2>
      <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200 w-full max-w-6xl mx-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-semibold">Leave Type</th>
              <th className="text-left px-6 py-3 text-sm font-semibold">From</th>
              <th className="text-left px-6 py-3 text-sm font-semibold">To</th>
              <th className="text-left px-6 py-3 text-sm font-semibold">Status</th>
              {shouldShowManager && (
                <th className="text-left px-6 py-3 text-sm font-semibold">
                  {role === "hr" ? "HR Manager Approval" : "Manager Approval"}
                </th>
              )}
              {shouldShowHR && (
                <th className="text-left px-6 py-3 text-sm font-semibold">HR Approval</th>
              )}
              {shouldShowDirector && (
                <th className="text-left px-6 py-3 text-sm font-semibold">Director Approval</th>
              )}
              <th className="text-left px-6 py-3 text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item) => {
                const isCancelable =
                  item.status === "Pending" &&
                  new Date(item.start_date).getTime() > new Date().getTime();

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-50 ${
                      item.status === "Rejected"
                        ? "bg-red-100"
                        : item.status === "Approved"
                        ? "bg-green-100"
                        : ""
                    }`}
                  >
                    <td className="px-6 py-4 border-b">{item.leaveType.name}</td>
                    <td className="px-6 py-4 border-b">
                      {new Date(item.start_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 border-b">
                      {new Date(item.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 border-b font-medium">
                      <span
                        className={
                          item.status === "Approved"
                            ? "text-green-700"
                            : item.status === "Rejected"
                            ? "text-red-700"
                            : "text-yellow-700"
                        }
                      >
                        {item.status}
                      </span>
                    </td>

                    {shouldShowManager && (
                      <td className="px-6 py-4 border-b">
                        {getApprovalStatus(item.approvals, "manager")}
                      </td>
                    )}
                    {shouldShowHR && (
                      <td className="px-6 py-4 border-b">
                        {getApprovalStatus(item.approvals, "hr")}
                      </td>
                    )}
                    {shouldShowDirector && (
                      <td className="px-6 py-4 border-b">
                        {getApprovalStatus(item.approvals, "director")}
                      </td>
                    )}
                    <td className="px-6 py-4 border-b">
                      {isCancelable ? (
                        <button
                          onClick={() => handleCancel(item.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Cancel
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">N/A</span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="text-center px-6 py-4 text-gray-500">
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
