import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

function Header() {
    const navigate = useNavigate();
    const [isLogin, setIsLogIn] = useState(false);
    const [data, setData] = useState<{ employeeName: string; role: string } | null>(null);

    useEffect(() => {
        async function checkAuth() {
            try {
                const response = await fetch("https://lms-zwod.onrender.com/check-auth", {
                    method: "GET",
                    credentials: "include",
                });

                const result = await response.json();

                if (!response.ok) {
                    setIsLogIn(false);
                    if (result.message === "Invalid or expired token") {
                        console.log(result.message);
                    }
                } else {
                    setIsLogIn(true);
                    setData(result);
                }
            } catch (err) {
                console.error("Auth check failed:", err);
                setIsLogIn(false);
            }
        }

        checkAuth();
    }, []);

        const handleLogout = async () => {
        try {
            const response = await fetch('https://lms-zwod.onrender.com/log-out', {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                setIsLogIn(false);
                navigate("/login");
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <div className="w-full h-[80px] bg-[#005a9c] shadow-md flex items-center justify-between">
            <div className="w-[70%] h-[100%] flex justify-between items-center mx-auto">
                <h1 className="text-xl font-bold text-white">Leave Management System</h1>
                {isLogin && data ? (
                    <div className="flex items-center space-x-4 text-gray-700 font-medium">
                        <div className="text-white">
                            <div>{data.employeeName}</div>
                            <div className="text-sm">{data.role}</div>
                        </div>

                        <button className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600" onClick={()=>handleLogout()}>
                            Log out
                        </button>
                    </div>
                ) : (
                    <div className="px-[15px] py-[8px] bg-[#ffffff] text-blue-500 rounded-[5px] hover:cursor-pointer" onClick={()=>navigate('/login')}>Login</div>
                )}</div>

        </div>
    );
}

export default Header;
