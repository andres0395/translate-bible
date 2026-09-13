/**
 * Helper de runtime.
 *
 * Devuelve un objeto BibleRuntime con `assets` si estamos en Cloudflare Workers,
 * o `undefined` si estamos en Vercel / dev local. Es seguro de importar
 * en cualquier runtime: si falla la obtencion del contexto (no estamos en
 * Workers), devolvemos undefined y el repo cae a FileSystem.
 */
import type { BibleRuntime } from "@/repositories/bible";

export async function getRuntimeContext(): Promise<BibleRuntime | undefined> {
  try {
    // Import dinamico: el modulo solo se carga en runtime Workers.
    // En Vercel / dev, el import resuelve pero la llamada falla.
    const mod = (await import("@opennextjs/cloudflare")) as {
      getCloudflareContext?: (opts: { async: true }) => Promise<{
        env?: { ASSETS?: Fetcher };
      }>;
    };

    if (typeof mod.getCloudflareContext !== "function") {
      return undefined;
    }

    const ctx = await mod.getCloudflareContext({ async: true });
    if (!ctx?.env?.ASSETS) return undefined;
    return { assets: ctx.env.ASSETS };
  } catch {
    // No estamos en Workers (Vercel / dev local): usa fs.
    return undefined;
  }
}
