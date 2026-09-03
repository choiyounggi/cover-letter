import type { ReactNode } from "react";
import { SmoothScroll, Cursor } from "@/components/motion";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { getLinksCached } from "@/lib/cached-queries";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const links = await getLinksCached();
  return (
    <SmoothScroll>
      <Cursor />
      <Nav />
      <main className="overflow-x-hidden">{children}</main>
      <Footer links={links} />
    </SmoothScroll>
  );
}
