import { useEffect } from "react";

function LeaveType(): any {
    useEffect(() => {
        async function handleLeaveType() {

            const respond = await fetch("https://leave-management-app-2025.netlify.app/leave-type", {
                method: "GET"
            });
            if (respond.ok) {
                console.log(respond);
                const data = await respond.json();
                console.log(data);
            } else {
                console.log("There is som rror")
            }
        }

        handleLeaveType();
    },[]);


}

export default LeaveType;