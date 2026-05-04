export const redirectByRole = (role) => {
   if (role === "reader") return "/homepage";
   if (role === "admin" || role === "librarian") return "/dashboard";
   return "/login";
};