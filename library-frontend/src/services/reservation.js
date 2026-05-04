import axios from 'axios';

const API_URL = 'http://localhost:3000/api/reservations/create';

export const createReservation = async (payload) => {
   const res = await axios.post(API_URL, payload);
   return res.data;
};

const fetchReservations = async () => {
  try {
    const res = await axios.get("http://localhost:3000/api/reservations");
    setReservations(res.data.data);
  } catch (err) {
    console.error(err);
  }
};