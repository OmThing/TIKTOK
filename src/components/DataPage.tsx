import { Check, Copy, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { apiDelete, apiSave, copyText, type AnyRecord } from "../lib/api";
import { displayValue, type AnyRow, type Field, type Lookup, type ModuleConfig } from "../lib/modules";

type DataPageProps = {
  config: ModuleConfig;
  rows: AnyRow[];
  lookup: Lookup;
  initialQuery: string;
  onChanged: () => Promise<void>;
};

function defaultValue(field: Field) {
  if (field.type === "number") return 0;
  if (field.type === "checkbox") return false;
  return "";
}

function makeDraft(fields: Field[], row?: AnyRow) {
  return fields.reduce<AnyRecord>((draft, field) => {
    draft[field.name] = row?.[field.name] ?? defaultValue(field);
    return draft;
  }, row?.id ? { id: row.id } : {});
}

function toInputDate(value: unknown, type?: Field["type"]) {
  if (!value) return "";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  if (type === "date") return date.toISOString().slice(0, 10);
  if (type === "datetime") return date.toISOString().slice(0, 16);
  return String(value);
}

export function DataPage({ config, rows, lookup, initialQuery, onChanged }: DataPageProps) {
  const fields = config.fields ?? [];
  const tableFields = fields.filter((field) => field.table).slice(0, 9);
  const [query, setQuery] = useState(initialQuery);
  const [draft, setDraft] = useState<AnyRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery, config.key]);

  const filteredRows = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return rows;
    return rows.filter((row) =>
      fields.some((field) => {
        const raw = String(row[field.name] ?? "").toLowerCase();
        const display = displayValue(field, row[field.name], lookup).toLowerCase();
        return raw.includes(value) || display.includes(value);
      })
    );
  }, [fields, lookup, query, rows]);

  async function save() {
    if (!config.resource || !draft) return;
    setSaving(true);
    try {
      await apiSave(config.resource, draft);
      setDraft(null);
      await onChanged();
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: AnyRow) {
    if (!config.resource || !row.id) return;
    const name = row.name ?? row.accountName ?? row.topic ?? "这条记录";
    const ok = window.confirm(`确认删除「${name}」？`);
    if (!ok) return;
    await apiDelete(config.resource, row.id);
    await onChanged();
  }

  async function copyField(field: Field, row: AnyRow) {
    await copyText(row[field.name]);
    setCopied(`${row.id}-${field.name}`);
    window.setTimeout(() => setCopied(""), 1200);
  }

  function clearFilter() {
    setQuery("");
    window.history.replaceState({}, "", config.path);
  }

  return (
    <div className="space-y-5">
      <div className="toolbar">
        <div className="relative min-w-[260px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/38" size={17} />
          <input
            className="input pl-10"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={config.searchHint ?? "搜索"}
          />
        </div>
        {query && (
          <button className="secondary-button" onClick={clearFilter}>
            清除筛选
          </button>
        )}
        <button className="primary-button" onClick={() => setDraft(makeDraft(fields))}>
          <Plus size={17} />
          新增
        </button>
      </div>

      {query && (
        <div className="filter-note">
          当前筛选：<strong>{query}</strong>，共 {filteredRows.length} 条匹配记录。
        </div>
      )}

      <div className="table-shell">
        <table>
          <thead>
            <tr>
              {tableFields.map((field) => (
                <th key={field.name}>{field.label}</th>
              ))}
              <th className="w-[132px] text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.id}>
                {tableFields.map((field) => (
                  <td key={field.name}>
                    <div className="cell-content">
                      <span>{displayValue(field, row[field.name], lookup)}</span>
                      {field.copy && (
                        <button className="mini-icon" title="复制" onClick={() => copyField(field, row)}>
                          {copied === `${row.id}-${field.name}` ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      )}
                    </div>
                  </td>
                ))}
                <td>
                  <div className="flex justify-end gap-2">
                    <button className="icon-button" title="编辑" onClick={() => setDraft(makeDraft(fields, row))}>
                      <Pencil size={16} />
                    </button>
                    <button className="icon-button danger" title="删除" onClick={() => remove(row)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!filteredRows.length && (
              <tr>
                <td colSpan={tableFields.length + 1}>
                  <div className="empty-state">还没有匹配记录，可以先新增一条。</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {draft && (
        <div className="modal-backdrop">
          <div className="editor-panel">
            <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold">{draft.id ? "编辑记录" : "新增记录"}</h2>
                <p className="text-sm text-ink/55">{config.title}</p>
              </div>
              <button className="icon-button" onClick={() => setDraft(null)} title="关闭">
                <X size={18} />
              </button>
            </div>

            <div className="grid max-h-[68vh] gap-4 overflow-y-auto px-5 py-5 md:grid-cols-2">
              {fields.map((field) => {
                const value = draft[field.name];
                const common = {
                  id: field.name,
                  value: toInputDate(value, field.type),
                  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
                    setDraft({ ...draft, [field.name]: event.target.value }),
                  placeholder: field.placeholder
                };

                return (
                  <label className={`field ${field.type === "textarea" ? "md:col-span-2" : ""}`} key={field.name}>
                    <span>
                      {field.label}
                      {field.required && <b>*</b>}
                    </span>

                    {field.type === "textarea" ? (
                      <textarea {...common} rows={4} />
                    ) : field.type === "select" ? (
                      <select {...common}>
                        <option value="">请选择</option>
                        {(typeof field.options === "function" ? field.options(lookup) : field.options ?? []).map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : field.type === "checkbox" ? (
                      <button
                        className={`toggle ${value ? "toggle-on" : ""}`}
                        type="button"
                        onClick={() => setDraft({ ...draft, [field.name]: !value })}
                      >
                        {value ? "是" : "否"}
                      </button>
                    ) : (
                      <input {...common} type={field.type === "datetime" ? "datetime-local" : field.type ?? "text"} />
                    )}
                  </label>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 border-t border-line px-5 py-4">
              <button className="secondary-button" onClick={() => setDraft(null)}>
                取消
              </button>
              <button className="primary-button" onClick={save} disabled={saving}>
                {saving ? "保存中..." : "保存"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
