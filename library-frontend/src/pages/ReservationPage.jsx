import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import CountdownTimer from "../components/CountdownTimer";

export default function ReservationPage() {
  const [reservations, setReservations] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const timeoutRef = useRef(null);

  // ================= FETCH =================
  const fetchReservations = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/reservations");
      setReservations(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReservations();

    const handleUpdate = () => {
      fetchReservations();
    };

    window.addEventListener("reservationUpdated", handleUpdate);

    return () => {
      window.removeEventListener("reservationUpdated", handleUpdate);
    };
  }, []);

  // ================= FILTER =================
  const filtered = reservations
    .filter((r) =>
      filter === "all" ? true : r.status === filter
    )
    .filter((r) =>
      r.code?.toLowerCase().includes(search.toLowerCase())
    );

  // ================= DEBOUNCE =================
  const handleExpire = () => {
    if (timeoutRef.current) return;

    timeoutRef.current = setTimeout(() => {
      fetchReservations();
      timeoutRef.current = null;
    }, 500);
  };

  // ================= CONFIRM =================
  const handleConfirm = async (id) => {
    try {
      await axios.post(
        `http://localhost:3000/api/reservations/${id}/confirm`
      );

      window.dispatchEvent(new Event("reservationUpdated"));
      fetchReservations();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <div className="p-6">

        {/* TITLE */}
        <h2 className="text-xl font-bold mb-4">
          Đơn đặt trước
        </h2>

        {/* 🔥 SEARCH + FILTER */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">

          {/* SEARCH */}
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm theo mã..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border px-3 py-2 rounded w-64 pr-8"
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-2 text-gray-500"
              >
                ✕
              </button>
            )}
          </div>

          {/* FILTER TABS */}
          {["all", "pending", "confirmed", "expired", "cancelled"].map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`px-4 py-1 rounded-full text-sm ${
                filter === item
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              {item}
            </button>
          ))}

        </div>

        {/* LIST */}
        <div className="space-y-4">

          {filtered.length === 0 ? (
            <div className="text-center text-gray-500 py-6">
              🔍 Không tìm thấy kết quả
            </div>
          ) : (
            filtered.map((r) => {

              const isExpired =
                r.status === "pending" &&
                new Date(r.expire_at) < new Date();

              return (
                <div
                  key={r._id}
                  className="bg-white p-4 rounded-xl shadow hover:shadow-md transition"
                >

                  {/* TOP */}
                  <div className="flex justify-between items-center mb-2">

                    <div className="font-semibold">
                      {r.user_id?.name}
                    </div>

                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        r.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : r.status === "confirmed"
                          ? "bg-green-100 text-green-700"
                          : r.status === "expired"
                          ? "bg-red-100 text-red-600"
                          : r.status === "cancelled"
                          ? "bg-gray-300 text-gray-700"
                          : "bg-gray-200"
                      }`}
                    >
                      {isExpired ? "expired" : r.status}
                    </span>
                  </div>

                  {/* CODE */}
                  <div className="text-sm text-gray-600 mb-2">
                    Code: {r.code}
                  </div>

                  {/* BOOK COUNT */}
                  <div className="text-sm text-gray-600 mb-2">
                    📚 Số sách: {
                      r.details?.reduce((sum, item) => sum + item.quantity, 0) || 0
                    }
                  </div>

                  {/* COUNTDOWN */}
                  <div className="text-sm mb-2">
                    ⏳ Còn lại:{" "}
                    {r.status === "pending" && !isExpired ? (
                      <CountdownTimer
                        expireAt={r.expire_at}
                        onExpire={handleExpire}
                      />
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>

                  {/* ACTION */}
                  {r.status === "pending" && !isExpired && (
                    <button
                      onClick={() => handleConfirm(r._id)}
                      className="px-4 py-1 rounded text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Confirm
                    </button>
                  )}

                </div>
              );
            })
          )}

        </div>
      </div>
    </Layout>
  );
}