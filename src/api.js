import axios from "axios";

// Base API for user management
const API = axios.create({
  baseURL: "http://localhost:5500/api/users",
});

// AI Analysis API for AI-powered threat detection
const AI_API = axios.create({
  baseURL: "http://localhost:5500/api/ai-analysis",
});

// Add authentication to both APIs
const addAuth = (config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
};

API.interceptors.request.use(addAuth);
AI_API.interceptors.request.use(addAuth);

export { API, AI_API };
export default API;
