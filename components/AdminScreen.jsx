"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { IMAGE_GROUPS, IMAGE_SLOTS } from "@/lib/images";
import { KEYWORD_IDS } from "@/lib/content";

const PW_KEY = "vy-admin-pw";

const EMPTY_ENTRY = {
  id: null,
  title: "",
  category: "academic",
  role: "",
  period: "",
  sort_date: "",
  summary: "",
  body: "",
  highlights: "",
  images: [],
  photo_slots: [],
  links: [],
  in_portfolio: true,
  published: true,
};

const TABS = [
  ["activities", "Activities"],
  ["sections", "Sections & keywords"],
  ["numbers", "Numbers"],
  ["images", "Images"],
  ["text", "Text"],
];

export default function AdminScreen() {
  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState("activities");
  const [entries, setEntries] = useState([]);
  const [settings, setSettings] = useState(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  /* ------------------------------ loading ------------------------------ */
  const load = useCallback(async (password) => {
    const [er, sr] = await Promise.all([
      fetch("/api/entries/admin", { headers: { "x-admin-password": password }, cache: "no-store" }),
      fetch("/api/settings", { cache: "no-store" }),
    ]);
    if (er.status === 401) {
      setMsg("Wrong password.");
      setAuthed(false);
      return false;
    }
    if (er.status === 503) {
      setMsg("Supabase isn't configured yet — see the README.");
      return false;
    }
    const ed = await er.json();
    const sd = await sr.json();
    if (!ed.ok) {
      setMsg(ed.reason || "Something went wrong.");
      return false;
    }
    setEntries(ed.entries);
    setSettings(sd.settings);
    setAuthed(true);
    setMsg("");
    return true;
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem(PW_KEY);
    if (saved) {
      setPw(saved);
      load(saved);
    }
  }, [load]);

  async function submitPw(e) {
    e.preventDefault();
    if (await load(pw)) sessionStorage.setItem(PW_KEY, pw);
  }

  /* ------------------------------ saving ------------------------------- */
  const saveSettings = useCallback(
    async (next) => {
      setBusy(true);
      setSettings(next);
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-password": pw },
        body: JSON.stringify({ settings: next }),
      });
      const data = await res.json();
      setBusy(false);
      setMsg(data.ok ? "Saved." : `Save failed: ${data.reason}`);
      setTimeout(() => setMsg(""), 3500);
    },
    [pw]
  );

  async function uploadOne(file) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "x-admin-password": pw },
      body: fd,
    });
    const data = await res.json();
    if (!data.ok) {
      setMsg(`Upload failed: ${data.reason}`);
      return null;
    }
    return data.url;
  }

  /* ------------------------------ login ------------------------------ */
  if (!authed) {
    return (
      <main className="grid min-h-screen place-items-center bg-paper px-6 pt-16">
        <form onSubmit={submitPw} className="w-full max-w-sm">
          <p className="eyebrow text-azure">Private</p>
          <h1 className="display mt-3 text-[30px] text-navy">Your library</h1>
          <p className="mt-3 text-[13.5px] leading-relaxed text-navy-soft">
            Everything on the site — activities, sections, numbers, images and copy — is edited here.
          </p>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Password"
            className="mt-7 w-full border-b border-navy/25 bg-transparent pb-2 text-[15px] text-navy outline-none focus:border-azure"
          />
          {msg && <p className="mt-3 text-[13px] text-azure">{msg}</p>}
          <button
            type="submit"
            className="mt-7 w-full rounded-full bg-navy px-6 py-3 text-[11.5px] font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-azure"
          >
            Enter
          </button>
          <Link
            href="/portfolio"
            className="link-underline mt-6 inline-block text-[11px] uppercase tracking-[0.16em] text-navy-soft"
          >
            ← Back to the portfolio
          </Link>
        </form>
      </main>
    );
  }

  if (!settings) return null;

  /* ------------------------------ shell ------------------------------ */
  return (
    <main className="min-h-screen bg-paper pt-16">
      <div className="sticky top-16 z-30 border-b border-navy-line bg-white">
        <div className="wrap flex items-center gap-1 overflow-x-auto py-3">
          {TABS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`shrink-0 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors ${
                tab === id ? "bg-navy text-white" : "text-navy-soft hover:text-azure"
              }`}
            >
              {label}
            </button>
          ))}
          <span className="ml-auto shrink-0 text-[12px] text-azure">{busy ? "Saving…" : msg}</span>
        </div>
      </div>

      <div className="wrap py-10 md:py-14">
        {tab === "activities" && (
          <Activities
            pw={pw}
            entries={entries}
            settings={settings}
            reload={() => load(pw)}
            setMsg={setMsg}
            uploadOne={uploadOne}
          />
        )}
        {tab === "sections" && <Sections settings={settings} save={saveSettings} />}
        {tab === "numbers" && <Numbers settings={settings} save={saveSettings} />}
        {tab === "images" && (
          <Images settings={settings} save={saveSettings} uploadOne={uploadOne} />
        )}
        {tab === "text" && <TextTab settings={settings} save={saveSettings} />}
      </div>
    </main>
  );
}

