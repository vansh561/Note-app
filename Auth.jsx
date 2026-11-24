import { useState } from "react";
import { api } from "./api.js";

export default function Auth({ onAuth, notify }) {
  const [mode, setMode] = useState("login");
  const [f, setF] = useState({ username: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const isReg = mode === "register";

  const login = async () => {
    const d = await api.login(f.email, f.password);
    onAuth(d.token, d.username);
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (isReg) {
        const d = await api.register(f.username, f.email, f.password);
        if (!/success/i.test(d.msg || "")) throw new Error(d.msg || "Could not register");
        notify("Account created — welcome aboard!");
      }
      await login();
    } catch (err) {
      notify(err.message, true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth">
      <section className="hero">
        <div className="drop"><span /></div>
        <h1>Blue<em>Note</em></h1>
        <p>Thoughts, kept afloat. A calm, deep-blue place for everything worth remembering.</p>
        <ul className="pills"><li>Private</li><li>Instant</li><li>Yours</li></ul>
      </section>

      <form className="glass card-auth" onSubmit={submit}>
        <div className={"switch " + mode}>
          <i />
          <button type="button" onClick={() => setMode("login")}>Sign in</button>
          <button type="button" onClick={() => setMode("register")}>Create account</button>
        </div>
        <h2>{isReg ? "Make a splash." : "Welcome back."}</h2>

        {isReg && (
          <label>Username
            <input required value={f.username} onChange={set("username")} placeholder="captain_blue" autoComplete="username" />
          </label>
        )}
        <label>Email
          <input required type="email" value={f.email} onChange={set("email")} placeholder="you@ocean.com" autoComplete="email" />
        </label>
        <label>Password
          <input required type="password" minLength={4} value={f.password} onChange={set("password")} placeholder="••••••••" autoComplete={isReg ? "new-password" : "current-password"} />
        </label>

        <button className="btn primary wide" disabled={busy}>
          {busy ? <span className="spin" /> : isReg ? "Dive in →" : "Sign in →"}
        </button>
      </form>
    </main>
  );
}
