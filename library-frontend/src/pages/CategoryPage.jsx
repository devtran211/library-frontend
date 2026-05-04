import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

const API_BASE = "http://localhost:3000";

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [keyword, setKeyword] = useState("");
  const [sortDir, setSortDir] = useState("asc");

  const token = localStorage.getItem("token");
  const searchDebounceRef = useRef(null);

  // 📌 GET ALL
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      // search là local filter (backend không thấy có endpoint search categories)
      // nên chỉ debounce để UI mượt
    }, 250);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [keyword]);

  // 📌 CREATE / UPDATE
  const handleSubmit = async () => {
    try {
      const trimmed = name.trim();
      if (!trimmed) {
        alert("Vui lòng nhập tên thể loại");
        return;
      }

      if (editing) {
        await axios.put(
          `${API_BASE}/api/categories/edit/${editing._id}`,
          { name: trimmed },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${API_BASE}/api/categories/create`,
          { name: trimmed },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setOpenModal(false);
      setName("");
      setEditing(null);
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Lỗi!");
    }
  };

  // 📌 DELETE
  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa?")) return;

    try {
      await axios.delete(`${API_BASE}/api/categories/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const displayedCategories = useMemo(() => {
    const q = normalizeText(keyword);

    const filtered = q
      ? categories.filter((c) => normalizeText(c.name).includes(q))
      : categories;

    return [...filtered].sort((a, b) => {
      const cmp = String(a.name || "").localeCompare(String(b.name || ""), "vi", {
        sensitivity: "base"
      });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [categories, keyword, sortDir]);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setOpenModal(true);
  };

  return (
    <Layout>
      <div className="rounded-2xl overflow-hidden shadow bg-white">
        {/* TOP BAR */}
        <div className="p-6 bg-gradient-to-r from-blue-900 to-blue-700 text-white">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-sm/6 text-blue-100">Library • Librarian</div>
              <h2 className="text-2xl font-bold">Quản lý thể loại</h2>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Tìm thể loại..."
                  className="w-full sm:w-[360px] rounded-xl bg-white/95 text-gray-900 placeholder:text-gray-500 px-4 py-2 pr-10 outline-none ring-1 ring-white/30 focus:ring-2 focus:ring-white"
                />
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  ⌕
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setSortDir((d) => (d === "asc" ? "desc" : "asc"))
                  }
                  className="rounded-xl bg-white/10 px-3 py-2 ring-1 ring-white/20 hover:bg-white/15"
                  title="Đảo chiều sắp xếp"
                >
                  {sortDir === "asc" ? "A→Z" : "Z→A"}
                </button>

                <button
                  onClick={openCreate}
                  className="rounded-xl bg-white text-blue-900 font-semibold px-4 py-2 hover:bg-blue-50"
                >
                  + Thêm thể loại
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-blue-100">
            <div>
              Hiển thị <b className="text-white">{displayedCategories.length}</b>{" "}
              thể loại
            </div>
            <button
              onClick={() => fetchCategories()}
              className="rounded-lg px-3 py-1.5 bg-white/10 ring-1 ring-white/20 hover:bg-white/15"
            >
              Làm mới
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6">
          {loading ? (
            <div className="text-gray-500">Đang tải dữ liệu...</div>
          ) : displayedCategories.length === 0 ? (
            <div className="rounded-xl border border-dashed p-10 text-center text-gray-500">
              Không có thể loại nào phù hợp.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="p-4 text-sm font-semibold text-gray-700">
                      Tên thể loại
                    </th>
                    <th className="p-4 text-sm font-semibold text-gray-700 w-[220px]">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {displayedCategories.map((c) => (
                    <tr key={c._id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-semibold text-gray-900">
                          {c.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {c._id}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditing(c);
                              setName(c.name);
                              setOpenModal(true);
                            }}
                            className="flex-1 rounded-xl bg-amber-500 text-white px-3 py-2 text-sm font-semibold hover:bg-amber-600"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(c._id)}
                            className="flex-1 rounded-xl bg-rose-600 text-white px-3 py-2 text-sm font-semibold hover:bg-rose-700"
                          >
                            Xóa
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

      {/* MODAL */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] flex justify-center items-center p-4 z-50">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-900 to-blue-700 text-white flex items-center justify-between">
              <div>
                <div className="text-xs text-blue-100">
                  {editing ? "Cập nhật thông tin" : "Tạo mới"}
                </div>
                <div className="text-lg font-bold">
                  {editing ? "Sửa thể loại" : "Thêm thể loại"}
                </div>
              </div>
              <button
                onClick={() => {
                  setOpenModal(false);
                  setEditing(null);
                  setName("");
                }}
                className="rounded-lg px-3 py-1.5 bg-white/10 ring-1 ring-white/20 hover:bg-white/15"
              >
                Đóng
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Tên thể loại
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Khoa học viễn tưởng..."
                  className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setOpenModal(false);
                    setEditing(null);
                    setName("");
                  }}
                  className="rounded-xl px-4 py-2 bg-gray-100 text-gray-800 hover:bg-gray-200 font-semibold"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmit}
                  className="rounded-xl px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 font-semibold"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}