/* ========================================================================== */
/*  1. ACTIVITIES                                                             */
/* ========================================================================== */
function Activities({ pw, entries, settings, reload, setMsg, uploadOne }) {
  const [form, setForm] = useState(EMPTY_ENTRY);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  const cats = settings.categories;

  const set = (k) => (e) =>
    setForm((f) => ({
      ...f,
      [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  async function addImages(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    setBusy(true);
    const urls = [];
    for (const f of files) {
      const url = await uploadOne(f);
      if (url) urls.push(url);
    }
    setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
    setBusy(false);
  }

  async function save(e) {
    e.preventDefault();
    if (!form.title.trim()) return setMsg("A title is required.");
    setBusy(true);
    const payload = {
      ...form,
      highlights: form.highlights.split("\n").map((s) => s.trim()).filter(Boolean),
      links: form.links.filter((l) => l.url?.trim()),
    };
    const res = await fetch("/api/entries/admin", {
      method: form.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": pw },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setBusy(false);
    if (!data.ok) return setMsg(`Save failed: ${data.reason}`);
    setForm(EMPTY_ENTRY);
    setMsg(form.id ? "Updated." : "Added.");
    reload();
  }

  function edit(row) {
    setForm({
      id: row.id,
      title: row.title || "",
      category: row.category || cats[0]?.id,
      role: row.role || "",
      period: row.period || "",
      sort_date: row.sort_date || "",
      summary: row.summary || "",
      body: row.body || "",
      highlights: (row.highlights || []).join("\n"),
      images: row.images || [],
      photo_slots: row.photo_slots || [],
      links: row.links || [],
      in_portfolio: row.in_portfolio !== false,
      published: row.published !== false,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function toggle(row, field) {
    await fetch("/api/entries/admin", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-password": pw },
      body: JSON.stringify({ id: row.id, [field]: !row[field] }),
    });
    reload();
  }

  async function remove(row) {
    if (!confirm(`Delete “${row.title}” permanently?`)) return;
    await fetch("/api/entries/admin", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "x-admin-password": pw },
      body: JSON.stringify({ id: row.id }),
    });
    reload();
  }

  async function importSeed() {
    if (!confirm("Copy the 13 CV activities into the database so you can edit them here?")) return;
    setBusy(true);
    const res = await fetch("/api/entries/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": pw },
      body: JSON.stringify({ action: "import_seed" }),
    });
    const data = await res.json();
    setBusy(false);
    setMsg(data.ok ? `Imported ${data.imported} activities.` : `Failed: ${data.reason}`);
    reload();
  }

  return (
    <>
      {!settings.seedImported && (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-[5px] border border-azure/40 bg-paper-200 p-5">
          <p className="max-w-xl text-[13.5px] leading-relaxed text-navy">
            The 13 activities from your CV currently live in the code, so they show on the site but
            can&apos;t be edited here. Import them once and they become fully editable.
          </p>
          <button
            type="button"
            onClick={importSeed}
            disabled={busy}
            className="shrink-0 rounded-full bg-navy px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-azure disabled:opacity-50"
          >
            Import CV activities
          </button>
        </div>
      )}

      <h1 className="display text-[30px] text-navy">
        {form.id ? "Edit activity" : "Add an activity"}
      </h1>

      <form
        onSubmit={save}
        className="mt-6 grid gap-6 rounded-[6px] border border-navy-line bg-white p-6 md:grid-cols-2 md:p-8"
      >
        <Field label="Title *" value={form.title} onChange={set("title")} placeholder="Organisation or programme" />

        <Select label="Section *" value={form.category} onChange={set("category")}>
          {cats.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </Select>

        <Field label="Role / subtitle" value={form.role} onChange={set("role")} placeholder="Project Management Assistant" />
        <Field label="Period (shown on the card)" value={form.period} onChange={set("period")} placeholder="Dec 2024 – Dec 2025" />

        <label className="block">
          <span className="eyebrow text-navy-soft">Start date (for ordering)</span>
          <input
            type="date"
            value={form.sort_date}
            onChange={set("sort_date")}
            className="mt-2.5 w-full border-b border-navy/25 bg-transparent pb-2 text-[15px] text-navy outline-none focus:border-azure"
          />
        </label>

        <div className="flex items-end gap-6">
          <Check label="Published" checked={form.published} onChange={set("published")} />
          <Check label="Show on portfolio" checked={form.in_portfolio} onChange={set("in_portfolio")} />
        </div>

        <Field
          className="md:col-span-2"
          label="Summary (one or two lines, shown on the card)"
          value={form.summary}
          onChange={set("summary")}
        />

        <Area className="md:col-span-2" label="Story (shown inside the pop-up)" rows={4} value={form.body} onChange={set("body")} />

        <Area
          className="md:col-span-2"
          label="Highlights — one bullet per line"
          rows={4}
          value={form.highlights}
          onChange={set("highlights")}
          placeholder={"Recruited and trained 35 new members in 8 months.\nRestored 9 consecutive issues."}
        />

        <div className="md:col-span-2">
          <span className="eyebrow text-navy-soft">Photographs</span>
          <div className="mt-3 flex flex-wrap gap-3">
            {form.images.map((url, i) => (
              <Thumb
                key={url}
                src={url}
                onRemove={() => setForm((f) => ({ ...f, images: f.images.filter((_, j) => j !== i) }))}
              />
            ))}
            {form.photo_slots.map((k, i) => (
              <div
                key={k}
                className="relative grid h-24 w-32 place-items-center rounded-[3px] border border-dashed border-navy/25 px-2 text-center text-[10px] text-navy-soft"
              >
                slot: {k}
                <button
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, photo_slots: f.photo_slots.filter((_, j) => j !== i) }))
                  }
                  className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-navy/80 text-[11px] text-white"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="grid h-24 w-32 place-items-center rounded-[3px] border border-dashed border-navy/30 text-[12px] text-navy-soft transition hover:border-azure hover:text-azure disabled:opacity-50"
            >
              {busy ? "Uploading…" : "+ Add images"}
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={addImages} className="hidden" />
        </div>

        <LinkEditor
          className="md:col-span-2"
          links={form.links}
          setLinks={(links) => setForm((f) => ({ ...f, links }))}
        />

        <div className="flex flex-wrap items-center gap-4 md:col-span-2">
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-navy px-8 py-3.5 text-[11.5px] font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-azure disabled:opacity-50"
          >
            {form.id ? "Save changes" : "Add activity"}
          </button>
          {form.id && (
            <button
              type="button"
              onClick={() => setForm(EMPTY_ENTRY)}
              className="text-[12px] font-semibold uppercase tracking-[0.14em] text-navy-soft hover:text-azure"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2 className="display mt-14 text-[24px] text-navy">
        Your library <span className="text-navy-soft">· {entries.length}</span>
      </h2>
      {entries.length === 0 ? (
        <p className="mt-4 text-[14px] text-navy-soft">Nothing in the database yet.</p>
      ) : (
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {entries.map((row) => (
            <article
              key={row.id}
              className={`rounded-[5px] border p-5 ${
                row.published ? "border-navy-line bg-white" : "border-azure/40 bg-paper-200"
              }`}
            >
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-azure">
                {settings.categories.find((c) => c.id === row.category)?.label ?? row.category} ·{" "}
                {row.period || "—"}
              </p>
              <h3 className="mt-2 font-display text-[19px] text-navy">{row.title}</h3>
              {row.role && <p className="display-italic text-[15px] text-navy-soft">{row.role}</p>}
              <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.12em]">
                <button type="button" onClick={() => edit(row)} className="rounded-full border border-navy px-3 py-1.5 text-navy transition hover:bg-navy hover:text-white">
                  Edit
                </button>
                <button type="button" onClick={() => toggle(row, "in_portfolio")} className="rounded-full border border-navy/30 px-3 py-1.5 text-navy-soft transition hover:border-azure hover:text-azure">
                  {row.in_portfolio !== false ? "On portfolio" : "Archive only"}
                </button>
                <button type="button" onClick={() => toggle(row, "published")} className="rounded-full border border-navy/30 px-3 py-1.5 text-navy-soft transition hover:border-azure hover:text-azure">
                  {row.published ? "Visible" : "Hidden"}
                </button>
                <button type="button" onClick={() => remove(row)} className="rounded-full border border-azure/40 px-3 py-1.5 text-azure transition hover:bg-azure hover:text-white">
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

/* ========================================================================== */
/*  2. SECTIONS & KEYWORDS                                                    */
/* ========================================================================== */
function Sections({ settings, save }) {
  const [draft, setDraft] = useState(settings);
  const upd = (i, patch) =>
    setDraft((d) => ({
      ...d,
      categories: d.categories.map((c, j) => (j === i ? { ...c, ...patch } : c)),
    }));
  const updKeyword = (i, patch) =>
    setDraft((d) => ({
      ...d,
      keywords: d.keywords.map((k, j) => (j === i ? { ...k, ...patch } : k)),
    }));

  return (
    <>
      <h1 className="display text-[30px] text-navy">Sections & keywords</h1>
      <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-navy-soft">
        Each section can be filed under one keyword — that decides which keyword page it appears on.
        Leave the keyword blank and the section still shows on the portfolio, just at the bottom.
      </p>

      <h2 className="display mt-10 text-[22px] text-navy">The three keywords</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {draft.keywords.map((k, i) => (
          <div key={k.id} className="rounded-[5px] border border-navy-line bg-white p-5">
            <p className="eyebrow text-azure">{k.id}</p>
            <Field label="Word" value={k.word} onChange={(e) => updKeyword(i, { word: e.target.value })} />
            <Field label="One-liner" value={k.line} onChange={(e) => updKeyword(i, { line: e.target.value })} className="mt-4" />
            <Area label="Intro on its page" rows={3} value={k.lead || ""} onChange={(e) => updKeyword(i, { lead: e.target.value })} className="mt-4" />
          </div>
        ))}
      </div>

      <h2 className="display mt-12 text-[22px] text-navy">Sections</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {draft.categories.map((c, i) => (
          <div key={c.id} className="rounded-[5px] border border-navy-line bg-white p-5">
            <p className="eyebrow text-navy-soft">{c.id}</p>
            <Field label="Name" value={c.label} onChange={(e) => upd(i, { label: e.target.value })} />
            <Area label="Description" rows={2} value={c.blurb} onChange={(e) => upd(i, { blurb: e.target.value })} className="mt-4" />
            <Select label="Belongs to keyword" value={c.keyword || ""} onChange={(e) => upd(i, { keyword: e.target.value })} className="mt-4">
              <option value="">— none (shows at the bottom) —</option>
              {KEYWORD_IDS.map((id) => (
                <option key={id} value={id}>
                  {draft.keywords.find((k) => k.id === id)?.word ?? id}
                </option>
              ))}
            </Select>
          </div>
        ))}
      </div>

      <SaveBar onSave={() => save(draft)} onReset={() => setDraft(settings)} />
    </>
  );
}

/* ========================================================================== */
/*  3. NUMBERS                                                                */
/* ========================================================================== */
function Numbers({ settings, save }) {
  const [draft, setDraft] = useState(settings);

  const setHome = (i, patch) =>
    setDraft((d) => ({
      ...d,
      home: { ...d.home, stats: d.home.stats.map((s, j) => (j === i ? { ...s, ...patch } : s)) },
    }));

  const setCat = (ci, i, patch) =>
    setDraft((d) => ({
      ...d,
      categories: d.categories.map((c, j) =>
        j === ci ? { ...c, stats: c.stats.map((s, k) => (k === i ? { ...s, ...patch } : s)) } : c
      ),
    }));

  return (
    <>
      <h1 className="display text-[30px] text-navy">Numbers</h1>
      <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-navy-soft">
        These count up from zero when someone scrolls to them. Write the value exactly as it should
        appear — <code className="rounded bg-navy/10 px-1">2,000+</code>,{" "}
        <code className="rounded bg-navy/10 px-1">3.69/4.0</code> and{" "}
        <code className="rounded bg-navy/10 px-1">100%</code> all work.
      </p>

      <h2 className="display mt-10 text-[22px] text-navy">Home page</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {draft.home.stats.map((s, i) => (
          <StatRow key={i} stat={s} onChange={(patch) => setHome(i, patch)} />
        ))}
      </div>

      {draft.categories.map((c, ci) => (
        <div key={c.id}>
          <h2 className="display mt-12 text-[22px] text-navy">{c.label}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {(c.stats || []).map((s, i) => (
              <StatRow key={i} stat={s} onChange={(patch) => setCat(ci, i, patch)} />
            ))}
          </div>
        </div>
      ))}

      <SaveBar onSave={() => save(draft)} onReset={() => setDraft(settings)} />
    </>
  );
}

function StatRow({ stat, onChange }) {
  return (
    <div className="flex gap-4 rounded-[5px] border border-navy-line bg-white p-4">
      <input
        value={stat.value}
        onChange={(e) => onChange({ value: e.target.value })}
        className="w-32 shrink-0 border-b border-navy/25 bg-transparent pb-1 font-display text-[22px] text-azure outline-none focus:border-azure"
      />
      <input
        value={stat.label}
        onChange={(e) => onChange({ label: e.target.value })}
        className="flex-1 border-b border-navy/25 bg-transparent pb-1 text-[14px] text-navy outline-none focus:border-azure"
      />
    </div>
  );
}

/* ========================================================================== */
/*  4. IMAGES                                                                 */
/* ========================================================================== */
function Images({ settings, save, uploadOne }) {
  const [draft, setDraft] = useState(settings);
  const [busySlot, setBusySlot] = useState(null);
  const inputs = useRef({});

  const cfgOf = (key) =>
    draft.images?.[key] ||
    settings.resolvedImages?.[key] ||
    IMAGE_SLOTS.find((s) => s.key === key) || { x: 50, y: 50, zoom: 1 };

  const patch = (key, p) =>
    setDraft((d) => ({ ...d, images: { ...(d.images || {}), [key]: { ...cfgOf(key), ...p } } }));

  async function pick(key, file) {
    if (!file) return;
    setBusySlot(key);
    const url = await uploadOne(file);
    if (url) patch(key, { src: url, x: 50, y: 50, zoom: 1 });
    setBusySlot(null);
  }

  return (
    <>
      <h1 className="display text-[30px] text-navy">Images</h1>
      <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-navy-soft">
        Upload a picture, then nudge the framing. These replace the placeholder files for everyone —
        no code, no redeploy.
      </p>

      {IMAGE_GROUPS.map((group) => (
        <div key={group.name}>
          <h2 className="display mt-10 text-[20px] text-navy">{group.name}</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {group.slots.map((slot) => {
              const cfg = cfgOf(slot.key);
              return (
                <div key={slot.key} className="rounded-[5px] border border-navy-line bg-white p-4">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[3px] bg-paper-300">
                    {cfg.src && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={cfg.src}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                        style={{
                          objectPosition: `${cfg.x}% ${cfg.y}%`,
                          transform: `scale(${cfg.zoom})`,
                          transformOrigin: `${cfg.x}% ${cfg.y}%`,
                        }}
                      />
                    )}
                  </div>
                  <p className="mt-3 text-[13px] font-semibold text-navy">{slot.label}</p>
                  <p className="mt-0.5 text-[11.5px] leading-snug text-navy-soft">{slot.hint}</p>

                  <button
                    type="button"
                    onClick={() => inputs.current[slot.key]?.click()}
                    disabled={busySlot === slot.key}
                    className="mt-3 w-full rounded-[3px] bg-navy px-3 py-2 text-[11.5px] font-semibold text-white transition hover:bg-azure disabled:opacity-50"
                  >
                    {busySlot === slot.key ? "Uploading…" : "Replace image"}
                  </button>
                  <input
                    ref={(el) => (inputs.current[slot.key] = el)}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      e.target.value = "";
                      pick(slot.key, f);
                    }}
                    className="hidden"
                  />

                  <div className="mt-3 space-y-2">
                    <Range label="Horizontal" value={cfg.x} min={0} max={100} onChange={(v) => patch(slot.key, { x: v })} />
                    <Range label="Vertical" value={cfg.y} min={0} max={100} onChange={(v) => patch(slot.key, { y: v })} />
                    <Range
                      label="Zoom"
                      value={Math.round(cfg.zoom * 100)}
                      min={100}
                      max={260}
                      onChange={(v) => patch(slot.key, { zoom: v / 100 })}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <SaveBar onSave={() => save(draft)} onReset={() => setDraft(settings)} />
    </>
  );
}

function Range({ label, value, min, max, onChange }) {
  return (
    <label className="block">
      <span className="flex items-center justify-between text-[11.5px] text-navy-soft">
        {label}
        <span className="tabular-nums text-navy">{value}</span>
      </span>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-1 w-full" />
    </label>
  );
}

/* ========================================================================== */
/*  5. TEXT                                                                   */
/* ========================================================================== */
function TextTab({ settings, save }) {
  const [draft, setDraft] = useState(settings);
  const setIn = (group, key) => (e) =>
    setDraft((d) => ({ ...d, [group]: { ...d[group], [key]: e.target.value } }));

  return (
    <>
      <h1 className="display text-[30px] text-navy">Text</h1>

      <h2 className="display mt-10 text-[22px] text-navy">Home</h2>
      <div className="mt-5 grid gap-6 rounded-[6px] border border-navy-line bg-white p-6">
        <Field label="Eyebrow (small line above your name)" value={draft.home.eyebrow} onChange={setIn("home", "eyebrow")} />
        <Field label="Hook (the big italic line)" value={draft.home.hook} onChange={setIn("home", "hook")} />
        <Area label="Introduction" rows={5} value={draft.home.intro} onChange={setIn("home", "intro")} />
        <Field label="Heading above the keywords" value={draft.home.keywordsLabel} onChange={setIn("home", "keywordsLabel")} />
        <Area
          label="Scrolling strip — one item per line"
          rows={5}
          value={(draft.home.marquee || []).join("\n")}
          onChange={(e) =>
            setDraft((d) => ({
              ...d,
              home: { ...d.home, marquee: e.target.value.split("\n").map((x) => x.trim()).filter(Boolean) },
            }))
          }
        />
      </div>

      <h2 className="display mt-12 text-[22px] text-navy">Contact</h2>
      <div className="mt-5 grid gap-6 rounded-[6px] border border-navy-line bg-white p-6">
        <Field label="Eyebrow" value={draft.contact.eyebrow} onChange={setIn("contact", "eyebrow")} />
        <Field label="Title" value={draft.contact.title} onChange={setIn("contact", "title")} />
        <Area label="Intro" rows={3} value={draft.contact.lead} onChange={setIn("contact", "lead")} />
        <Area label="Currently (availability)" rows={3} value={draft.contact.availability} onChange={setIn("contact", "availability")} />
      </div>

      <h2 className="display mt-12 text-[22px] text-navy">Details & links</h2>
      <div className="mt-5 grid gap-6 rounded-[6px] border border-navy-line bg-white p-6 md:grid-cols-2">
        <Field label="Name as signature" value={draft.profile.signature} onChange={setIn("profile", "signature")} />
        <Field label="Field" value={draft.profile.field} onChange={setIn("profile", "field")} />
        <Field label="Class of" value={draft.profile.since} onChange={setIn("profile", "since")} />
        <Field label="Location" value={draft.profile.location} onChange={setIn("profile", "location")} />
        <Field label="Email" value={draft.profile.email} onChange={setIn("profile", "email")} />
        <Field label="Phone (shown)" value={draft.profile.phone} onChange={setIn("profile", "phone")} />
        <Field label="Phone (dial)" value={draft.profile.phoneHref} onChange={setIn("profile", "phoneHref")} />
        <div />
        <Field label="LinkedIn name" value={draft.profile.linkedinLabel} onChange={setIn("profile", "linkedinLabel")} />
        <Field label="LinkedIn URL" value={draft.profile.linkedinUrl} onChange={setIn("profile", "linkedinUrl")} />
        <Field label="Facebook name" value={draft.profile.facebookLabel} onChange={setIn("profile", "facebookLabel")} />
        <Field label="Facebook URL" value={draft.profile.facebookUrl} onChange={setIn("profile", "facebookUrl")} />
      </div>

      <SaveBar onSave={() => save(draft)} onReset={() => setDraft(settings)} />
    </>
  );
}

/* ========================================================================== */
/*  Shared bits                                                               */
/* ========================================================================== */
function SaveBar({ onSave, onReset }) {
  return (
    <div className="sticky bottom-0 mt-10 flex flex-wrap items-center gap-4 border-t border-navy-line bg-paper/95 py-5 backdrop-blur">
      <button
        type="button"
        onClick={onSave}
        className="rounded-full bg-navy px-8 py-3.5 text-[11.5px] font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-azure"
      >
        Save changes
      </button>
      <button
        type="button"
        onClick={onReset}
        className="text-[12px] font-semibold uppercase tracking-[0.14em] text-navy-soft hover:text-azure"
      >
        Undo
      </button>
    </div>
  );
}

function Field({ label, className = "", ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className="eyebrow text-navy-soft">{label}</span>
      <input
        {...props}
        className="mt-2.5 w-full border-b border-navy/25 bg-transparent pb-2 text-[15px] text-navy outline-none transition-colors placeholder:text-navy-soft/45 focus:border-azure"
      />
    </label>
  );
}

function Area({ label, className = "", rows = 3, ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className="eyebrow text-navy-soft">{label}</span>
      <textarea
        rows={rows}
        {...props}
        className="mt-2.5 w-full resize-y border-b border-navy/25 bg-transparent pb-2 text-[15px] leading-relaxed text-navy outline-none transition-colors placeholder:text-navy-soft/45 focus:border-azure"
      />
    </label>
  );
}

function Select({ label, className = "", children, ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className="eyebrow text-navy-soft">{label}</span>
      <select
        {...props}
        className="mt-2.5 w-full border-b border-navy/25 bg-transparent pb-2 text-[15px] text-navy outline-none focus:border-azure"
      >
        {children}
      </select>
    </label>
  );
}

function Check({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-[13px] text-navy">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 accent-navy" />
      {label}
    </label>
  );
}

function Thumb({ src, onRemove }) {
  return (
    <div className="relative h-24 w-32 overflow-hidden rounded-[3px] ring-1 ring-navy/10">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="h-full w-full object-cover" />
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-navy/85 text-[12px] text-white"
        aria-label="Remove"
      >
        ×
      </button>
    </div>
  );
}

function LinkEditor({ links, setLinks, className = "" }) {
  return (
    <div className={className}>
      <span className="eyebrow text-navy-soft">Links</span>
      <div className="mt-3 space-y-3">
        {links.map((l, i) => (
          <div key={i} className="flex gap-3">
            <input
              value={l.label || ""}
              onChange={(e) => setLinks(links.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
              placeholder="Label"
              className="w-40 border-b border-navy/25 bg-transparent pb-2 text-[14px] text-navy outline-none focus:border-azure"
            />
            <input
              value={l.url || ""}
              onChange={(e) => setLinks(links.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))}
              placeholder="https://…"
              className="flex-1 border-b border-navy/25 bg-transparent pb-2 text-[14px] text-navy outline-none focus:border-azure"
            />
            <button type="button" onClick={() => setLinks(links.filter((_, j) => j !== i))} className="text-[13px] text-navy-soft hover:text-azure">
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setLinks([...links, { label: "", url: "" }])}
          className="text-[12px] font-semibold uppercase tracking-[0.14em] text-azure"
        >
          + Add a link
        </button>
      </div>
    </div>
  );
}
