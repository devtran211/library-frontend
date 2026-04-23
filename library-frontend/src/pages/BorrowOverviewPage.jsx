import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

export default function BorrowListPage() {
  const [borrows, setBorrows] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");

  // 🔥 NEW
  const [expandedId, setExpandedId] = useState(null);
  const [details, setDetails] = useState([]);

  // ================= FETCH =================
  const fetchBorrows = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/borrow");
      setBorrows(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBorrowDetail = async (id) => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/borrow/borrow-details/${id}`
      );
      setDetails(res.data);
      console.log(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBorrows();
  }, []);

  // ================= FILTER =================
  const filteredBorrows =
    statusFilter === "All"
      ? borrows
      : borrows.filter((b) => b.status === statusFilter);

  return (
    <Layout>
      <div className="bg-white p-6 rounded-xl shadow">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            Danh sách mượn sách
          </h2>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="All">Tất cả</option>
            <option value="Borrowing">Borrowing</option>
            <option value="Returned">Returned</option>
            <option value="Insufficient payment">
              Insufficient payment
            </option>
          </select>
        </div>

        {/* TABLE */}
        <table className="w-full border border-gray-200">
          <thead className="bg-gray-100 text-center">
            <tr>
              <th className="p-2">Reader</th>
              <th className="p-2">Ngày mượn</th>
              <th className="p-2">Hạn trả</th>
              <th className="p-2">Số lượng</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredBorrows.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center p-4 text-gray-500">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              filteredBorrows.map((b) => (
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

                    <td>
                      {new Date(b.borrow_date).toLocaleDateString()}
                    </td>

                    <td>
                      {new Date(b.due_date).toLocaleDateString()}
                    </td>

                    <td>{b.total_quantity}</td>

                    <td>
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          b.status === "Borrowing"
                            ? "bg-yellow-100 text-yellow-700"
                            : b.status === "Returned"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>

                  {/* EXPAND DETAIL */}
                  {expandedId === b._id && (
                    <tr>
                      <td colSpan="5" className="bg-gray-50 p-4 text-left">

                        <div className="font-semibold mb-2">
                          📚 Chi tiết sách
                        </div>

                        {details.length === 0 ? (
                          <div className="text-gray-500">
                            Không có dữ liệu
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {details.map((d) => (
                              <div
                                key={d._id}
                                className={`flex items-center justify-between border p-3 rounded ${
                                  d.fine ? "bg-red-50" : ""
                                }`}
                              >

                              {/* LEFT */}
                              <div className="flex items-center gap-3">

                                <img
                                  src={d.book_id?.image_url}
                                  alt=""
                                  className="w-12 h-16 object-cover rounded"
                                />

                                <div>
                                  <div className="font-medium">
                                    {d.book_id?.title}
                                  </div>

                                  <div className="text-sm text-gray-500">
                                    {d.book_id?.author}
                                  </div>

                                  {/* 🔥 BOOK CONDITION */}
                                  {d.book_condition && (
                                    <div className="text-xs text-orange-600 mt-1">
                                      Tình trạng: {d.book_condition}
                                    </div>
                                  )}

                                  {d.book_condition && (
                                    <div className="text-xs text-blue-600 mt-1">
                                      Ngày trả: {new Date(d.book_return_date_details).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>

                              </div>

                              {/* RIGHT */}
                              <div className="text-right space-y-1">

                                {/* RETURN STATUS */}
                                <div
                                  className={`text-sm font-medium ${
                                    d.book_return_date_details
                                      ? "text-green-600"
                                      : "text-yellow-600"
                                  }`}
                                >
                                  {d.book_return_date_details
                                    ? "Đã trả"
                                    : "Chưa trả"}
                                </div>

                                {/* 🔥 FINE */}
                                {d.fine && (
                                  <div className="text-red-600 text-sm font-semibold">
                                    Phạt: {d.fine.amount}đ
                                  </div>
                                )}

                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}