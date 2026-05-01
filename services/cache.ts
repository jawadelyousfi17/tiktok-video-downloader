import "server-only";

interface Entry<V> {
  value: V;
  expiresAt: number;
}

/**
 * Tiny in-memory LRU + TTL cache. We use Map's insertion-order iteration to
 * implement recency: re-inserting a key on get/set bumps it to the most-
 * recently-used end, and overflow evicts the least recently used (the
 * first key returned by `keys()`).
 *
 * It is in-process only — that is enough to absorb the bulk of duplicate
 * traffic (a user pasting the same link twice, hot-reloading during dev,
 * a popular link spreading among friends inside a warm serverless
 * container). Cross-instance correctness would need Redis; we accept the
 * trade-off so we don't add infra at this stage.
 */
export class LruTtlCache<V> {
  private store = new Map<string, Entry<V>>();

  constructor(
    private readonly max: number,
    private readonly ttlMs: number,
  ) {}

  get(key: string): V | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    // Re-insert to mark as most-recently-used.
    this.store.delete(key);
    this.store.set(key, entry);
    return entry.value;
  }

  set(key: string, value: V): void {
    if (this.store.has(key)) this.store.delete(key);
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
    if (this.store.size > this.max) {
      const oldest = this.store.keys().next().value;
      if (oldest !== undefined) this.store.delete(oldest);
    }
  }
}

/**
 * Resolve a singleton off `globalThis` so dev HMR — which re-imports
 * modules on every save — keeps reusing the same cache instead of
 * rebuilding an empty one. Production also benefits: a single warm
 * serverless container shares one cache across all its requests.
 */
export function getOrCreateCache<V>(
  globalKey: string,
  factory: () => LruTtlCache<V>,
): LruTtlCache<V> {
  const g = globalThis as unknown as Record<string, LruTtlCache<V> | undefined>;
  const existing = g[globalKey];
  if (existing) return existing;
  const created = factory();
  g[globalKey] = created;
  return created;
}
