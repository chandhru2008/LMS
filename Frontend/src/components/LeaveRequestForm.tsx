import { useEffect, useState } from "react";
import 'react-datepicker/dist/react-datepicker.css';
import type { IleaveBalanceDeatils } from "../types";

function LeaveRequestForm() {
  const [leaveForm, setLeaveForm] = useState({
    leaveTypeName: "",
    fromDate: "",
    toDate: "",
    reason: "",
  });
  const [submitMessage, setSubmitMessage] = useState("");
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leaveBalances, setLeaveBalances] = useState<IleaveBalanceDeatils[]>([]);
  const [requestedDays, setRequestedDays] = useState<number | null>(null);
  const [isBalanceLoading, setIsBalanceLoading] = useState<boolean>(true);
  const [hasSufficientLeaveBalance, setHasSufficientLeaveBalance] = useState<boolean>(true);

  const leaveIcons: Record<string, string> = {
    "Casual Leave": "🏖️",
    "Sick Leave": "🤒",
    "Earned Leave": "💰",
    "Maternity Leave": "🤰",
    "Paternity Leave": "👨‍🍼",
    "Bereavement Leave": "😢",
    "Compensatory Leave": "🔄",
  };

  // Fetch leave balances
  useEffect(() => {
    async function fetchBalances() {
      try {
        setIsBalanceLoading(true);
        const res = await fetch("https://lms-zwod.onrender.com/leave-balances", {
          method: "GET",
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setLeaveBalances(data);
        } else {
          setSubmitMessage("Failed to fetch leave balances.");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setSubmitMessage("Error fetching leave balances.");
      } finally {
        setIsBalanceLoading(false);
      }
    }

    fetchBalances();
  }, []);

  // Recalculate requested days and check balance
  useEffect(() => {
    const { fromDate, toDate, leaveTypeName } = leaveForm;
    if (fromDate && toDate) {
      const days = calculateBusinessDays(fromDate, toDate);
      setRequestedDays(days);
      updateLeaveBalanceAvailability(leaveTypeName, days);
    } else {
      setRequestedDays(null);
    }
  }, [leaveForm.fromDate, leaveForm.toDate, leaveForm.leaveTypeName, leaveBalances]);

  const calculateBusinessDays = (start: string, end: string): number => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    let count = 0;
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const day = d.getDay();
      if (day !== 0 && day !== 6) count++;
    }
    return count;
  };

  const updateLeaveBalanceAvailability = (type: string, days: number) => {
    const balance = leaveBalances.find((b) => b.type === type);
    if (!balance) {
      setHasSufficientLeaveBalance(true);
      return;
    }
    setHasSufficientLeaveBalance(balance.remaining >= days);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setLeaveForm((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
    setSubmitMessage("");
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    const selected = leaveBalances.find(b => b.type === leaveForm.leaveTypeName);

    if (!leaveForm.leaveTypeName) errors.leaveTypeName = "Leave type is required.";
    else if (selected && selected.remaining === 0) errors.leaveTypeName = "No remaining balance.";

    if (!leaveForm.fromDate) errors.fromDate = "Start date is required.";
    if (!leaveForm.toDate) errors.toDate = "End date is required.";

    if (leaveForm.fromDate && leaveForm.toDate && new Date(leaveForm.toDate) < new Date(leaveForm.fromDate)) {
      errors.toDate = "End date cannot be before start date.";
    }

    if (leaveForm.reason.trim().length < 5) {
      errors.reason = "Reason must be at least 5 characters.";
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitMessage("");

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (!hasSufficientLeaveBalance) {
      setSubmitMessage("Insufficient leave balance.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("https://lms-zwod.onrender.com/create-leave-request", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leaveForm),
      });

      const result = await res.json();

      if (res.ok) {
        setSubmitMessage("Leave request submitted successfully.");
        setLeaveForm({ leaveTypeName: "", fromDate: "", toDate: "", reason: "" });
        setRequestedDays(null);
      } else {
        setSubmitMessage(result.message || "Failed to submit leave request.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      setSubmitMessage("An error occurred while submitting the request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-8">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <h1 className="text-2xl font-bold">Request Time Off</h1>
          <p className="opacity-90">Submit your leave request for approval</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Leave Type Dropdown & Cards */}
          <div>
            <label htmlFor="leaveTypeName" className="block text-sm font-medium text-gray-700 mb-2">
              Leave Type <span className="text-red-500">*</span>
            </label>

            {isBalanceLoading ? (
              <div className="animate-pulse h-10 bg-gray-200 rounded-md"></div>
            ) : (
              <>
                <select
                  id="leaveTypeName"
                  name="leaveTypeName"
                  value={leaveForm.leaveTypeName}
                  onChange={handleChange}
                  className={`block w-full border rounded-md p-2 ${formErrors.leaveTypeName ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select leave type</option>
                  {leaveBalances.map((leave) => (
                    <option key={leave.type} value={leave.type} disabled={leave.remaining === 0}>
                      {leave.type} {leave.remaining === 0 ? "(No balance)" : ""}
                    </option>
                  ))}
                </select>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                  {leaveBalances.map((leave) => (
                    <div
                      key={leave.type}
                      onClick={() => leave.remaining > 0 && setLeaveForm(prev => ({ ...prev, leaveTypeName: leave.type }))}
                      className={`p-3 rounded-lg border transition-all ${
                        leave.remaining === 0
                          ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                          : leaveForm.leaveTypeName === leave.type
                            ? "border-indigo-500 bg-indigo-50 cursor-pointer"
                            : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{leaveIcons[leave.type] || "📅"}</span>
                        <div>
                          <p className="text-sm font-medium">{leave.type}</p>
                                                   <p className="text-xs">{leave.remaining} days left</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {formErrors.leaveTypeName && (
              <p className="mt-2 text-sm text-red-600">{formErrors.leaveTypeName}</p>
            )}
          </div>

          {/* Date Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="fromDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                id="fromDate"
                type="date"
                name="fromDate"
                min={new Date().toISOString().split("T")[0]}
                value={leaveForm.fromDate}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 border ${
                  formErrors.fromDate ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
                }`}
              />
              {formErrors.fromDate && (
                <p className="mt-2 text-sm text-red-600">{formErrors.fromDate}</p>
              )}
            </div>
            <div>
              <label htmlFor="toDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                id="toDate"
                type="date"
                name="toDate"
                min={leaveForm.fromDate || new Date().toISOString().split("T")[0]}
                value={leaveForm.toDate}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 border ${
                  formErrors.toDate ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
                }`}
              />
              {formErrors.toDate && (
                <p className="mt-2 text-sm text-red-600">{formErrors.toDate}</p>
              )}
            </div>
          </div>

          {/* Requested Days Summary */}
          {requestedDays !== null && leaveForm.leaveTypeName && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 mr-3">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-800">
                    {requestedDays} business day{requestedDays !== 1 ? 's' : ''} of {leaveForm.leaveTypeName} requested
                  </h3>
                  <p className="text-sm text-blue-700">
                    {(() => {
                      const current = leaveBalances.find(b => b.type === leaveForm.leaveTypeName);
                      if (!current) return null;
                      const after = current.remaining - requestedDays;
                      return `${after >= 0 ? after : 0} day${after !== 1 ? 's' : ''} remaining after this request`;
                    })()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Reason Field */}
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Leave <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reason"
              name="reason"
              rows={4}
              maxLength={200}
              value={leaveForm.reason}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 border ${
                formErrors.reason ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
              }`}
              placeholder="Please provide details about your leave request..."
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">{leaveForm.reason.length}/200 characters</span>
              {formErrors.reason && <span className="text-xs text-red-600">{formErrors.reason}</span>}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !hasSufficientLeaveBalance}
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isSubmitting || !hasSufficientLeaveBalance
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </>
              ) : (
                "Submit Leave Request"
              )}
            </button>

            {/* Submit Message */}
            {submitMessage && (
              <p className={`mt-3 text-sm ${submitMessage.includes("successfully") ? "text-green-600" : "text-red-600"}`}>
                {submitMessage}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default LeaveRequestForm;
