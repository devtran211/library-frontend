import axios from "axios";

const API_URL = "http://localhost:3000/api/book"; 

export const bookService = {
  getAll: async () => {
    const res = await axios.get(API_URL);
    return res.data;
  }
};

export const getBooks = async () => {
   const res = await axios.get(API_URL);
   return res.data.data;
};