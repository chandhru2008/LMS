import { useNavigate } from 'react-router-dom';
function Header(){

    const navigate = useNavigate();
   function navigateToLoginPage(){
    navigate("/login")
   }
    return(
        <div className="w-screen h-[80px]">
            <div className="w-[85%] h-[100%] mx-auto flex justify-between items-center">
                <button onClick={navigateToLoginPage} className="px-[15px] py-[10px] rounded-[10px] bg-blue-500 text-white text-[18px] font-semibold hover:cursor-pointer">Login</button>
            </div>
        </div>
    )
}
export default Header