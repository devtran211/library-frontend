import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

const API_BASE = "http://localhost:3000";

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function compareValues(a, b) {
  const ax = a ?? "";
  const bx = b ?? "";
  if (typeof ax === "number" && typeof bx === "number") return ax - bx;
  return String(ax).localeCompare(String(bx), "vi", { sensitivity: "base" });
}

export default function BookPage() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [keyword, setKeyword] = useState("");
  const [sortKey, setSortKey] = useState("title");
  const [sortDir, setSortDir] = useState("asc");

  const [form, setForm] = useState({
    title: "",
    author: "",
    category_id: "",
    publisher: "",
    publish_year: "",
    available_quantity: "",
    shelf_location: "",
    image_url: "",
  });

  const searchDebounceRef = useRef(null);

  const resetForm = () => {
    setEditing(null);
    setForm({
      title: "",
      author: "",
      category_id: "",
      publisher: "",
      publish_year: "",
      available_quantity: "",
      shelf_location: "",
      image_url: "",
    });
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/book`);
      setBooks(res.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  const searchBooks = async (q) => {
    const trimmed = String(q || "").trim();
    if (!trimmed) return fetchBooks();

    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE}/api/book/search?keyword=${encodeURIComponent(trimmed)}`
      );

      // backend có thể trả { data: [...] } hoặc { data: { data: [...] } }
      const data =
        res.data?.data?.data || res.data?.data || res.data?.records || [];
      setBooks(Array.isArray(data) ? data : []);
    } catch (e) {
      // nếu backend chưa support search, fallback filter client-side (giữ list hiện tại)
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const res = await axios.get(`${API_BASE}/api/categories`);
    setCategories(res.data.data || []);
  };

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      searchBooks(keyword);
    }, 350);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [keyword]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (editing) {
        await axios.put(`${API_BASE}/api/book/update/${editing._id}`, form);
      } else {
        await axios.post(`${API_BASE}/api/book/create`, form);
      }

      setOpenModal(false);
      resetForm();
      await fetchBooks();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Lỗi!");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Xóa sách này?")) return;
    await axios.delete(`${API_BASE}/api/book/delete/${id}`);
    fetchBooks();
  };

  const displayedBooks = useMemo(() => {
    const q = normalizeText(keyword);

    const filtered = q
      ? books.filter((b) => {
          const haystack = normalizeText(
            `${b.title} ${b.author} ${b.publisher} ${b.category_id?.name} ${b.shelf_location}`
          );
          return haystack.includes(q);
        })
      : books;

    const sorted = [...filtered].sort((a, b) => {
      const av =
        sortKey === "category"
          ? a.category_id?.name
          : sortKey === "available_quantity"
          ? Number(a.available_quantity ?? 0)
          : a[sortKey];

      const bv =
        sortKey === "category"
          ? b.category_id?.name
          : sortKey === "available_quantity"
          ? Number(b.available_quantity ?? 0)
          : b[sortKey];

      const cmp = compareValues(av, bv);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return sorted;
  }, [books, keyword, sortKey, sortDir]);

  const sortOptions = [
    { value: "title", label: "Tên sách" },
    { value: "author", label: "Tác giả" },
    { value: "category", label: "Thể loại" },
    { value: "available_quantity", label: "Số lượng" },
    { value: "publish_year", label: "Năm xuất bản" },
  ];

  return (
    <Layout>
      <div className="rounded-2xl overflow-hidden shadow bg-white">
        {/* TOP BAR */}
        <div className="p-6 bg-gradient-to-r from-blue-900 to-blue-700 text-white">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-sm/6 text-blue-100">Library • Librarian</div>
              <h2 className="text-2xl font-bold">Quản lý sách</h2>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Tìm theo tên sách, tác giả, NXB, thể loại..."
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
                  {sortOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      Sort: {o.label}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() =>
                    setSortDir((d) => (d === "asc" ? "desc" : "asc"))
                  }
                  className="rounded-xl bg-white/10 px-3 py-2 ring-1 ring-white/20 hover:bg-white/15"
                  title="Đảo chiều sắp xếp"
                >
                  {sortDir === "asc" ? "↑" : "↓"}
                </button>

                <button
                  onClick={() => {
                    resetForm();
                    setOpenModal(true);
                  }}
                  className="rounded-xl bg-white text-blue-900 font-semibold px-4 py-2 hover:bg-blue-50"
                >
                  + Thêm sách
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-blue-100">
            <div>
              Hiển thị <b className="text-white">{displayedBooks.length}</b> sách
            </div>
            <button
              onClick={() => fetchBooks()}
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
          ) : displayedBooks.length === 0 ? (
            <div className="rounded-xl border border-dashed p-10 text-center text-gray-500">
              Không có sách nào phù hợp.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {displayedBooks.map((b) => (
                <div
                  key={b._id}
                  className="group rounded-2xl border border-gray-200 overflow-hidden bg-white hover:shadow-lg transition-shadow"
                >
                  <div className="relative bg-gray-50">
                    <img
                      src={
                        b.image_url ||
                        "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=60"
                      }
                      alt={b.title || "book"}
                      className="h-48 w-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-x-3 top-3 flex items-center justify-between">
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-white/90 text-gray-700 ring-1 ring-black/5">
                        {b.category_id?.name || "Uncategorized"}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ring-1 ring-black/5 ${
                          Number(b.available_quantity ?? 0) > 0
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {Number(b.available_quantity ?? 0) > 0
                          ? `Còn ${b.available_quantity}`
                          : "Hết"}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="min-h-[44px]">
                      <div className="font-semibold text-gray-900 line-clamp-2">
                        {b.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {b.author || "—"}
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div className="rounded-lg bg-gray-50 px-3 py-2">
                        <div className="text-gray-400">NXB</div>
                        <div className="font-medium text-gray-800 truncate">
                          {b.publisher || "—"}
                        </div>
                      </div>
                      <div className="rounded-lg bg-gray-50 px-3 py-2">
                        <div className="text-gray-400">Năm</div>
                        <div className="font-medium text-gray-800">
                          {b.publish_year || "—"}
                        </div>
                      </div>
                      <div className="rounded-lg bg-gray-50 px-3 py-2 col-span-2">
                        <div className="text-gray-400">Vị trí kệ</div>
                        <div className="font-medium text-gray-800 truncate">
                          {b.shelf_location || "—"}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => {
                          setEditing(b);
                          setForm({
                            ...b,
                            category_id: b.category_id?._id || "",
                          });
                          setOpenModal(true);
                        }}
                        className="flex-1 rounded-xl bg-amber-500 text-white px-3 py-2 text-sm font-semibold hover:bg-amber-600"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(b._id)}
                        className="flex-1 rounded-xl bg-rose-600 text-white px-3 py-2 text-sm font-semibold hover:bg-rose-700"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] flex justify-center items-center p-4 z-50">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-900 to-blue-700 text-white flex items-center justify-between">
              <div>
                <div className="text-xs text-blue-100">
                  {editing ? "Cập nhật thông tin" : "Tạo mới"}
                </div>
                <div className="text-lg font-bold">
                  {editing ? "Sửa sách" : "Thêm sách"}
                </div>
              </div>
              <button
                onClick={() => {
                  setOpenModal(false);
                  resetForm();
                }}
                className="rounded-lg px-3 py-1.5 bg-white/10 ring-1 ring-white/20 hover:bg-white/15"
              >
                Đóng
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Tên sách
                  </label>
                  <input
                    name="title"
                    placeholder="VD: Harry Potter..."
                    value={form.title}
                    onChange={handleChange}
                    className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Tác giả
                  </label>
                  <input
                    name="author"
                    placeholder="VD: J.K. Rowling"
                    value={form.author}
                    onChange={handleChange}
                    className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Thể loại
                  </label>
                  <select
                    name="category_id"
                    value={form.category_id}
                    onChange={handleChange}
                    className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Chọn thể loại --</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    NXB
                  </label>
                  <input
                    name="publisher"
                    placeholder="VD: NXB Trẻ"
                    value={form.publisher}
                    onChange={handleChange}
                    className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Năm xuất bản
                  </label>
                  <input
                    name="publish_year"
                    placeholder="VD: 2024"
                    value={form.publish_year}
                    onChange={handleChange}
                    className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Số lượng sẵn có
                  </label>
                  <input
                    name="available_quantity"
                    placeholder="VD: 10"
                    value={form.available_quantity}
                    onChange={handleChange}
                    className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">
                    Vị trí kệ
                  </label>
                  <input
                    name="shelf_location"
                    placeholder="VD: A2 - Tầng 1"
                    value={form.shelf_location}
                    onChange={handleChange}
                    className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">
                    Ảnh (URL)
                  </label>
                  <input
                    name="image_url"
                    placeholder="Dán link ảnh bìa..."
                    value={form.image_url}
                    onChange={handleChange}
                    className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setOpenModal(false);
                    resetForm();
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