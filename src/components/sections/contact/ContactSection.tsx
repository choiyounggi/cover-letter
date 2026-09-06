// contract: t5-contact-telegram owns the implementation
// Consumers (t4) import { ContactSection } from "@/components/sections/contact/ContactSection".
// t5 replaces the body below in place; the export name and signature must not change.
import { Reveal } from "@/components/motion";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { ContactForm } from "./ContactForm";

export function ContactSection(): React.JSX.Element {
  return (
    <section id="contact" aria-labelledby="contact-heading" className="mx-auto max-w-5xl px-6 py-24">
      <SectionHeading id="contact-heading" eyebrow="Contact" title="연락하기" />
      <Reveal delay={0.1}>
        <p className="mt-4 text-fg-muted">궁금한 점이나 함께 하고 싶은 일이 있다면 편하게 남겨 주세요.</p>
      </Reveal>
      <ContactForm />
    </section>
  );
}
