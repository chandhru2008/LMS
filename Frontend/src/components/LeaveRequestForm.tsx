import { useEffect, useState } from "react";
import 'react-datepicker/dist/react-datepicker.css';
import type { IleaveBalanceDeatils } from "../types";

function LeaveRequestForm() {
  const [formData, setFormData] = useState({
    leaveTypeName: "",
    fromDate: "",
    toDate: "",
    reason: "",
  });
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [leaveBalance, setLeaveBalance] = useState([]);
  const [totalDays, setTotalDays] = useState<number | null>(null);

  useEffect(() => {
    async function fetchLeaveBalances() {
      try {
        const response = await fetch("http://localhost:3001/leave-balances", {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const result = await response.json();
          setLeaveBalance(result);
          console.log(result)
        } else {
          console.log("Failed to fetch leave balances");
        }
      } catch (e) {
        console.log("Error in fetching leave balances:", e);
      }
    }

    fetchLeaveBalances();
  }, []);

  useEffect(() => {
    if (formData.fromDate && formData.toDate) {
      const days = calculateBusinessDays(formData.fromDate, formData.toDate);
      setTotalDays(days);
    } else {
      setTotalDays(null);
    }
  }, [formData.fromDate, formData.toDate]);

  const calculateBusinessDays = (start: string, end: string): number => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    let count = 0;

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const day = d.getDay();
      if (day !== 0 && day !== 6) {
        count++;
      }
    }

    return count;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.leaveTypeName) newErrors.leaveType = "Leave type is required.";
    if (!formData.fromDate) newErrors.fromDate = "From date is required.";
    if (!formData.toDate) newErrors.toDate = "To date is required.";
    if (formData.reason.trim().length < 5)
      newErrors.reason = "Reason must be at least 5 characters.";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/create-leave-request", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leaveTypeName: formData.leaveTypeName,
          fromDate: formData.fromDate,
          toDate: formData.toDate,
          reason: formData.reason,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage("Leave request submitted successfully.");
        setFormData({ leaveTypeName: "", fromDate: "", toDate: "", reason: "" });
        setTotalDays(null);
      } else {
        setMessage(result.message);
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white shadow-xl rounded-2xl overflow-hidden p-6">
      <h2 className="text-xl font-bold mb-4 text-indigo-600">Leave Request</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block font-semibold mb-1">Leave Type <span className="text-red-500">*</span></label>
          <select
            name="leaveTypeName"
            value={formData.leaveTypeName}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">Select leave type</option>
            {leaveBalance.map((item : IleaveBalanceDeatils) => (
              <option key={item.type} value={item.type}>
                {item.type} ({item.remaining} days left)
              </option>
            ))}
          </select>
          {errors.leaveType && <p className="text-red-500 text-sm mt-1">{errors.leaveType}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1">From Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              name="fromDate"
              min={new Date().toISOString().split("T")[0]}
              value={formData.fromDate}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            {errors.fromDate && <p className="text-red-500 text-sm mt-1">{errors.fromDate}</p>}
          </div>
          <div>
            <label className="block font-semibold mb-1">To Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              name="toDate"
              min={new Date().toISOString().split("T")[0]}
              value={formData.toDate}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            {errors.toDate && <p className="text-red-500 text-sm mt-1">{errors.toDate}</p>}
          </div>
        </div>

        {totalDays !== null && (
          <div className="text-sm text-indigo-600 font-medium">
            Total leave days: {totalDays}
          </div>
        )}

        <div>
          <label className="block font-semibold mb-1">Reason <span className="text-red-500">*</span></label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            rows={4}
            className="w-full p-2 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Provide a reason for leave..."
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>{formData.reason.length} characters (min 5)</span>
            {errors.reason && <span className="text-red-500">{errors.reason}</span>}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {loading ? "Submitting..." : "Submit Leave Request"}
        </button>

        {message && (
          <p className={`text-center font-medium mt-3 ${message.includes("success") ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}

export default LeaveRequestForm;
