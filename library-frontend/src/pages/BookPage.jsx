import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

export default function BookPage() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);

  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    title: "",
    author: "",
    category_id: "",
    publisher: "",
    publish_year: "",
    available_quantity: "",
    shelf_location: "",
    image_url: ""
  });

  const token = localStorage.getItem("token");

  // 📌 GET BOOKS
  const fetchBooks = async () => {
    const res = await axios.get("http://localhost:3000/api/book");
    setBooks(res.data.data);
  };

  // 📌 GET CATEGORIES
  const fetchCategories = async () => {
    const res = await axios.get("http://localhost:3000/api/categories");
    setCategories(res.data.data);
  };

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, []);

  // 📌 HANDLE INPUT
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 📌 CREATE / UPDATE
  const handleSubmit = async () => {
    try {
      if (editing) {
        await axios.put(
          `http://localhost:3000/api/book/update/${editing._id}`,
          form
        );
      } else {
        await axios.post("http://localhost:3000/api/book/create", form);
      }

      setOpenModal(false);
      setEditing(null);
      setForm({
        title: "",
        author: "",
        category_id: "",
        publisher: "",
        publish_year: "",
        available_quantity: "",
        shelf_location: "",
        image_url: ""
      });

      fetchBooks();
    } catch (err) {
      console.error(err);
      alert("Lỗi!");
    }
  };

  // 📌 DELETE
  const handleDelete = async (id) => {
    if (!confirm("Xóa sách này?")) return;

    await axios.delete(`http://localhost:3000/api/book/delete/${id}`);
    fetchBooks();
  };

  return (
    <Layout>
      <div className="bg-white p-6 rounded-xl shadow">

        {/* HEADER */}
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">Quản lý sách</h2>

          <button
            onClick={() => setOpenModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            + Thêm sách
          </button>
        </div>

        {/* TABLE */}
        <table className="w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Ảnh</th>
              <th className="p-2">Tên</th>
              <th className="p-2">Tác giả</th>
              <th className="p-2">Thể loại</th>
              <th className="p-2">Số lượng</th>
              <th className="p-2">Hành động</th>
            </tr>
          </thead>

          <tbody>
            {books.map((b) => (
              <tr key={b._id} className="text-center">
                <td className="p-2">
                  <img
                    src={b.image_url}
                    alt=""
                    className="w-12 h-16 object-cover mx-auto"
                  />
                </td>

                <td>{b.title}</td>
                <td>{b.author}</td>
                <td>{b.category_id?.name}</td>
                <td>{b.available_quantity}</td>

                <td className="space-x-2">
                  <button
                    onClick={() => {
                      setEditing(b);
                      setForm({
                        ...b,
                        category_id: b.category_id?._id
                      });
                      setOpenModal(true);
                    }}
                    className="bg-yellow-400 px-2 py-1 rounded"
                  >
                    Sửa
                  </button>

                  <button
                    onClick={() => handleDelete(b._id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* MODAL */}
        {openModal && (
          <div className="fixed inset-0 bg-black/30 flex justify-center items-center">
            <div className="bg-white p-6 rounded w-[500px]">

              <h3 className="text-lg font-bold mb-4">
                {editing ? "Sửa sách" : "Thêm sách"}
              </h3>

              <div className="grid grid-cols-2 gap-3">

                <input name="title" placeholder="Tên sách" value={form.title} onChange={handleChange} className="border p-2" />
                <input name="author" placeholder="Tác giả" value={form.author} onChange={handleChange} className="border p-2" />

                {/* 🔥 CATEGORY SELECT */}
                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  className="border p-2"
                >
                  <option value="">-- Chọn thể loại --</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <input name="publisher" placeholder="NXB" value={form.publisher} onChange={handleChange} className="border p-2" />
                <input name="publish_year" placeholder="Năm" value={form.publish_year} onChange={handleChange} className="border p-2" />
                <input name="available_quantity" placeholder="Số lượng" value={form.available_quantity} onChange={handleChange} className="border p-2" />
                <input name="shelf_location" placeholder="Vị trí" value={form.shelf_location} onChange={handleChange} className="border p-2" />

                <input
                  name="image_url"
                  placeholder="Link ảnh"
                  value={form.image_url}
                  onChange={handleChange}
                  className="border p-2 col-span-2"
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setOpenModal(false)}
                  className="bg-gray-300 px-4 py-2 rounded"
                >
                  Hủy
                </button>

                <button
                  onClick={handleSubmit}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}