import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");

  const token = localStorage.getItem("token");

  // 📌 GET ALL
  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/categories", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 📌 CREATE / UPDATE
  const handleSubmit = async () => {
    try {
      if (editing) {
        await axios.put(
          `http://localhost:3000/categories/api/categories/edit/${editing._id}`,
          { name },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          "http://localhost:3000/api/categories/create",
          { name },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setOpenModal(false);
      setName("");
      setEditing(null);
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert("Lỗi!");
    }
  };

  // 📌 DELETE
  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa?")) return;

    try {
      await axios.delete(`http://localhost:3000/api/categories/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <div className="bg-white rounded-xl shadow p-6">
        {/* HEADER */}
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">Quản lý thể loại</h2>

          <button
            onClick={() => setOpenModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Thêm thể loại
          </button>
        </div>

        {/* TABLE */}
        <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Tên</th>
              <th className="p-3">Hành động</th>
            </tr>
          </thead>

          <tbody>
            {categories.map((c) => (
              <tr key={c._id} className="hover:bg-gray-50">
                <td className="p-3">{c.name}</td>

                <td className="p-3 space-x-2">
                  <button
                    onClick={() => {
                      setEditing(c);
                      setName(c.name);
                      setOpenModal(true);
                    }}
                    className="px-3 py-1 bg-yellow-400 rounded"
                  >
                    Sửa
                  </button>

                  <button
                    onClick={() => handleDelete(c._id)}
                    className="px-3 py-1 bg-red-500 text-white rounded"
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
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-96">
              <h3 className="text-lg font-semibold mb-4">
                {editing ? "Sửa thể loại" : "Thêm thể loại"}
              </h3>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tên thể loại"
                className="w-full border p-2 mb-4 rounded"
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setOpenModal(false);
                    setEditing(null);
                    setName("");
                  }}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Hủy
                </button>

                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
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