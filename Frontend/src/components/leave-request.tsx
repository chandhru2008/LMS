import { useState, type FormEvent } from "react";

function LeaveRequestForm() {
  const [formData, setFormData] = useState({
    leaveType: "",
    fromDate: "",
    toDate: "",
    reason: ""
  });

  const [message, setMessage] = useState("");

  const handleChange = (e :any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e : any) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch("http://localhost:3001/leave-request", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (response.ok) {
        setMessage("Leave request submitted successfully.");
        setFormData({ leaveType: "", fromDate: "", toDate: "", reason: "" });
      } else {
        setMessage(result?.error || "Failed to submit request.");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Something went wrong.");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Submit Leave Request</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Leave Type</label>
          <input
            type="text"
            name="leaveType"
            value={formData.leaveType}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-400"
            placeholder="e.g. Sick Leave"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">From Date</label>
          <input
            type="date"
            name="fromDate"
            value={formData.fromDate}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-400"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">To Date</label>
          <input
            type="date"
            name="toDate"
            value={formData.toDate}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-400"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Reason</label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-400"
            rows={3}
            placeholder="Write your reason here..."
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition"
        >
          Submit
        </button>
      </form>
      {message && (
        <p className="mt-4 text-center text-sm text-green-600">{message}</p>
      )}
    </div>
  );
}

export default LeaveRequestForm;
