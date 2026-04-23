import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import LibrarianPage from "./pages/LibrarianPage";
import ProtectedRoute from "./components/ProtectedRoute";
import ReaderPage from "./pages/ReaderPage";
import CategoryPage from "./pages/CategoryPage";
import BookPage from "./pages/BookPage";
import BorrowPage from "./pages/BorrowPage";
import BorrowOverviewPage from "./pages/BorrowOverviewPage";
import ReturnSearchPage from "./pages/ReturnSearchPage";
import ReturnDetailPage from "./pages/ReturnDetailPage";

function App() {
   return (
      <BrowserRouter>
         <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* <Route path="/dashboard" element={<Dashboard />} /> */}
            <Route
               path="/dashboard"
               element={
                  <ProtectedRoute>
                     <Dashboard />
                  </ProtectedRoute>
               }
            />
            <Route path="/librarians" element={<LibrarianPage />} />
            <Route path="/readers" element={<ReaderPage />} />
            <Route path="/books" element={<BookPage />} />
            <Route path="/categories" element={<CategoryPage />} />
            <Route path="/borrow-overview" element={<BorrowOverviewPage />} />
            <Route path="/borrow" element={<BorrowPage />} />
            <Route path="/return" element={<ReturnSearchPage />} />
            <Route path="/return/:id" element={<ReturnDetailPage />} />
            {/* <Route path="/login" element={<div>Login Page</div>} /> */}
         </Routes>
      </BrowserRouter>
   );
}

export default App;