"use server";
import { companyInputSchema, reorderSchema } from "@/lib/schemas/content";
import { createCompany, updateCompany, deleteCompany, reorderCompanies } from "@/lib/data";
import { adminAction, formToObject, toActionError, revalidateAdmin, type ActionState } from "./_helpers";

export const createCompanyAction = adminAction(async (_prev: ActionState, fd: FormData): Promise<ActionState> => {
  const parsed = companyInputSchema.safeParse(formToObject(fd));
  if (!parsed.success) return toActionError(parsed.error);
  await createCompany(parsed.data);
  revalidateAdmin("/admin/companies");
  return { status: "ok", message: "추가했어요" };
});

export const updateCompanyAction = adminAction(async (_prev: ActionState, fd: FormData): Promise<ActionState> => {
  const id = String(fd.get("id") ?? "");
  const parsed = companyInputSchema.safeParse(formToObject(fd));
  if (!parsed.success) return toActionError(parsed.error);
  await updateCompany(id, parsed.data);
  revalidateAdmin("/admin/companies");
  return { status: "ok", message: "저장했어요" };
});

export const deleteCompanyAction = adminAction(async (_prev: ActionState, fd: FormData): Promise<ActionState> => {
  const id = String(fd.get("id") ?? "");
  await deleteCompany(id);
  revalidateAdmin("/admin/companies");
  return { status: "ok", message: "삭제했어요" };
});

export const reorderCompaniesAction = adminAction(async (_prev: ActionState, fd: FormData): Promise<ActionState> => {
  const raw = String(fd.get("ids") ?? "[]");
  const parsed = reorderSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) return toActionError(parsed.error);
  await reorderCompanies(parsed.data);
  revalidateAdmin("/admin/companies");
  return { status: "ok", message: "순서를 저장했어요" };
});
