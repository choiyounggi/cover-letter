import type { Metadata } from "next";
import { Hero } from "@/components/hero";
import { getProfile, getSkillsByCategory, getTimeline, getCompaniesWithExperiences, getProjects, getSetting } from "@/lib/data";
import { getLinksCached } from "@/lib/cached-queries";
import { buildMetadata } from "@/lib/site-metadata";
import { SETTING_KEYS } from "@/lib/schemas/settings";

const OG_IMAGE_URL_SETTING_KEY = "site.ogImageUrl" satisfies (typeof SETTING_KEYS)[number];
import { AboutSection } from "@/components/sections/about/AboutSection";
import { SkillsSection } from "@/components/sections/skills/SkillsSection";
import { TimelineSection } from "@/components/sections/timeline/TimelineSection";
import { ExperienceSection } from "@/components/sections/experience/ExperienceSection";
import { ProjectsSection } from "@/components/sections/projects/ProjectsSection";
import { ContactSection } from "@/components/sections/contact/ContactSection";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const [profile, ogImageUrl] = await Promise.all([getProfile(), getSetting(OG_IMAGE_URL_SETTING_KEY)]);
  return buildMetadata(profile, { siteUrl: process.env.NEXT_PUBLIC_SITE_URL, ogImageUrl });
}

export default async function HomePage() {
  const [profile, links, skillsByCategory, timeline, companies, projects] = await Promise.all([
    getProfile(),
    getLinksCached(),
    getSkillsByCategory(),
    getTimeline(),
    getCompaniesWithExperiences(),
    getProjects(),
  ]);

  return (
    <>
      {profile ? (
        <Hero name={profile.name} title={profile.title} tagline={profile.tagline ?? undefined} />
      ) : (
        <Hero name="포트폴리오" title="관리자에서 프로필을 입력해 주세요" />
      )}
      {profile && <AboutSection profile={profile} links={links} />}
      <SkillsSection skillsByCategory={skillsByCategory} />
      <TimelineSection items={timeline} />
      <ExperienceSection companies={companies} />
      <ProjectsSection projects={projects} />
      <ContactSection />
    </>
  );
}
