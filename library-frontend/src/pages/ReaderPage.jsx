import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

export default function ReaderPage() {
   const [readers, setReaders] = useState([]);
   const [showModal, setShowModal] = useState(false);
   const [editingUser, setEditingUser] = useState(null);

   const [form, setForm] = useState({
      name: "",
      email: "",
      phone: ""
   });

   const token = localStorage.getItem("token");

   // ================= FETCH =================
   const fetchReaders = async () => {
      try {
         const res = await axios.get(
            "http://localhost:3000/users/readers",
            {
               headers: {
                  Authorization: `Bearer ${token}`
               }
            }
         );

         setReaders(res.data.data);
      } catch (err) {
         console.error(err);
         alert("Không thể tải danh sách reader");
      }
   };

   useEffect(() => {
      fetchReaders();
   }, []);

   // ================= EDIT =================
   const handleEdit = (user) => {
      setEditingUser(user);
      setForm({
         name: user.name,
         email: user.email,
         phone: user.phone
      });
      setShowModal(true);
   };

   // ================= UPDATE =================
   const handleSubmit = async (e) => {
      e.preventDefault();

      try {
         await axios.put(
            `http://localhost:3000/users/edit-reader/${editingUser._id}`,
            form,
            {
               headers: {
                  Authorization: `Bearer ${token}`
               }
            }
         );

         setShowModal(false);
         setEditingUser(null);
         setForm({ name: "", email: "", phone: "" });

         fetchReaders();
      } catch (err) {
         alert(err.response?.data?.message);
      }
   };

   // ================= DELETE =================
   const handleDelete = async (id) => {
      if (!window.confirm("Bạn chắc chắn muốn xoá?")) return;

      try {
         await axios.delete(
            `http://localhost:3000/users/delete-reader/${id}`,
            {
               headers: {
                  Authorization: `Bearer ${token}`
               }
            }
         );

         fetchReaders();
      } catch (err) {
         alert("Xoá thất bại");
      }
   };

   return (
      <Layout>
         <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-4">
               Danh sách bạn đọc
            </h2>

            {/* TABLE */}
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
                  {readers.map((r) => (
                     <tr key={r._id}>
                        <td className="p-2 border">{r.name}</td>
                        <td className="p-2 border">{r.email}</td>
                        <td className="p-2 border">{r.phone}</td>

                        <td className="p-2 border">
                        <div className="flex justify-center gap-2">
                            <button
                                onClick={() => handleEdit(r)}
                                className="bg-yellow-400 px-2 py-1 rounded"
                            >
                                Sửa
                            </button>

                            <button
                                onClick={() => handleDelete(r._id)}
                                className="bg-red-500 text-white px-2 py-1 rounded"
                            >
                                Xoá
                            </button>
                        </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {/* ================= MODAL UPDATE ================= */}
         {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
               <div className="bg-white p-6 rounded w-96">
                  <h3 className="text-lg font-bold mb-4">
                     Cập nhật bạn đọc
                  </h3>

                  <form onSubmit={handleSubmit} className="space-y-3">
                     <input
                        placeholder="Name"
                        value={form.name}
                        onChange={(e) =>
                           setForm({ ...form, name: e.target.value })
                        }
                        className="w-full border p-2 rounded"
                     />

                     <input
                        placeholder="Email"
                        value={form.email}
                        onChange={(e) =>
                           setForm({ ...form, email: e.target.value })
                        }
                        className="w-full border p-2 rounded"
                     />

                     <input
                        placeholder="Phone"
                        value={form.phone}
                        onChange={(e) =>
                           setForm({ ...form, phone: e.target.value })
                        }
                        className="w-full border p-2 rounded"
                     />

                     <div className="flex justify-end gap-2">
                        <button
                           type="button"
                           onClick={() => setShowModal(false)}
                           className="px-3 py-1 border rounded"
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