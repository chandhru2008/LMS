import { useEffect } from "react";

function LeaveBalances() {
    useEffect(() => {
        async function fetchLeaveBalances() {
            try {
                const response = await fetch("http://localhost:3001/leave-balances", {
                    method: 'Get',
                    credentials: 'include'
                });
                if (response.ok) {
                    const data = await response.json();
                    console.log(data);
                } else {
                    console.log("Something went wrong");
                }
            } catch (e) {
                console.log("Error : ", e);
            }

        }

        fetchLeaveBalances();
    }, []);

    return (< div className="w-[100%] h-[500px]">
        <div className="flex flex-wrap w-[80%] h-[100%] mx-auto ">

        </div>
    </div>)
}

export default LeaveBalances;