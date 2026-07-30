interface KVNamespace {
  get(key: string, type: 'json'): Promise<any>;
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
}
interface ExecutionContext {
  waitUntil(promise: Promise<any>): void;
}
type ExportedHandler<Env = unknown> = {
  fetch(request: Request, env: Env, ctx: ExecutionContext): Response | Promise<Response>;
};
interface RequestInitCfProperties { cacheTtl?: number; }
interface RequestInit { cf?: RequestInitCfProperties; }
