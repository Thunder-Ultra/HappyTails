import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:4000/", // change to your backend URL
});

// Automatically attach token to headers
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default API;
