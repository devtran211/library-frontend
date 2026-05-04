import { useEffect } from 'react';

const CartSidebar = ({ isOpen, onClose, cart, setCart, onSubmit }) => {

   const handleRemove = (book_id) => {
      setCart(prev => prev.filter(item => item.book_id !== book_id));
   };

   return (
      <>
         {/* Overlay */}
         {isOpen && (
            <div
               className="fixed inset-0 bg-black bg-opacity-40 z-40"
               onClick={onClose}
            />
         )}

         {/* Sidebar */}
         <div
            className={`fixed top-0 right-0 h-full w-80 bg-white z-50 shadow-lg transform transition-transform duration-300 ${
               isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
         >
            <div className="p-4 flex justify-between items-center border-b">
               <h2 className="font-bold text-lg">Giỏ đặt sách</h2>
               <button onClick={onClose}>✖</button>
            </div>

            <div className="p-4 space-y-3">
               {cart.length === 0 && <p>Chưa có sách</p>}

               {cart.map(item => (
                  <div key={item.book_id} className="border-b pb-2 flex justify-between items-center">

                     <div>
                        <p>{item.title}</p>
                        <span className="text-sm text-gray-500">x1</span>
                     </div>

                     {/* ❌ Nút xóa */}
                     <button
                        onClick={() => handleRemove(item.book_id)}
                        className="text-red-500 text-sm"
                     >
                        Xóa
                     </button>

                  </div>
               ))}
            </div>

            <div className="p-4 border-t">
               <button
                  onClick={onSubmit}
                  disabled={cart.length === 0}
                  className="w-full bg-blue-500 text-white py-2 rounded disabled:bg-gray-300"
               >
                  Xác nhận đặt
               </button>
            </div>
         </div>
      </>
   );
};

export default CartSidebar;