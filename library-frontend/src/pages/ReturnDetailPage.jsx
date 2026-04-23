import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

export default function ReturnDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [borrow, setBorrow] = useState(null);
  const [details, setDetails] = useState([]);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");

  const [form, setForm] = useState([]);

  // ================= FETCH =================
  const fetchDetail = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/return/borrow-records/details/${id}`
      );

      setBorrow(res.data.data.borrow);
      setDetails(res.data.data.details);

      const initForm = res.data.data.details.map((d) => ({
        borrow_detail_id: d._id,
        checked: false,
        condition: "Good",
        fine_status: "Unpaid",
        fee: 0
      }));

      setForm(initForm);
    } catch (err) {
      setError("Không tải được dữ liệu");
    }
  };

  useEffect(() => {
    fetchDetail();
  }, []);

  // ================= UPDATE =================
  const updateForm = (index, field, value) => {
    const newForm = [...form];
    newForm[index][field] = value;
    setForm(newForm);
  };

  // ================= VALIDATE =================
  const validate = () => {
    setError("");
    setWarning("");

    const selected = form.filter((f) => f.checked);

    if (selected.length === 0) {
      setError("Vui lòng chọn ít nhất 1 sách");
      return false;
    }

    for (let item of selected) {
      if (item.fee < 0) {
        setError("Fee không được âm");
        return false;
      }

      if (
        (item.condition === "damaged" || item.condition === "lost") &&
        item.fee === 0
      ) {
        setWarning("Sách bị hỏng/mất nên có phí phạt");
      }
    }

    return true;
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const returns = form
        .filter((f) => f.checked)
        .map((f) => ({
          borrow_detail_id: f.borrow_detail_id,
          condition: f.condition,
          fee: f.fee,
          fine_status: f.fine_status
        }));

      await axios.post("http://localhost:3000/api/return/borrow-records/return-books", {
        borrow_id: id,
        returns
      });

      alert("Trả sách thành công");
      navigate("/return");

    } catch (err) {
      const message =
        err.response?.data?.message || "Lỗi";

      setError(message);
    }
  };

  if (!borrow) return <Layout>Loading...</Layout>;

  return (
    <Layout>
      <div className="bg-white p-6 rounded-xl shadow max-w-5xl mx-auto">

        {/* HEADER */}
        <h2 className="text-xl font-bold mb-4">
          Trả sách
        </h2>

        {/* INFO */}
        <div className="mb-4 bg-gray-50 p-4 rounded text-sm">
          <div><b>Người mượn:</b> {borrow.user.name}</div>
          <div><b>Hạn trả:</b> {new Date(borrow.due_date).toLocaleDateString()}</div>
          <div>
            <b>Trạng thái:</b>{" "}
            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
              {borrow.status}
            </span>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-100 text-red-600 p-2 mb-3 rounded">
            {error}
          </div>
        )}

        {/* WARNING */}
        {warning && (
          <div className="bg-yellow-100 text-yellow-700 p-2 mb-3 rounded">
            {warning}
          </div>
        )}

        {/* TABLE */}
        <table className="w-full border border-gray-200 rounded overflow-hidden">
          <thead className="bg-gray-100 text-center">
            <tr>
              <th></th>
              <th>Sách</th>
              <th>Condition</th>
              <th>Fee</th>
              <th>Fine Status</th>
            </tr>
          </thead>

          <tbody>
            {details.map((d, index) => (
              <tr
                key={d._id}
                className={`text-center ${
                  form[index]?.checked
                    ? "bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
              >
                {/* CHECK */}
                <td>
                  <input
                    type="checkbox"
                    disabled={d.book_return_date_details}
                    checked={form[index]?.checked || false}
                    onChange={(e) =>
                      updateForm(index, "checked", e.target.checked)
                    }
                  />
                </td>

                {/* BOOK */}
                <td className="font-medium">
                  {d.book.title}
                </td>

                {/* CONDITION */}
                <td>
                  <select
                    disabled={!form[index]?.checked}
                    value={form[index]?.condition}
                    onChange={(e) =>
                      updateForm(index, "condition", e.target.value)
                    }
                    className="border p-1 rounded"
                  >
                    <option value="Good">Good</option>
                    <option value="damaged">Damaged</option>
                    <option value="lost">Lost</option>
                  </select>
                </td>

                {/* FEE */}
                <td>
                  <input
                    type="number"
                    min={0}
                    disabled={!form[index]?.checked}
                    value={form[index]?.fee || 0}
                    onChange={(e) =>
                      updateForm(index, "fee", Number(e.target.value))
                    }
                    className={`border w-24 p-1 text-center rounded ${
                      form[index]?.fee > 0
                        ? "text-red-500 font-semibold"
                        : ""
                    }`}
                  />
                </td>

                {/* STATUS */}
                <td>
                  <select
                    disabled={!form[index]?.checked}
                    value={form[index]?.fine_status}
                    onChange={(e) =>
                      updateForm(index, "fine_status", e.target.value)
                    }
                    className="border p-1 rounded"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                  </select>
                </td>

              </tr>
            ))}
          </tbody>
        </table>

        {/* ACTION */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => navigate("/return")}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Quay lại
          </button>

          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Xác nhận trả
          </button>
        </div>

      </div>
    </Layout>
  );
}