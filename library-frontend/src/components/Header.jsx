import { useState, useEffect } from "react";

export default function Header() {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="bg-blue-500 p-4 flex justify-between items-center">

      {/* LOGO */}
      <h1
        className="text-white font-bold text-xl cursor-pointer"
        onClick={() => window.location.href = "/"}
      >
        Book Store
      </h1>

      {/* USER */}
      <div className="text-white relative">

        {!user ? (
          <button
            onClick={() => window.location.href = "/login"}
            className="bg-white text-blue-500 px-3 py-1 rounded"
          >
            Đăng nhập
          </button>
        ) : (
          <div>
            <div
              className="cursor-pointer"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {user.name}
            </div>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded shadow">

                <div
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => window.location.href = "/profile"}
                >
                  Thông tin
                </div>

                <div
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={handleLogout}
                >
                  Đăng xuất
                </div>

              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}