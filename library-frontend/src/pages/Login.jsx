import { useState } from "react";
import { login } from "../services/auth";
import { redirectByRole } from "../utils/auth";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
   const [form, setForm] = useState({ email: "", password: "" });
   const navigate = useNavigate();

   const handleChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value });
   };

   const handleSubmit = async (e) => {
      e.preventDefault();

      try {
         const res = await login(form);

         const { token, user } = res.data.data;

         // lưu
         localStorage.setItem("token", token);
         localStorage.setItem("user", JSON.stringify(user));

         // redirect bằng helper
         navigate(redirectByRole(user.role));
 
      } catch (err) {
         alert(err.response?.data?.message);
      }
   };

   return (
      <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f')] bg-cover bg-center">
         <div className="backdrop-blur-md bg-white/80 p-8 rounded-2xl shadow-2xl w-[380px] animate-fadeIn">
            
            <h2 className="text-2xl font-bold text-center mb-2">Welcome Back</h2>
            <p className="text-gray-500 text-center mb-6">Login to your account</p>

            <form onSubmit={handleSubmit} className="space-y-4">

               <input
                  name="email"
                  placeholder="Email"
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
               />

               <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
               />

               <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition duration-300">
                  Login
               </button>
            </form>

            <p className="text-center text-sm mt-4">
               Chưa có tài khoản?{" "}
               <Link to="/register" className="text-blue-600 font-medium">
                  Đăng ký
               </Link>
            </p>
         </div>
      </div>
   );
}