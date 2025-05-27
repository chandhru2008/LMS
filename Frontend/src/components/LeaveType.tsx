import { useEffect } from "react";

function LeaveType(): any {
    useEffect(() => {
        async function handleLeaveType() {

            const respond = await fetch("http://localhost:3001/leave-type", {
                method: "GET"
            });
            if (respond.ok) {
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