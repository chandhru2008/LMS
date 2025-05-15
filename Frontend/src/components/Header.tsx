import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function Header() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const [role, setRole] = useState('');

    // Check auth status on load
    useEffect(() => {
        async function checkAuth() {
            try {
                const res = await fetch("http://localhost:3001/check-auth", {
                    method: "GET",
                    credentials: "include",
                });
                if (res.ok) {
                    setIsLoggedIn(true);
                    console.log(res);
                    const data = await res.json();
                    console.log(data)
                    setRole(data.role);
                    console.log(data.role)
                } else {
                    console.log("Something went wrong");
                }
            } catch (err) {
                console.error("Auth check failed:", err);
                setIsLoggedIn(false);
            }
        }

        checkAuth();
    }, []);

    function navigateToLoginPage() {
        navigate("/login");
    }

    function navigateToLeaveRequestpage() {
        navigate("/leave-request");
    }

    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:3001/log-out', {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                setIsLoggedIn(false);
                navigate("/login");
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    function navigateToLeaveRequestsPage(role: string) {
        if (role == "Manager") {
            navigate("/manager/leaves");
        } else if (role == "HR") {
            navigate("/hr/leaves");
        } else if (role == "Director") {
            navigate("/director/leaves");
        } else {
            console.log("Role is miss mar=tching");
        }
    }

    return (
        <div className="w-screen h-[80px] bg-gray-100 shadow-md">
            <div className="w-[85%] h-full mx-auto flex justify-between items-center">
                <h1>LMS</h1>
                <div className='flex items-center gap-[10px]'>
                    {!isLoggedIn ? (
                        <button
                            onClick={navigateToLoginPage}
                            className="px-[15px] py-[10px] rounded-[10px] bg-blue-500 text-white text-[18px] font-semibold hover:cursor-pointer"
                        >
                            Login
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={navigateToLeaveRequestpage}
                                className="px-[15px] py-[10px] rounded-[10px] bg-green-500 text-white text-[18px] font-semibold hover:cursor-pointer"
                            >
                                Request a Leave
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-[15px] py-[10px] rounded-[10px] bg-red-500 text-white text-[18px] font-semibold hover:cursor-pointer"
                            >
                                Logout
                            </button>
                            {
                                ["Manager", "HR", "Director"].includes(role) && (
                                    <button
                                        className="px-[15px] py-[10px] rounded-[10px] bg-blue-500 text-white text-[18px] font-semibold hover:cursor-pointer"
                                        onClick={() => navigateToLeaveRequestsPage(role)}
                                    >
                                        Leave requests
                                    </button>
                                )
                            }

                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Header;
