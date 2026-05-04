import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

const API_BASE = "http://localhost:3000";

function normalizeText(value) {
   return String(value || "").trim().toLowerCase();
}

export default function ReaderPage() {
   const [readers, setReaders] = useState([]);
   const [loading, setLoading] = useState(false);
   const [showModal, setShowModal] = useState(false);
   const [editingUser, setEditingUser] = useState(null);
   const [keyword, setKeyword] = useState("");
   const [sortKey, setSortKey] = useState("name");
   const [sortDir, setSortDir] = useState("asc");

   const [form, setForm] = useState({
      name: "",
      email: "",
      phone: ""
   });

   const token = localStorage.getItem("token");

   // ================= FETCH =================
   const fetchReaders = async () => {
      try {
         setLoading(true);
         const res = await axios.get(
            `${API_BASE}/users/readers`,
            {
               headers: {
                  Authorization: `Bearer ${token}`
               }
            }
         );

         setReaders(res.data.data || []);
      } catch (err) {
         console.error(err);
         alert("Không thể tải danh sách reader");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchReaders();
   }, []);

   const displayedReaders = useMemo(() => {
      const q = normalizeText(keyword);

      const filtered = q
         ? readers.filter((r) => {
              const haystack = normalizeText(`${r.name} ${r.email} ${r.phone}`);
              return haystack.includes(q);
           })
         : readers;

      const sorted = [...filtered].sort((a, b) => {
         const av = a?.[sortKey] ?? "";
         const bv = b?.[sortKey] ?? "";
         const cmp = String(av).localeCompare(String(bv), "vi", { sensitivity: "base" });
         return sortDir === "asc" ? cmp : -cmp;
      });

      return sorted;
   }, [readers, keyword, sortKey, sortDir]);

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
         const trimmed = {
            name: form.name?.trim(),
            email: form.email?.trim(),
            phone: form.phone?.trim()
         };
         if (!trimmed.name || !trimmed.email || !trimmed.phone) {
            alert("Vui lòng nhập đầy đủ Name/Email/Phone");
            return;
         }

         await axios.put(
            `${API_BASE}/users/edit-reader/${editingUser._id}`,
            trimmed,
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
         alert(err.response?.data?.message || "Cập nhật thất bại");
      }
   };

   // ================= DELETE =================
   const handleDelete = async (id) => {
      if (!window.confirm("Bạn chắc chắn muốn xoá?")) return;

      try {
         await axios.delete(
            `${API_BASE}/users/delete-reader/${id}`,
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
         <div className="rounded-2xl overflow-hidden shadow bg-white">
            {/* TOP BAR */}
            <div className="p-6 bg-gradient-to-r from-blue-900 to-blue-700 text-white">
               <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                     <div className="text-sm/6 text-blue-100">Library • Librarian</div>
                     <h2 className="text-2xl font-bold">Quản lý người đọc</h2>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                     <div className="relative">
                        <input
                           value={keyword}
                           onChange={(e) => setKeyword(e.target.value)}
                           placeholder="Tìm theo tên, email, số điện thoại..."
                           className="w-full sm:w-[420px] rounded-xl bg-white/95 text-gray-900 placeholder:text-gray-500 px-4 py-2 pr-10 outline-none ring-1 ring-white/30 focus:ring-2 focus:ring-white"
                        />
                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                           ⌕
                        </div>
                     </div>

                     <div className="flex gap-2">
                        <select
                           value={sortKey}
                           onChange={(e) => setSortKey(e.target.value)}
                           className="rounded-xl bg-white/95 text-gray-900 px-3 py-2 outline-none ring-1 ring-white/30 focus:ring-2 focus:ring-white"
                        >
                           <option value="name">Sort: Name</option>
                           <option value="email">Sort: Email</option>
                           <option value="phone">Sort: Phone</option>
                        </select>

                        <button
                           onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
                           className="rounded-xl bg-white/10 px-3 py-2 ring-1 ring-white/20 hover:bg-white/15"
                           title="Đảo chiều sắp xếp"
                        >
                           {sortDir === "asc" ? "↑" : "↓"}
                        </button>

                        <button
                           onClick={() => fetchReaders()}
                           className="rounded-xl bg-white/10 px-4 py-2 ring-1 ring-white/20 hover:bg-white/15 font-semibold"
                        >
                           Làm mới
                        </button>
                     </div>
                  </div>
               </div>

               <div className="mt-4 text-sm text-blue-100">
                  Hiển thị <b className="text-white">{displayedReaders.length}</b> bạn đọc
               </div>
            </div>

            {/* CONTENT */}
            <div className="p-6">
               {loading ? (
                  <div className="text-gray-500">Đang tải dữ liệu...</div>
               ) : displayedReaders.length === 0 ? (
                  <div className="rounded-xl border border-dashed p-10 text-center text-gray-500">
                     Không có dữ liệu
                  </div>
               ) : (
                  <div className="overflow-hidden rounded-2xl border border-gray-200">
                     <table className="w-full">
                        <thead className="bg-gray-50">
                           <tr>
                              <th className="p-4 text-sm font-semibold text-gray-700">Name</th>
                              <th className="p-4 text-sm font-semibold text-gray-700">Email</th>
                              <th className="p-4 text-sm font-semibold text-gray-700">Phone</th>
                              <th className="p-4 text-sm font-semibold text-gray-700 w-[220px] text-center">
                                 Action
                              </th>
                           </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                           {displayedReaders.map((r) => (
                              <tr key={r._id} className="hover:bg-gray-50">
                                 <td className="p-4 font-semibold text-gray-900">{r.name}</td>
                                 <td className="p-4 text-gray-700">{r.email}</td>
                                 <td className="p-4 text-gray-700">{r.phone}</td>
                                 <td className="p-4">
                                    <div className="flex gap-2 justify-center">
                                       <button
                                          onClick={() => handleEdit(r)}
                                          className="flex-1 max-w-[96px] rounded-xl bg-amber-500 text-white px-3 py-2 text-sm font-semibold hover:bg-amber-600"
                                       >
                                          Sửa
                                       </button>

                                       <button
                                          onClick={() => handleDelete(r._id)}
                                          className="flex-1 max-w-[96px] rounded-xl bg-rose-600 text-white px-3 py-2 text-sm font-semibold hover:bg-rose-700"
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
               )}
            </div>
         </div>

         {/* ================= MODAL UPDATE ================= */}
         {showModal && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] flex justify-center items-center p-4 z-50">
               <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
                  <div className="px-6 py-4 bg-gradient-to-r from-blue-900 to-blue-700 text-white flex items-center justify-between">
                     <div>
                        <div className="text-xs text-blue-100">Cập nhật thông tin</div>
                        <div className="text-lg font-bold">Sửa bạn đọc</div>
                     </div>
                     <button
                        onClick={() => {
                           setShowModal(false);
                           setEditingUser(null);
                           setForm({ name: "", email: "", phone: "" });
                        }}
                        className="rounded-lg px-3 py-1.5 bg-white/10 ring-1 ring-white/20 hover:bg-white/15"
                     >
                        Đóng
                     </button>
                  </div>

                  <form onSubmit={handleSubmit} className="p-6 space-y-4">
                     <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Name</label>
                        <input
                           placeholder="Tên bạn đọc"
                           value={form.name}
                           onChange={(e) => setForm({ ...form, name: e.target.value })}
                           className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                     </div>

                     <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <input
                           placeholder="Email"
                           value={form.email}
                           onChange={(e) => setForm({ ...form, email: e.target.value })}
                           className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                     </div>

                     <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Phone</label>
                        <input
                           placeholder="Số điện thoại"
                           value={form.phone}
                           onChange={(e) => setForm({ ...form, phone: e.target.value })}
                           className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                     </div>

                     <div className="pt-2 flex items-center justify-end gap-2">
                        <button
                           type="button"
                           onClick={() => {
                              setShowModal(false);
                              setEditingUser(null);
                              setForm({ name: "", email: "", phone: "" });
                           }}
                           className="rounded-xl px-4 py-2 bg-gray-100 text-gray-800 hover:bg-gray-200 font-semibold"
                        >
                           Hủy
                        </button>

                        <button
                           type="submit"
                           className="rounded-xl px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 font-semibold"
                        >
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