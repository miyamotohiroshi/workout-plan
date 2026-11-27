// レンタルサーバー上の PHP API (server/api) を呼ぶクライアント。
// Supabase クライアントと同じ書き味 (from().select().eq()...) を保っている。

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '/api';

export const AUTH_REQUIRED_EVENT = 'auth-required';

type DbError = { message: string };
// 呼び出し側が行ごとに型を当てるため any を許容 (supabase-js と同じ扱い)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Rows = any;
type Result<T> = Promise<{ data: T | null; error: DbError | null }>;
type Filter = { col: string; op: string; val?: unknown };
type Order = { col: string; asc: boolean };

async function request<T>(endpoint: string, init: RequestInit): Promise<{ data: T | null; error: DbError | null }> {
  try {
    const res = await fetch(`${API_BASE}/${endpoint}`, init);
    const json = await res.json().catch(() => null);
    if (res.status === 401) window.dispatchEvent(new Event(AUTH_REQUIRED_EVENT));
    if (!res.ok || !json || json.error) {
      return { data: null, error: { message: json?.error ?? `HTTP ${res.status}` } };
    }
    return { data: json.data as T, error: null };
  } catch (e) {
    return { data: null, error: { message: e instanceof Error ? e.message : 'network error' } };
  }
}

function callDb<T>(body: Record<string, unknown>) {
  return request<T>('db.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

class QueryBuilder implements PromiseLike<{ data: Rows; error: DbError | null }> {
  private op: 'select' | 'insert' | 'update' | 'delete' | 'upsert' = 'select';
  private columns = '*';
  private filters: Filter[] = [];
  private orders: Order[] = [];
  private limitN: number | null = null;
  private mode: 'many' | 'maybeSingle' = 'many';
  private payload: unknown = null;
  private conflict: string | null = null;

  constructor(private table: string) {}

  select(columns = '*') { this.columns = columns; return this; }
  insert(rows: object | object[]) { this.op = 'insert'; this.payload = rows; return this; }
  update(values: object) { this.op = 'update'; this.payload = values; return this; }
  upsert(rows: object | object[], opts?: { onConflict?: string }) {
    this.op = 'upsert'; this.payload = rows; this.conflict = opts?.onConflict ?? null; return this;
  }
  delete() { this.op = 'delete'; return this; }

  eq(col: string, val: unknown) { this.filters.push({ col, op: 'eq', val }); return this; }
  gte(col: string, val: unknown) { this.filters.push({ col, op: 'gte', val }); return this; }
  lt(col: string, val: unknown) { this.filters.push({ col, op: 'lt', val }); return this; }
  not(col: string, op: string, val: unknown) { this.filters.push({ col, op: `not_${op}`, val }); return this; }
  order(col: string, opts?: { ascending?: boolean }) {
    this.orders.push({ col, asc: opts?.ascending ?? true }); return this;
  }
  limit(n: number) { this.limitN = n; return this; }
  maybeSingle() { this.mode = 'maybeSingle'; return this; }

  then<R1 = { data: Rows; error: DbError | null }, R2 = never>(
    onfulfilled?: ((value: { data: Rows; error: DbError | null }) => R1 | PromiseLike<R1>) | null,
    onrejected?: ((reason: unknown) => R2 | PromiseLike<R2>) | null,
  ): PromiseLike<R1 | R2> {
    return callDb<unknown>({
      table: this.table,
      op: this.op,
      columns: this.columns,
      filters: this.filters,
      order: this.orders,
      limit: this.limitN,
      single: this.mode === 'maybeSingle',
      rows: this.payload,
      onConflict: this.conflict,
    }).then(onfulfilled, onrejected);
  }
}

export const db = {
  from: (table: string) => new QueryBuilder(table),
  storage: {
    from: (bucket: string) => ({
      async upload(path: string, file: Blob, opts?: { upsert?: boolean }): Result<{ path: string }> {
        const form = new FormData();
        form.append('bucket', bucket);
        form.append('path', path);
        form.append('upsert', opts?.upsert ? '1' : '0');
        form.append('file', file, 'upload.jpg');
        return request<{ path: string }>('upload.php', { method: 'POST', body: form });
      },
      async remove(paths: string[]): Result<null> {
        return request<null>('remove.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bucket, paths }),
        });
      },
      getPublicUrl(path: string) {
        // 画像はログイン必須の api/file.php 経由で配信する
        return { data: { publicUrl: `${API_BASE}/file.php?b=${bucket}&p=${encodeURIComponent(path)}` } };
      },
    }),
  },
};

export function getPhotoUrl(path: string): string {
  return db.storage.from('photos').getPublicUrl(path).data.publicUrl;
}

// ── ログイン ──────────────────────────────────────────────────────────────────
export async function checkSession(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/me.php`, { method: 'POST' });
    return res.ok;
  } catch {
    return false;
  }
}

export async function login(user: string, password: string): Promise<string | null> {
  const { error } = await request('login.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user, password }),
  });
  return error ? error.message : null;
}

export async function logout() {
  await request('logout.php', { method: 'POST' });
}
