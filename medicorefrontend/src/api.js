import axios from "axios";

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api",
});

export const getDoctors = async () => {
  const response = await API.get("/doctors");
  return response.data;
};

export const getAppointments = async () => {
  const response = await API.get("/appointments");
  return response.data;
};

export const createAppointment = async (appointment) => {
  const response = await API.post(
    "/appointments",
    appointment
  );

  return response.data;
};

export const cancelAppointment = async (id) => {
  const response = await API.patch(
    `/appointments/${id}/cancel`
  );

  return response.data;
};

export const getHealth = async () => {
  const response = await API.get("/health");
  return response.data;
};