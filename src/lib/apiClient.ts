import axios from "axios";

const rawUrl = import.meta.env.VITE_API_URL;
const baseURL = rawUrl ? rawUrl.trim() : "";

export const apiClient = axios.create({ baseURL });
