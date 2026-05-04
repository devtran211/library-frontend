import { useEffect, useState } from 'react';
import { getBooks } from '../services/book';
import { createReservation } from '../services/reservation';

import CartSidebar from '../components/CartSideBar';
import CountdownTimer from '../components/CountdownTimer';

const BookListPage = () => {
   const [books, setBooks] = useState([]);
   const [cart, setCart] = useState([]);
   const [isCartOpen, setIsCartOpen] = useState(false);
   const [reservationInfo, setReservationInfo] = useState(null);

   // 🔐 Auth state
   const [user, setUser] = useState(null);
   const [showDropdown, setShowDropdown] = useState(false);

   const userId = user?._id;

   // Load books
   useEffect(() => {
      const fetchBooks = async () => {
         try {
            const data = await getBooks();
            setBooks(data);
         } catch (err) {
            console.error(err);
         }
      };

      fetchBooks();
   }, []);

   // Load user từ localStorage
   useEffect(() => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
         setUser(JSON.parse(storedUser));
      }
   }, []);

   useEffect(() => {
    const saved = localStorage.getItem('reservation');

    if (!saved) return;

    const data = JSON.parse(saved);

    // 👉 check còn hạn không
    if (new Date(data.expire_at) > new Date()) {
        setReservationInfo(data);
    } else {
        // 👉 nếu hết hạn thì xóa luôn
        localStorage.removeItem('reservation');
    }
   }, []);

   // Logout
   const handleLogout = () => {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
      setShowDropdown(false);
   };

   // 🟢 Add to cart (mỗi sách = 1)
   const handleAdd = (book) => {
      setCart(prev => {
         const existed = prev.find(i => i.book_id === book._id);

         if (existed) {
            alert('Sách đã được chọn');
            return prev;
         }

         if (prev.length >= 3) {
            alert('Chỉ được đặt tối đa 3 sách');
            return prev;
         }

         return [
            ...prev,
            {
               book_id: book._id,
               title: book.title,
               quantity: 1
            }
         ];
      });
   };

   // 🔴 Submit reservation
   const handleSubmit = async () => {
        if (!userId) {
            alert('Bạn cần đăng nhập');
            return;
        }

        try {
            const res = await createReservation({
                user_id: userId,
                books: cart
            });

            const data = res.data;

            // 👉 lưu state
            setReservationInfo(data);

            // 👉 lưu localStorage
            localStorage.setItem('reservation', JSON.stringify(data));

            setCart([]);
            setIsCartOpen(false);

        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };

   return (
      <div className="bg-gray-100 min-h-screen">

         {/* HEADER */}
         <div className="bg-blue-500 p-4 flex justify-between items-center">

            <h1 className="text-white font-bold text-xl">Book Store</h1>

            <input
               type="text"
               placeholder="Search..."
               className="px-3 py-1 rounded w-1/3"
            />

            <div className="flex items-center gap-4 text-white">

               {/* CART */}
               <div
                  className="cursor-pointer"
                  onClick={() => setIsCartOpen(true)}
               >
                  Cart ({cart.length})
               </div>

               {/* AUTH */}
               {!user ? (
                  <button
                     onClick={() => window.location.href = '/login'}
                     className="bg-white text-blue-500 px-3 py-1 rounded"
                  >
                     Đăng nhập
                  </button>
               ) : (
                  <div className="relative">

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

         {/* CONTENT */}
         <div className="p-6">

            <div className="flex justify-between items-center mb-4">
               <h2 className="text-xl font-bold">Hot Off The Press</h2>
               <span className="text-blue-500 cursor-pointer">View all</span>
            </div>

            {/* BOOK GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">

               {books.map(book => {
                  const isSelected = cart.some(i => i.book_id === book._id);

                  return (
                     <div
                        key={book._id}
                        className="bg-white p-3 rounded shadow hover:shadow-lg transition"
                     >

                        <div className="text-xs bg-red-500 text-white px-2 py-1 inline-block mb-2">
                           Pre-order
                        </div>

                        <img
                           src={book.image_url}
                           alt=""
                           className="h-40 w-full object-cover mb-2"
                        />

                        <h3 className="text-sm font-semibold line-clamp-2">
                           {book.title}
                        </h3>

                        <p className="text-xs text-gray-500 mb-1">
                           {book.author}
                        </p>

                        {book.available_quantity === 0 ? (
                            <p className="text-red-500 font-bold text-sm mb-2">
                                No more books
                            </p>
                            ) : (
                            <p className="text-green-600 font-bold text-sm mb-2">
                                Available
                            </p>
                        )}

                        <button
                            onClick={() => handleAdd(book)}
                            disabled={isSelected || book.available_quantity === 0}
                            className={`w-full py-1 text-sm rounded ${
                                isSelected || book.available_quantity === 0
                                    ? 'bg-gray-300'
                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                            >
                            {book.available_quantity === 0
                                ? 'Hết sách'
                                : isSelected
                                ? 'Đã chọn'
                                : 'Đặt trước'}
                        </button>
                     </div>
                  );
               })}

            </div>

         </div>

         {/* SIDEBAR CART */}
         <CartSidebar
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cart={cart}
            setCart={setCart}
            onSubmit={handleSubmit}
         />
      </div>
   );
};

export default BookListPage;