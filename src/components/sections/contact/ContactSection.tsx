// contract: t5-contact-telegram owns the implementation
// Consumers (t4) import { ContactSection } from "@/components/sections/contact/ContactSection".
// t5 replaces the body below in place; the export name and signature must not change.
export function ContactSection(): React.JSX.Element {
  return (
    <section id="contact" className="mx-auto max-w-5xl px-6 py-32">
      <h2 className="font-display text-4xl tracking-tight md:text-6xl">연락하기</h2>
    </section>
  );
}
