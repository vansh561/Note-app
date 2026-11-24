const BASE = "/api";

async function request(path, { method = "GET", body } = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(BASE + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = {};
  try { data = await res.json(); } catch { /* empty body */ }
  if (!res.ok) {
    if (res.status === 401) window.dispatchEvent(new Event("bluenote:logout"));
    throw new Error(data.msg || "Something went wrong");
  }
  return data;
}

export const api = {
  login: (email, password) => request("/user/login", { method: "POST", body: { email, password } }),
  register: (username, email, password) => request("/user/register", { method: "POST", body: { username, email, password } }),
  logout: () => request("/user/logout", { method: "POST" }),
  list: () => request("/note/read"),
  create: (n) => request("/note/create", { method: "POST", body: n }),
  update: (id, n) => request(`/note/update/${id}`, { method: "PATCH", body: n }),
  remove: (id) => request(`/note/delete/${id}`, { method: "DELETE" }),
};
