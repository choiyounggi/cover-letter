import Image from "next/image";
import type { Link, Profile } from "@/generated/prisma/client";
import { Reveal, Magnetic, Parallax } from "@/components/motion";
import { SectionHeading } from "@/components/layout/SectionHeading";

function initials(name: string): string {
  return name.trim().slice(0, 2);
}

export function AboutSection({ profile, links }: { profile: Profile; links: Link[] }) {
  const paragraphs = profile.bio.split(/\n{2,}/).filter((p) => p.trim().length > 0);

  return (
    <section id="about" className="scroll-mt-24 py-32" aria-labelledby="about-heading">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-[320px_1fr]">
        <Parallax speed={0.1}>
          <div className="code-frame w-fit" data-file="avatar.png">
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={profile.name}
                width={320}
                height={320}
                className="block h-[320px] w-[320px] object-cover"
              />
            ) : (
              <div
                aria-hidden
                className="flex h-[320px] w-[320px] items-center justify-center font-display text-6xl text-fg-muted"
              >
                {initials(profile.name)}
              </div>
            )}
          </div>
        </Parallax>
        <div className="min-w-0">
          <SectionHeading id="about-heading" eyebrow="About" title={profile.name} />
          <p className="mt-2 text-lg text-fg-muted">{profile.title}</p>
          <div className="mt-8 space-y-4 whitespace-pre-line text-fg">
            {paragraphs.map((paragraph, i) => (
              <Reveal key={paragraph.slice(0, 40) + i} delay={i * 0.08}>
                <p>{paragraph}</p>
              </Reveal>
            ))}
          </div>
          {links.length > 0 && (
            <ul className="mt-8 flex flex-wrap gap-3">
              {links.map((link) => (
                <li key={link.id}>
                  <Magnetic>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-fg-muted before:content-['['] after:content-[']'] transition-colors hover:text-accent"
                    >
                      {link.label}
                    </a>
                  </Magnetic>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
