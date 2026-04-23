import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const [openBorrow, setOpenBorrow] = useState(false);
  const [openBook, setOpenBook] = useState(false); // 👈 NEW
  const [openUser, setOpenUser] = useState(false);
  const [user, setUser] = useState({});

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const menuItems = [
    {
      label: "Tổng quan",
      path: "/dashboard",
      roles: ["admin"]
    },
    {
      label: "Quản lý thủ thư",
      path: "/librarians",
      roles: ["admin"]
    },
    {
      label: "Quản lý người đọc",
      path: "/readers",
      roles: ["librarian"]
    }
  ];

  return (
    <div className="w-64 h-screen flex flex-col justify-between bg-gradient-to-b from-blue-900 to-blue-950 text-white p-4">
      
      {/* TOP */}
      <div>
        <div className="flex items-center gap-2 mb-8">
          <div className="text-2xl">📚</div>
          <h1 className="font-bold text-lg">Quản lý thư viện</h1>
        </div>

        <div className="space-y-2">

          {/* MENU BASE */}
          {menuItems
            .filter((item) => item.roles.includes(user.role))
            .map((item) => (
              <div
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`p-3 rounded cursor-pointer ${
                  isActive(item.path)
                    ? "bg-blue-800 font-semibold"
                    : "hover:bg-blue-800"
                }`}
              >
                {item.label}
              </div>
          ))}

          {/* 📚 BOOK MENU */}
          {["librarian"].includes(user.role) && (
            <div>
              <div
                onClick={() => setOpenBook(!openBook)}
                className="p-3 hover:bg-blue-800 rounded cursor-pointer flex justify-between"
              >
                <span>Quản lý sách</span>
                <span>{openBook ? "▲" : "▼"}</span>
              </div>

              {openBook && (
                <div className="ml-4 mt-2 space-y-2">
                  <div
                    onClick={() => navigate("/books")}
                    className={`p-2 rounded cursor-pointer ${
                      isActive("/books")
                        ? "bg-blue-700 font-semibold"
                        : "hover:bg-blue-700"
                    }`}
                  >
                    Sách
                  </div>

                  <div
                    onClick={() => navigate("/categories")}
                    className={`p-2 rounded cursor-pointer ${
                      isActive("/categories")
                        ? "bg-blue-700 font-semibold"
                        : "hover:bg-blue-700"
                    }`}
                  >
                    Thể loại
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 📖 BORROW MENU */}
          {["librarian"].includes(user.role) && (
            <div>
              <div
                onClick={() => setOpenBorrow(!openBorrow)}
                className="p-3 hover:bg-blue-800 rounded cursor-pointer flex justify-between"
              >
                <span>Quản lý mượn sách</span>
                <span>{openBorrow ? "▲" : "▼"}</span>
              </div>

              {openBorrow && (
                <div className="ml-4 mt-2 space-y-2">
                  {/* OVERVIEW */}
                  <div
                    onClick={() => navigate("/borrow-overview")}
                    className={`p-2 rounded cursor-pointer ${
                      isActive("/borrow-overview")
                        ? "bg-blue-700 font-semibold"
                        : "hover:bg-blue-700"
                    }`}
                  >
                    Tổng quan
                  </div>  

                  <div
                    onClick={() => navigate("/borrow")}
                    className={`p-2 rounded cursor-pointer ${
                      isActive("/borrow")
                        ? "bg-blue-700 font-semibold"
                        : "hover:bg-blue-700"
                    }`}
                  >
                    Mượn sách
                  </div>

                  <div
                    onClick={() => navigate("/return")}
                    className={`p-2 rounded cursor-pointer ${
                      isActive("/return")
                        ? "bg-blue-700 font-semibold"
                        : "hover:bg-blue-700"
                    }`}
                  >
                    Trả sách
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* USER */}
      <div className="relative">
        <div
          onClick={() => setOpenUser(!openUser)}
          className="flex items-center gap-3 p-3 bg-blue-800 rounded cursor-pointer hover:bg-blue-700"
        >
          <div className="w-8 h-8 bg-white text-blue-900 flex items-center justify-center rounded-full font-bold">
            {user.name?.charAt(0) || "U"}
          </div>
          <span className="text-sm">{user.name || "User"}</span>
        </div>

        {openUser && (
          <div className="absolute bottom-14 left-0 w-full bg-white text-black rounded shadow-lg">
            <div className="p-3 border-b">{user.name}</div>

            <div
              onClick={handleLogout}
              className="p-3 hover:bg-gray-100 cursor-pointer text-red-500"
            >
              Đăng xuất
            </div>
          </div>
        )}
      </div>
    </div>
  );
}