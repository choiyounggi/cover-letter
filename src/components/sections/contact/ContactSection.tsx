// contract: t5-contact-telegram owns the implementation
// Consumers (t4) import { ContactSection } from "@/components/sections/contact/ContactSection".
// t5 replaces the body below in place; the export name and signature must not change.
import { Reveal } from "@/components/motion";
import { ContactForm } from "./ContactForm";

export function ContactSection(): React.JSX.Element {
  return (
    <section id="contact" className="mx-auto max-w-5xl px-6 py-32">
      <Reveal>
        <h2 className="font-display text-4xl tracking-tight md:text-6xl">연락하기</h2>
        <p className="mt-4 text-fg-muted">궁금한 점이나 함께 하고 싶은 일이 있다면 편하게 남겨 주세요.</p>
      </Reveal>
      <ContactForm />
    </section>
  );
}
