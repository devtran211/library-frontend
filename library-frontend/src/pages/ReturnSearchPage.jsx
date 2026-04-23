import { useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";

export default function ReturnSearchPage() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // ================= SEARCH =================
  const handleSearch = async () => {
    try {
      setError("");
      setResults([]);

      if (!keyword.trim()) {
        setError("Vui lòng nhập thông tin tìm kiếm");
        return;
      }

      const res = await axios.get(
        `http://localhost:3000/api/return/borrow-records/search?keyword=${keyword}`
      );

      setResults(res.data.data || []);
    } catch (err) {
      console.error(err);

      const message =
        err.response?.data?.message || "Không tìm thấy dữ liệu";

      setError(message);
    }
  };

  return (
    <Layout>
      <div className="bg-white p-6 rounded-xl shadow max-w-3xl mx-auto">

        {/* TITLE */}
        <h2 className="text-xl font-bold mb-4">
          Trả sách
        </h2>

        {/* SEARCH BOX */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Nhập tên / email / số điện thoại / mã phiếu..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="flex-1 border p-3 rounded"
          />

          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700"
          >
            Tìm kiếm
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-100 text-red-600 p-2 rounded mb-4">
            {error}
          </div>
        )}

        {/* RESULT */}
        {results.length > 0 && (
          <div className="space-y-3">

            {results.map((r) => (
              <div
                key={r._id}
                onClick={() => navigate(`/return/${r._id}`)}
                className="border p-4 rounded hover:bg-gray-50 cursor-pointer transition"
              >
                <div className="font-semibold">
                  {r.user_id?.name}
                </div>

                <div className="text-sm text-gray-500">
                  Ngày mượn:{" "}
                  {new Date(r.borrow_date).toLocaleDateString()}
                </div>

                <div className="text-sm text-gray-500">
                  Hạn trả:{" "}
                  {new Date(r.due_date).toLocaleDateString()}
                </div>

                <div className="text-sm">
                  Số sách: {r.quantity}
                </div>

                <div className="text-sm text-blue-600">
                  {r.status}
                </div>
              </div>
            ))}

          </div>
        )}

      </div>
    </Layout>
  );
}