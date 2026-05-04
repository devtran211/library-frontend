import { Navigate } from "react-router-dom";
import { redirectByRole } from "../utils/auth";

export default function PublicRoute({ children }) {
   const token = localStorage.getItem("token");
   const user = JSON.parse(localStorage.getItem("user"));

   if (token && user) {
      return <Navigate to={redirectByRole(user.role)} />;
   }

   return children;
} 