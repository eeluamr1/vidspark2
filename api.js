const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export function getToken() {
  return localStorage.getItem("vidspark_token") || "";
}
export function setToken(t) {
  localStorage.setItem("vidspark_token", t);
}

async function req(path, opts={}) {
  const headers = opts.headers || {};
  if (!headers["Content-Type"] && !(opts.body instanceof FormData)) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  const data = await res.json().catch(()=> ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || "Request failed"), { status: res.status, data });
  return data;
}

export const api = {
  register: (username, password, displayName) => req("/api/auth/register", { method:"POST", body: JSON.stringify({ username, password, displayName })}),
  login: (username, password) => req("/api/auth/login", { method:"POST", body: JSON.stringify({ username, password })}),
  feed: (q="") => req(`/api/videos${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  video: (id) => req(`/api/videos/${id}`),
  like: (id) => req(`/api/videos/${id}/like`, { method:"POST" }),
  unlike: (id) => req(`/api/videos/${id}/like`, { method:"DELETE" }),
  comment: (id, text) => req(`/api/videos/${id}/comment`, { method:"POST", body: JSON.stringify({ text })}),
  uploadVideo: (file, caption="", hashtags="") => {
    const fd = new FormData();
    fd.append("video", file);
    fd.append("caption", caption);
    fd.append("hashtags", hashtags);
    return req("/api/videos/upload", { method:"POST", body: fd, headers: {} });
  },
  generate: ({ images, audio, caption="", hashtags="", secondsPerImage="2" }) => {
    const fd = new FormData();
    images.forEach(img => fd.append("images", img));
    if (audio) fd.append("audio", audio);
    fd.append("caption", caption);
    fd.append("hashtags", hashtags);
    fd.append("secondsPerImage", secondsPerImage);
    return req("/api/videos/generate", { method:"POST", body: fd, headers: {} });
  },
  apiBase: API_BASE
};
