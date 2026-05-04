const BookCard = ({ book, onAdd, isSelected }) => {
   return (
      <div className="border p-4 rounded shadow">
         <img src={book.image_url} alt="" className="h-40" />
         <h3>{book.title}</h3>

         <button
            onClick={() => onAdd(book)}
            disabled={isSelected}
            className={`px-3 py-1 rounded ${
               isSelected
                  ? 'bg-gray-300'
                  : 'bg-blue-500 text-white'
            }`}
         >
            {isSelected ? 'Đã chọn' : 'Đặt trước'}
         </button>
      </div>
   );
};

export default BookCard;