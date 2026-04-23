import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

export default function LibrarianPage() {
   const [librarians, setLibrarians] = useState([]);
   const [showModal, setShowModal] = useState(false);
   const [editingUser, setEditingUser] = useState(null);

   const [form, setForm] = useState({
      name: "",
      email: "",
      phone: "",
      password: ""
   });

   const token = localStorage.getItem("token");

   const fetchLibrarians = async () => {
      const res = await axios.get("http://localhost:3000/users/librarians", {
         headers: { Authorization: `Bearer ${token}` }
      });
      setLibrarians(res.data.data);
   };

   useEffect(() => {
      fetchLibrarians();
   }, []);

   // ================= CREATE / UPDATE =================
   const handleSubmit = async (e) => {
      e.preventDefault();

      try {
         if (editingUser) {
            await axios.put(
               `http://localhost:3000/users/edit-librarian/${editingUser._id}`,
               form,
               { headers: { Authorization: `Bearer ${token}` } }
            );
         } else {
            await axios.post(
               "http://localhost:3000/users/create-librarian",
               form,
               { headers: { Authorization: `Bearer ${token}` } }
            );
         }

         setShowModal(false);
         setEditingUser(null);
         setForm({ name: "", email: "", phone: "", password: "" });

         fetchLibrarians();
      } catch (err) {
         alert(err.response?.data?.message);
      }
   };

   // ================= DELETE =================
   const handleDelete = async (id) => {
      if (!window.confirm("Bạn chắc chắn muốn xoá?")) return;

      await axios.delete(`http://localhost:3000/users/delete-librarian/${id}`, {
         headers: { Authorization: `Bearer ${token}` }
      });

      fetchLibrarians();
   };

   // ================= EDIT =================
   const handleEdit = (user) => {
      setEditingUser(user);
      setForm({
         name: user.name,
         email: user.email,
         phone: user.phone,
         password: ""
      });
      setShowModal(true);
   };

   return (
      <Layout>
         <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between mb-4">
               <h2 className="text-xl font-bold">Danh sách thủ thư</h2>

               <button
                  onClick={() => {
                     setEditingUser(null); // 👈 reset
                     setForm({ name: "", email: "", phone: "", password: "" });
                     setShowModal(true);
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
               >
                  + Thêm thủ thư
               </button>
            </div>

            <table className="w-full border">
               <thead className="bg-gray-200">
                  <tr>
                     <th className="p-2 border">Name</th>
                     <th className="p-2 border">Email</th>
                     <th className="p-2 border">Phone</th>
                     <th className="p-2 border">Action</th>
                  </tr>
               </thead>

               <tbody>
                  {librarians.map((lib) => (
                     <tr key={lib._id}>
                        <td className="p-2 border">{lib.name}</td>
                        <td className="p-2 border">{lib.email}</td>
                        <td className="p-2 border">{lib.phone}</td>

                        <td className="p-2 border text-center">
                           <button
                              onClick={() => handleEdit(lib)}
                              className="bg-yellow-400 px-2 py-1 rounded"
                           >
                              Sửa
                           </button>

                           <button
                              onClick={() => handleDelete(lib._id)}
                              className="bg-red-500 text-white px-2 py-1 rounded"
                           >
                              Xoá
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {/* ================= MODAL ================= */}
         {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
               <div className="bg-white p-6 rounded w-96">
                  <h3 className="text-lg font-bold mb-4">
                     {editingUser ? "Cập nhật" : "Thêm"} thủ thư
                  </h3>

                  <form onSubmit={handleSubmit} className="space-y-3">
                     <input
                        placeholder="Name"
                        value={form.name}
                        onChange={(e) =>
                           setForm({ ...form, name: e.target.value })
                        }
                        className="w-full border p-2"
                     />

                     <input
                        placeholder="Email"
                        value={form.email}
                        onChange={(e) =>
                           setForm({ ...form, email: e.target.value })
                        }
                        className="w-full border p-2"
                     />

                     <input
                        placeholder="Phone"
                        value={form.phone}
                        onChange={(e) =>
                           setForm({ ...form, phone: e.target.value })
                        }
                        className="w-full border p-2"
                     />

                     {!editingUser && (
                        <input
                           type="password"
                           placeholder="Password"
                           onChange={(e) =>
                              setForm({ ...form, password: e.target.value })
                           }
                           className="w-full border p-2"
                        />
                     )}

                     <div className="flex justify-end gap-2">
                        <button
                           type="button"
                           onClick={() => {
                              setShowModal(false);
                              setEditingUser(null); // 👈 reset
                              setForm({ name: "", email: "", phone: "", password: "" });
                           }}
                           className="px-3 py-1 border"
                        >
                           Huỷ
                        </button>

                        <button className="bg-blue-500 text-white px-3 py-1 rounded">
                           Lưu
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}
      </Layout>
   );
}