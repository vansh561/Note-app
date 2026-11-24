import { useState, useEffect, useCallback } from "react";
import { api } from "./api.js";
import Auth from "./Auth.jsx";
import Notes from "./Notes.jsx";

export default function App() {
  const [user, setUser] = useState(() =>
    localStorage.getItem("token") ? localStorage.getItem("username") : null
  );
  const [toast, setToast] = useState(null);

  const notify = useCallback((msg, bad = false) => {
    setToast({ msg, bad, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  const signOut = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setUser(null);
  }, []);

  useEffect(() => {
    window.addEventListener("bluenote:logout", signOut);
    return () => window.removeEventListener("bluenote:logout", signOut);
  }, [signOut]);

  const onAuth = (token, username) => {
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
    setUser(username);
  };

  const logout = async () => {
    try { await api.logout(); } catch { /* token is dropped locally either way */ }
    signOut();
    notify("Signed out. Stay hydrated 💧");
  };

  return (
    <>
      <div className="ocean" aria-hidden="true">
        <i className="blob b1" /><i className="blob b2" /><i className="blob b3" />
        <span className="grain" />
      </div>
      {user ? <Notes user={user} onLogout={logout} notify={notify} /> : <Auth onAuth={onAuth} notify={notify} />}
      {toast && <div key={toast.id} className={"toast" + (toast.bad ? " bad" : "")}>{toast.msg}</div>}
    </>
  );
}
