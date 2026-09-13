/**
 * Tipos ambientes minimos de Cloudflare Workers.
 *
 * Solo declaramos lo que usamos desde la app (Fetcher para el binding ASSETS).
 * Si en algun momento agregamos KV, R2, D1, etc., extender este archivo o
 * instalar @cloudflare/workers-types y referenciarlo desde tsconfig.
 */
declare global {
  type Fetcher = {
    fetch(input: string | URL | Request): Promise<Response>;
  };
}

export {};
