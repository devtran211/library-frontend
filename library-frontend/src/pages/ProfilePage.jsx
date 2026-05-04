import { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import CountdownTimer from "../components/CountdownTimer";

export default function ProfilePage() {
  const [reservations, setReservations] = useState([]);
  const [user, setUser] = useState(null);

  // 🔐 Load user
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  // 📡 Fetch reservations
  const fetchReservations = async (userId) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:3000/api/reservations/my",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setReservations(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchReservations(user._id);
    }
  }, [user]);

  // =====================================================
  // 🔴 CANCEL RESERVATION
  // =====================================================
  const handleCancel = async (reservationId) => {
    const confirmCancel = window.confirm(
      "Bạn có chắc muốn huỷ đơn đặt sách này không?"
    );

    if (!confirmCancel) return;

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `http://localhost:3000/api/reservations/${reservationId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // reload lại danh sách
      fetchReservations(user._id);

    } catch (err) {
      console.error(err);
      alert("Huỷ reservation thất bại");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">

      {/* HEADER */}
      <Header />

      <div className="p-6">

        <h2 className="text-xl font-bold mb-4">
          Thông tin của tôi
        </h2>

        {/* USER INFO */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <p><b>Tên:</b> {user?.name}</p>
          <p><b>Email:</b> {user?.email}</p>
        </div>

        {/* RESERVATION */}
        <h3 className="font-semibold mb-3">
          Đơn đặt sách của bạn
        </h3>

        <div className="space-y-4">
          {reservations.map((r) => {

            // 👉 chỉ dùng cho UI (KHÔNG override status)
            const isExpired = new Date(r.expire_at) < new Date();

            return (
              <div
                key={r._id}
                className="bg-white p-4 rounded shadow"
              >

                {/* HEADER */}
                <div className="flex justify-between items-center mb-2">

                  <span className="font-semibold">
                    Reservation #{r._id.slice(-6)}
                  </span>

                  <div className="flex items-center gap-2">

                    {/* ✅ STATUS (FIXED) */}
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        r.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : r.status === "confirmed"
                          ? "bg-green-100 text-green-700"
                          : r.status === "expired"
                          ? "bg-red-100 text-red-600"
                          : r.status === "cancelled"
                          ? "bg-gray-200 text-gray-600"
                          : ""
                      }`}
                    >
                      {r.status}
                    </span>

                    {/* 🔴 CANCEL BUTTON */}
                    {r.status === "pending" && !isExpired && (
                      <button
                        onClick={() => handleCancel(r._id)}
                        className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      >
                        Huỷ
                      </button>
                    )}

                  </div>
                </div>

                {/* TOTAL BOOK */}
                <div className="text-sm mb-2">
                  📚 Số sách: {
                    r.details?.reduce((sum, i) => sum + i.quantity, 0) || 0
                  }
                </div>

                {/* COUNTDOWN */}
                <div className="text-sm">
                  ⏳ Thời gian còn lại:{" "}
                  {r.status === "pending" && !isExpired ? (
                    <CountdownTimer
                      expireAt={r.expire_at}
                      onExpire={() => fetchReservations(user._id)}
                    />
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}