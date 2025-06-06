import { useEffect, useState } from "react";
import type { ILeaveHistoryItem, ILeaveType } from "../types";
import { calculateWorkDays } from "../date-util";

function LeaveHistory() {
  const [data, setData] = useState<ILeaveHistoryItem[]>([]);
  const [filteredData, setFilteredData] = useState<ILeaveHistoryItem[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<ILeaveType[]>([]);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    async function fetchLeaveHistory() {
      try {
        const [leaveRes, typeRes] = await Promise.all([
          fetch("https://lms-zwod.onrender.com/leave-requests/my", {
            method: "GET",
            credentials: "include",
          }),
          fetch("https://lms-zwod.onrender.com/leave-types/eligibility", {
            method: "GET",
            credentials: "include",
          }),
        ]);

        if (leaveRes.ok && typeRes.ok) {
          const leaveResult = await leaveRes.json();
          const typeResult = await typeRes.json();
          const leaveRequests = (leaveResult.leaveRequest || []).map((item: ILeaveHistoryItem) => ({
            ...item,
            workDays: calculateWorkDays(item.start_date, item.end_date)
          }));


          setData(leaveRequests || []);
          setLeaveTypes(typeResult || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false)
      }
    }

    fetchLeaveHistory();
  }, []);

  useEffect(() => {
    let result = [...data];

    // Apply filters
    result = result.filter((item) => {
      const matchType = selectedType === "all" || item.leaveType.name === selectedType;
      const matchStatus = selectedStatus === "all" || item.status === selectedStatus;
      const matchSearch =
        search === "" ||
        JSON.stringify(item).toLowerCase().includes(search.toLowerCase());

      return matchType && matchStatus && matchSearch;
    });

    // Apply sorting
    if (sortConfig !== null) {
      result.sort((a, b) => {
        let aValue, bValue;

        if (sortConfig.key === 'dates') {
          aValue = new Date(a.start_date).getTime();
          bValue = new Date(b.start_date).getTime();
        } else if (sortConfig.key === 'leaveType') {
          aValue = a.leaveType.name;
          bValue = b.leaveType.name;
        } else {
          aValue = a[sortConfig.key as keyof ILeaveHistoryItem];
          bValue = b[sortConfig.key as keyof ILeaveHistoryItem];
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredData(result);
  }, [search, selectedType, selectedStatus, data, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };

  const statusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-gray-200 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (startDate.toDateString() === endDate.toDateString()) {
      return startDate.toLocaleDateString();
    }

    return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  };

  if (loading) {
    return (<div className="flex justify-center items-center py-10">
      <svg
        className="animate-spin h-8 w-8 text-indigo-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        ></path>
      </svg>
      <span className="ml-3 text-indigo-600 font-semibold">Loading...</span>
    </div>)
  }

  return (
    <div className="mt-8 mx-auto px-4 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Leave History</h2>
        <div className="text-sm text-gray-500">
          Showing {filteredData.length} of {data.length} records
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              id="search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search records..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700 mb-1">
              Leave Type
            </label>
            <select
              id="leaveType"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Types</option>
              {leaveTypes.map((type) => (
                <option key={type.id} value={type.name}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearch("");
                setSelectedType("all");
                setSelectedStatus("all");
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md transition-colors duration-200"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredData.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No leave records found. Try adjusting your filters.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('leaveType')}
                >
                  <div className="flex items-center">
                    Leave Type {getSortIcon('leaveType')}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('dates')}
                >
                  <div className="flex items-center">
                    Dates {getSortIcon('dates')}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('status')}
                >
                  <div className="flex items-center">
                    Status {getSortIcon('status')}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('createdAt')}
                >
                  <div className="flex items-center">
                    Requested On {getSortIcon('createdAt')}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((item) => (
                <>
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.leaveType.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDateRange(item.start_date, item.end_date)}</div>
                      <div className="text-sm text-gray-500">
                        {item.workDays} day{item.workDays !== 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${statusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        {expandedId === item.id ? 'Hide Details' : 'View Details'}
                      </button>
                    </td>
                  </tr>
                  {expandedId === item.id && (
                    <tr className="bg-gray-50">
                      <td colSpan={5} className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                            <p className="text-sm text-gray-800 bg-white p-3 rounded border border-gray-200">
                              {item.description || "No description provided"}
                            </p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Approval Trail</h3>
                            {item.approvals.length === 0 ? (
                              <p className="text-sm text-gray-500">No approval records</p>
                            ) : (
                              <div className="space-y-3">
                                {item.approvals.map((approval) => (
                                  <div key={approval.id} className="bg-white p-3 rounded border border-gray-200">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <p className="text-sm font-medium text-gray-800">
                                          Level {approval.level} ({approval.approverRole})
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                          {approval.approver
                                            ? `${approval.approver.name} (${approval.approver.role})`
                                            : "Approver not assigned"}
                                        </p>
                                      </div>
                                      <span className={`text-xs px-2 py-1 rounded-full ${statusColor(approval.status)}`}>
                                        {approval.status}
                                      </span>
                                    </div>
                                    {approval.remarks && (
                                      <p className="text-xs text-gray-600 mt-2">
                                        <span className="font-medium">Remarks:</span> {approval.remarks}
                                      </p>
                                    )}
                                    {approval.approvedAt && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        {new Date(approval.approvedAt).toLocaleString()}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default LeaveHistory;