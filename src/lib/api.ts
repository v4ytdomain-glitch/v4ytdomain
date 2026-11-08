const BASE_URL = "http://localhost:8000";

// Helper to get the token from storage
const getToken = () => localStorage.getItem("v4yt_token");

export const api = {
  // GET requests
  get: async (endpoint: string) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        "Authorization": `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error("API Error");
    return res.json();
  },

  // POST requests (JSON)
  post: async (endpoint: string, data: any) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.detail || "API Error");
    return json;
  },

  put: async (endpoint: string, data: any) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.detail || "Update failed");
    return json;
  },

  // FastAPI Login requires Form Data, not JSON
  login: async (data: URLSearchParams) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: data,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.detail || "Login failed");
    return json;
  }
};