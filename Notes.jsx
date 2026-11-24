import { useState, useEffect, useMemo } from "react";
import { api } from "./api.js";

const SHADES = ["#2f6bff", "#4f8bff", "#22b8ff", "#5ce1ff", "#6a7bff", "#1f4fd8"];
const hue = (id = "") => SHADES[[...id].reduce((a, c) => a + c.charCodeAt(0), 0) % SHADES.length];
const when = (d) => new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
const greet = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"; };

export default function Notes({ user, onLogout, notify }) {
  const [notes, setNotes] = useState(null);
  const [q, setQ] = useState("");
  const [editor, setEditor] = useState(null); // null | {} (new) | note (edit)
  const [confirm, setConfirm] = useState(null);

  const load = async () => {
    try { setNotes((await api.list()).notes); }
    catch (e) { notify(e.message, true); setNotes([]); }
  };
  useEffect(() => { load(); }, []);

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    const list = [...(notes || [])].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    return s ? list.filter((n) => (n.title + n.content).toLowerCase().includes(s)) : list;
  }, [notes, q]);

  const save = async (data) => {
    try {
      if (editor._id) {
        const d = await api.update(editor._id, data);
        setNotes((ns) => ns.map((n) => (n._id === editor._id ? d.updatedNote : n)));
        notify("Note updated");
      } else {
        const d = await api.create(data);
        setNotes((ns) => [d.note, ...ns]);
        notify("Note floated to the top ✨");
      }
      setEditor(null);
    } catch (e) { notify(e.message, true); }
  };

  const del = async (id) => {
    try {
      await api.remove(id);
      setNotes((ns) => ns.filter((n) => n._id !== id));
      notify("Note sunk to the deep");
    } catch (e) { notify(e.message, true); }
    setConfirm(null);
  };

  return (
    <div className="shell">
      <header className="top glass">
        <div className="brand"><b className="mini-drop" />Blue<em>Note</em></div>
        <div className="who"><span className="avatar">{user[0]?.toUpperCase()}</span>{user}</div>
        <button className="btn ghost" onClick={onLogout}>Sign out</button>
      </header>

      <section className="intro">
        <p className="eyebrow">{greet()}, {user}</p>
        <h1>{notes?.length ? <>You have <em>{notes.length}</em> {notes.length === 1 ? "thought" : "thoughts"} afloat.</> : <>A clear, <em>blue</em> page awaits.</>}</h1>
        <div className="tools">
          <div className="search glass">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <input placeholder="Search your notes…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <button className="btn primary" onClick={() => setEditor({})}>+ New note</button>
        </div>
      </section>

      {notes === null ? (
        <div className="grid">{[0, 1, 2].map((i) => <div key={i} className="note skeleton" />)}</div>
      ) : shown.length === 0 ? (
        <div className="empty glass">
          <div className="drop big"><span /></div>
          <h3>{q ? "Nothing matches that search" : "No notes yet"}</h3>
          <p>{q ? "Try a different word." : "Capture your first idea — it only takes a second."}</p>
          {!q && <button className="btn primary" onClick={() => setEditor({})}>Write a note</button>}
        </div>
      ) : (
        <div className="grid">
          {shown.map((n, i) => (
            <article key={n._id} className="note glass" style={{ "--c": hue(n._id), animationDelay: `${i * 55}ms` }}>
              <div className="meta"><span>{when(n.updatedAt || n.createdAt)}</span></div>
              <h3>{n.title}</h3>
              <p>{n.content}</p>
              <div className="actions">
                {confirm === n._id ? (
                  <>
                    <span className="sure">Delete?</span>
                    <button className="chip danger" onClick={() => del(n._id)}>Yes</button>
                    <button className="chip" onClick={() => setConfirm(null)}>No</button>
                  </>
                ) : (
                  <>
                    <button className="chip" onClick={() => setEditor(n)}>Edit</button>
                    <button className="chip" onClick={() => setConfirm(n._id)}>Delete</button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <button className="fab" aria-label="New note" onClick={() => setEditor({})}>+</button>
      {editor && <Editor note={editor} onClose={() => setEditor(null)} onSave={save} />}
    </div>
  );
}

function Editor({ note, onClose, onSave }) {
  const [title, setTitle] = useState(note.title || "");
  const [content, setContent] = useState(note.content || "");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    await onSave({ title: title.trim(), content: content.trim() });
    setBusy(false);
  };

  return (
    <div className="scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="glass modal" onSubmit={submit}>
        <h2>{note._id ? "Edit note" : "New note"}</h2>
        <input autoFocus required className="t" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea required rows={8} placeholder="Start writing…" value={content} onChange={(e) => setContent(e.target.value)} />
        <div className="row">
          <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={busy}>{busy ? <span className="spin" /> : note._id ? "Save changes" : "Create note"}</button>
        </div>
      </form>
    </div>
  );
}
