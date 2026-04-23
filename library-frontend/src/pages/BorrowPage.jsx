import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

export default function BorrowPage() {
  const [borrows, setBorrows] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [error, setError] = useState("");

  // 🔥 NEW STATE
  const [expandedId, setExpandedId] = useState(null);
  const [details, setDetails] = useState([]);

  const [form, setForm] = useState({
    user: { keyword: "" },
    books: [{ id: "", keyword: "", results: [] }]
  });

  // ================= FETCH =================
  const fetchBorrows = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/borrow/borrowing");
      setBorrows(res.data.records);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBorrows();
  }, []);

  // ================= FETCH DETAIL =================
  const fetchBorrowDetail = async (id) => {
    try {
      const res = await axios.get(`http://localhost:3000/api/borrow/borrow-details/${id}`);
      setDetails(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ================= SEARCH BOOK =================
  const searchBooks = async (keyword, index) => {
    try {
      if (!keyword) return;

      const res = await axios.get(
        `http://localhost:3000/api/book/search?keyword=${keyword}`
      );

      const selectedIds = form.books.map((b) => b.id);

      const filtered = res.data.data.filter(
        (b) => !selectedIds.includes(b._id)
      );

      const newBooks = [...form.books];
      newBooks[index].results = filtered;

      setForm({ ...form, books: newBooks });
    } catch (err) {
      console.error(err);
    }
  };

  // ================= CREATE =================
  const handleCreate = async () => {
    try {
      setError("");

      const book_ids = form.books
        .map((b) => b.id)
        .filter((id) => id !== "");

      if (!form.user.keyword || book_ids.length === 0) {
        setError("Vui lòng nhập người đọc và chọn ít nhất 1 sách");
        return;
      }

      await axios.post("http://localhost:3000/api/borrow/create", {
        keyword: form.user.keyword,
        books: book_ids.map((id) => ({ book_id: id }))
      });

      setOpenModal(false);

      setForm({
        user: { keyword: "" },
        books: [{ id: "", keyword: "", results: [] }]
      });

      fetchBorrows();

    } catch (err) {
      console.error(err);

      const message =
        err.response?.data?.message || err.message || "Lỗi hệ thống";

      setError(message);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!confirm("Xóa record này?")) return;

    await axios.delete(`http://localhost:3000/api/borrow/delete/${id}`);
    fetchBorrows();
  };

  return (
    <Layout>
      <div className="bg-white p-6 rounded-xl shadow">

        {/* HEADER */}
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">Quản lý mượn sách</h2>

          <button
            onClick={() => setOpenModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            + Mượn sách
          </button>
        </div>

        {/* TABLE */}
        <table className="w-full border border-gray-200">
          <thead className="bg-gray-100 text-center">
            <tr>
              <th>Reader</th>
              <th>Ngày mượn</th>
              <th>Hạn trả</th>
              <th>Số lượng</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {borrows.map((b) => (
              <>
                {/* MAIN ROW */}
                <tr
                  key={b._id}
                  className="text-center hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    if (expandedId === b._id) {
                      setExpandedId(null);
                    } else {
                      setExpandedId(b._id);
                      fetchBorrowDetail(b._id);
                    }
                  }}
                >
                  <td>{b.user_id?.name}</td>
                  <td>{new Date(b.borrow_date).toLocaleDateString()}</td>
                  <td>{new Date(b.due_date).toLocaleDateString()}</td>
                  <td>{b.total_quantity}</td>
                  <td>
                    <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                      {b.status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // 🔥 tránh click row
                        handleDelete(b._id);
                      }}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>

                {/* EXPAND ROW */}
                {expandedId === b._id && (
                  <tr>
                    <td colSpan="6" className="bg-gray-50 p-4 text-left">

                      <div className="font-semibold mb-2">
                        📚 Chi tiết sách
                      </div>

                      {details.length === 0 ? (
                        <div className="text-gray-500">
                          Không có dữ liệu
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {details.map((d) => (
                            <div
                              key={d._id}
                              className="flex justify-between border-b pb-1"
                            >
                              <span>{d.book_id?.title}</span>
                            </div>
                          ))}
                        </div>
                      )}

                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>

        {/* ================= MODAL ================= */}
        {openModal && (
          <div className="fixed inset-0 bg-black/30 flex justify-center items-center">
            <div className="bg-white p-6 rounded w-[450px] max-h-[80vh] overflow-y-auto">

              <h3 className="text-lg font-bold mb-4">
                Mượn sách
              </h3>

              {error && (
                <div className="bg-red-100 text-red-600 p-2 mb-3 rounded">
                  {error}
                </div>
              )}

              {/* USER INPUT */}
              <input
                type="text"
                value={form.user.keyword}
                placeholder="Nhập tên / email / số điện thoại..."
                onChange={(e) =>
                  setForm({
                    ...form,
                    user: { keyword: e.target.value }
                  })
                }
                className="w-full border p-2 mb-3"
              />

              {/* BOOK SEARCH */}
              {form.books.map((item, index) => (
                <div key={index} className="relative mb-2">

                  <input
                    value={item.keyword}
                    placeholder="Gõ tên sách..."
                    onChange={(e) => {
                      const value = e.target.value;

                      const newBooks = [...form.books];
                      newBooks[index].keyword = value;

                      setForm({ ...form, books: newBooks });

                      searchBooks(value, index);
                    }}
                    className="w-full border p-2"
                  />

                  {item.results?.length > 0 && item.keyword && (
                    <div className="absolute z-10 bg-white border w-full max-h-40 overflow-y-auto shadow">
                      {item.results.map((b) => (
                        <div
                          key={b._id}
                          onClick={() => {
                            const newBooks = [...form.books];
                            newBooks[index] = {
                              id: b._id,
                              keyword: b.title,
                              results: []
                            };
                            setForm({ ...form, books: newBooks });
                          }}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                        >
                          {b.title} - {b.author} ({b.available_quantity})
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() =>
                      setForm({
                        ...form,
                        books: form.books.filter((_, i) => i !== index)
                      })
                    }
                    className="text-red-500 text-sm mt-1"
                  >
                    Xóa
                  </button>
                </div>
              ))}

              <button
                onClick={() =>
                  setForm({
                    ...form,
                    books: [
                      ...form.books,
                      { id: "", keyword: "", results: [] }
                    ]
                  })
                }
                className="bg-green-500 text-white px-3 py-1 rounded mt-2"
              >
                + Thêm sách
              </button>

              <div className="text-sm text-gray-600 mt-2">
                Đã chọn: {form.books.filter((b) => b.id).length} sách
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setOpenModal(false)}
                  className="bg-gray-300 px-4 py-2 rounded"
                >
                  Hủy
                </button>

                <button
                  onClick={handleCreate}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Xác nhận
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}