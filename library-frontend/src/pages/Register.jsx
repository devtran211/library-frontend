import { useState } from "react";
import { register } from "../services/auth";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
   const [form, setForm] = useState({
      name: "",
      email: "",
      phone: "",
      password: ""
   });

   const navigate = useNavigate();

   const handleChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value });
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      try {
         await register(form);
         navigate("/login");
      } catch (err) {
         alert(err.response?.data?.message);
      }
   };

   return (
      <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f')] bg-cover bg-center">
         <div className="backdrop-blur-md bg-white/80 p-8 rounded-2xl shadow-2xl w-[380px] animate-fadeIn">

            <h2 className="text-2xl font-bold text-center mb-2">Create Account</h2>
            <p className="text-gray-500 text-center mb-6">
               Sign up to manage your library
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">

               <input
                  name="name"
                  placeholder="Full Name"
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
               />

               <input
                  name="email"
                  placeholder="Email"
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
               />

               <input
                  name="phone"
                  placeholder="Phone"
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
                  Sign Up
               </button>
            </form>

            <p className="text-center text-sm mt-4">
               Đã có tài khoản?{" "}
               <Link to="/login" className="text-blue-600 font-medium">
                  Đăng nhập
               </Link>
            </p>
         </div>
      </div>
   );
}