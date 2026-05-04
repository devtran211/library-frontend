import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import LibrarianPage from "./pages/LibrarianPage";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import ReaderPage from "./pages/ReaderPage";
import CategoryPage from "./pages/CategoryPage";
import BookPage from "./pages/BookPage";
import BorrowPage from "./pages/BorrowPage";
import BorrowOverviewPage from "./pages/BorrowOverviewPage";
import ReturnSearchPage from "./pages/ReturnSearchPage";
import ReturnDetailPage from "./pages/ReturnDetailPage";
import ReservationPage from "./pages/ReservationPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";


function App() {
   return (
      <BrowserRouter>
         <Routes>
            <Route
               path="/login"
               element={
                  <PublicRoute>
                     <Login />
                  </PublicRoute>
               }
            />

            <Route
               path="/register"
               element={
                  <PublicRoute>
                     <Register />
                  </PublicRoute>
               }
            />
            
            <Route
               path="/dashboard"
               element={
                  <ProtectedRoute roles={["admin", "librarian"]}>
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
            <Route path="/reservations/" element={<ReservationPage />} />
            <Route path="/homepage/" element={<HomePage />} />
            <Route path="/profile/" element={<ProfilePage />} />
            {/* <Route
               path="/homepage"
               element={
                  <ProtectedRoute roles={["reader"]}>
                     <Homepage />
                  </ProtectedRoute>
               }
            /> */}

            
         </Routes>
      </BrowserRouter>
   );
}

export default App;