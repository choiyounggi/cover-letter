import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

export type ActionState =
  | { status: "idle" }
  | { status: "ok"; message?: string }
  | { status: "error"; message?: string; fieldErrors?: Record<string, string[]> };

export const GENERIC_ERROR = "저장하지 못했어요. 잠시 후 다시 시도해 주세요.";

export function formToObject(
  fd: FormData,
  opts: { arrays?: string[]; booleans?: string[]; numbers?: string[] } = {},
): Record<string, unknown> {
  const { arrays = [], booleans = [], numbers = [] } = opts;
  const result: Record<string, unknown> = {};
  for (const [key, value] of fd.entries()) {
    if (arrays.includes(key)) continue;
    if (numbers.includes(key)) {
      result[key] = Number(value);
      continue;
    }
    result[key] = value;
  }
  for (const key of arrays) {
    const raw = String(fd.get(key) ?? "");
    result[key] = raw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }
  for (const key of booleans) {
    result[key] = fd.get(key) === "on";
  }
  return result;
}

export function toActionError(err: z.ZodError): ActionState {
  const { fieldErrors } = z.flattenError(err);
  return { status: "error", fieldErrors: fieldErrors as Record<string, string[]> };
}

export function isRedirectError(e: unknown): boolean {
  return typeof e === "object" && e !== null && "digest" in e && String((e as { digest?: string }).digest).startsWith("NEXT_REDIRECT");
}

export function adminAction<T extends unknown[]>(fn: (...args: T) => Promise<ActionState>) {
  return async (...args: T): Promise<ActionState> => {
    await requireAdmin();
    try {
      return await fn(...args);
    } catch (e) {
      if (isRedirectError(e)) throw e;
      return { status: "error", message: GENERIC_ERROR };
    }
  };
}

export function revalidateAdmin(path: string): void {
  revalidatePath("/");
  revalidatePath(path);
}
