'use client';

/**
 * Build log admin — create, edit, publish-toggle, and delete entries that
 * back the public /built page. Inline form (no modal) so the whole thing
 * lives in one tab.
 *
 * Image flow: paste a public URL (imgur, imgbb, Twitter media, etc.) into
 * the Image URL field. No upload UI yet — that's a deliberate v1 scope cut
 * (see plan: tell-me-where-you-re-radiant-graham.md).
 * Loom flow: paste any Loom share URL or the bare 32-hex id; the public page
 * normalizes it to an embed.
 */

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { slugify } from '@/lib/buildlog';

export type BuildLogRow = {
  id: string;
  slug: string;
  title: string;
  date: string;
  body: string;
  imageUrl: string | null;
  imageAlt: string | null;
  loomUrl: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

type FormState = {
  id: string | null; // null = creating, string = editing
  title: string;
  slug: string;
  date: string; // YYYY-MM-DD (local input value)
  body: string;
  imageUrl: string;
  imageAlt: string;
  loomUrl: string;
  published: boolean;
};

const EMPTY_FORM = (): FormState => ({
  id: null,
  title: '',
  slug: '',
  date: new Date().toISOString().slice(0, 10),
  body: '',
  imageUrl: '',
  imageAlt: '',
  loomUrl: '',
  published: false,
});

export default function AdminBuildLogTable({ entries }: { entries: BuildLogRow[] }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);

  function openCreate() {
    setForm(EMPTY_FORM());
    setSlugTouched(false);
    setErr(null);
  }

  function openEdit(row: BuildLogRow) {
    setForm({
      id: row.id,
      title: row.title,
      slug: row.slug,
      date: row.date.slice(0, 10),
      body: row.body,
      imageUrl: row.imageUrl ?? '',
      imageAlt: row.imageAlt ?? '',
      loomUrl: row.loomUrl ?? '',
      published: row.published,
    });
    setSlugTouched(true);
    setErr(null);
  }

  function close() {
    setForm(null);
    setErr(null);
  }

  function patchForm(partial: Partial<FormState>) {
    setForm((prev) => (prev ? { ...prev, ...partial } : prev));
  }

  async function save() {
    if (!form || busy) return;
    setBusy(true);
    setErr(null);

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim() || slugify(form.title),
      // Date input gives YYYY-MM-DD; pin to noon UTC so it sorts cleanly
      // regardless of viewer timezone and never flips to the wrong day.
      date: new Date(`${form.date}T12:00:00.000Z`).toISOString(),
      body: form.body.trim(),
      imageUrl: form.imageUrl.trim(),
      imageAlt: form.imageAlt.trim(),
      loomUrl: form.loomUrl.trim(),
      published: form.published,
    };

    try {
      const url = form.id ? `/api/admin/buildlog/${form.id}` : '/api/admin/buildlog';
      const method = form.id ? 'PATCH' : 'POST';
      const r = await fetch(url, {
        method,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const data = await r.json().catch(() => null);
        setErr(data?.error || `Save failed (${r.status})`);
        setBusy(false);
        return;
      }
      setBusy(false);
      setForm(null);
      router.refresh();
    } catch (e) {
      setErr((e as Error).message || 'Save failed');
      setBusy(false);
    }
  }

  async function togglePublish(row: BuildLogRow) {
    if (busy) return;
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch(`/api/admin/buildlog/${row.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ published: !row.published }),
      });
      if (!r.ok) {
        const data = await r.json().catch(() => null);
        setErr(data?.error || `Toggle failed (${r.status})`);
      }
      router.refresh();
    } catch (e) {
      setErr((e as Error).message || 'Toggle failed');
    } finally {
      setBusy(false);
    }
  }

  async function remove(row: BuildLogRow) {
    if (busy) return;
    if (!window.confirm(`Delete "${row.title}"? This can't be undone.`)) return;
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch(`/api/admin/buildlog/${row.id}`, { method: 'DELETE' });
      if (!r.ok) {
        const data = await r.json().catch(() => null);
        setErr(data?.error || `Delete failed (${r.status})`);
      }
      router.refresh();
    } catch (e) {
      setErr((e as Error).message || 'Delete failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-10 items-center rounded-full bg-[color:var(--bd-lime)] px-4 text-sm font-semibold text-[color:var(--bd-ink)] hover:bg-[color:var(--bd-bone)]"
        >
          + New entry
        </button>
        <p className="text-xs text-[color:var(--bd-bone)]/60">
          {entries.length} entr{entries.length === 1 ? 'y' : 'ies'} ·{' '}
          {entries.filter((e) => e.published).length} published
        </p>
        {err && <p className="ml-auto font-mono text-xs text-[color:var(--bd-signal)]">{err}</p>}
      </div>

      {form && (
        <div className="mb-6 rounded-3xl border border-[color:var(--bd-lime)]/30 bg-[color:var(--bd-smoke)] p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
              {form.id ? '/ Edit entry' : '/ New entry'}
            </p>
            <button
              type="button"
              onClick={close}
              className="font-mono text-xs tracking-widest text-[color:var(--bd-bone)]/60 uppercase hover:text-[color:var(--bd-lime)]"
            >
              Close
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Title">
              <input
                type="text"
                value={form.title}
                onChange={(e) => {
                  const v = e.target.value;
                  patchForm({ title: v, slug: slugTouched ? form.slug : slugify(v) });
                }}
                maxLength={200}
                className={inputCls}
              />
            </Field>
            <Field label="Slug (URL)">
              <input
                type="text"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  patchForm({ slug: e.target.value });
                }}
                onBlur={(e) => patchForm({ slug: slugify(e.target.value) })}
                maxLength={80}
                placeholder="auto-generated from title"
                className={inputCls}
              />
            </Field>
            <Field label="Date">
              <input
                type="date"
                value={form.date}
                onChange={(e) => patchForm({ date: e.target.value })}
                className={inputCls}
              />
            </Field>
            <Field label="Loom URL (optional)">
              <input
                type="url"
                value={form.loomUrl}
                onChange={(e) => patchForm({ loomUrl: e.target.value })}
                placeholder="https://www.loom.com/share/…"
                maxLength={500}
                className={inputCls}
              />
            </Field>
            <Field label="Image URL (optional)">
              <input
                type="url"
                value={form.imageUrl}
                onChange={(e) => patchForm({ imageUrl: e.target.value })}
                placeholder="https://i.imgur.com/… or any public image URL"
                maxLength={500}
                className={inputCls}
              />
            </Field>
            <Field label="Image alt text (if image)">
              <input
                type="text"
                value={form.imageAlt}
                onChange={(e) => patchForm({ imageAlt: e.target.value })}
                placeholder="What the image shows"
                maxLength={200}
                className={inputCls}
              />
            </Field>
            <Field label="Body" className="md:col-span-2">
              <textarea
                value={form.body}
                onChange={(e) => patchForm({ body: e.target.value })}
                rows={8}
                maxLength={20_000}
                placeholder="Markdown welcome. 2–4 sentences is the sweet spot."
                className={`${inputCls} resize-y font-mono text-[13px] leading-relaxed`}
              />
            </Field>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => patchForm({ published: e.target.checked })}
                className="h-4 w-4 accent-[color:var(--bd-lime)]"
              />
              <span>{form.published ? 'Published — visible on /built' : 'Draft — hidden'}</span>
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={close}
                className="rounded-full border border-white/15 px-4 py-2 text-sm hover:border-white/30"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                disabled={busy || !form.title.trim() || !form.body.trim()}
                className="rounded-full bg-[color:var(--bd-lime)] px-5 py-2 text-sm font-semibold text-[color:var(--bd-ink)] hover:bg-[color:var(--bd-bone)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? 'Saving…' : form.id ? 'Save changes' : 'Create entry'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[color:var(--bd-smoke)]">
        {entries.length === 0 ? (
          <p className="px-6 py-16 text-center text-sm text-[color:var(--bd-bone)]/65">
            No entries yet. Hit “New entry” to write the first one.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/8 bg-black/20 text-left font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/65 uppercase">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-white/5 align-top last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-[color:var(--bd-bone)]/70">
                      {r.date.slice(0, 10)}
                    </td>
                    <td className="px-4 py-3 font-semibold">{r.title}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[color:var(--bd-bone)]/60">
                      /built/{r.slug}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          r.published
                            ? 'inline-flex items-center rounded-full border border-[color:var(--bd-lime)]/40 bg-[color:var(--bd-lime)]/10 px-2.5 py-1 font-mono text-[10px] tracking-widest text-[color:var(--bd-lime)] uppercase'
                            : 'inline-flex items-center rounded-full border border-white/15 bg-white/5 px-2.5 py-1 font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/70 uppercase'
                        }
                      >
                        {r.published ? 'Live' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => togglePublish(r)}
                          disabled={busy}
                          className="rounded-full border border-white/15 px-3 py-1 font-mono text-[10px] tracking-widest uppercase hover:border-[color:var(--bd-lime)]/40 disabled:opacity-50"
                        >
                          {r.published ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(r)}
                          className="rounded-full border border-white/15 px-3 py-1 font-mono text-[10px] tracking-widest uppercase hover:border-[color:var(--bd-lime)]/40"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(r)}
                          disabled={busy}
                          className="rounded-full border border-[color:var(--bd-signal)]/40 px-3 py-1 font-mono text-[10px] tracking-widest text-[color:var(--bd-signal)] uppercase hover:bg-[color:var(--bd-signal)]/10 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const inputCls =
  'w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-[color:var(--bd-bone)] placeholder:text-[color:var(--bd-bone)]/40 focus:border-[color:var(--bd-lime)] focus:outline-none';

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className ?? ''}`}>
      <span className="mb-1.5 block font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/60 uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}
