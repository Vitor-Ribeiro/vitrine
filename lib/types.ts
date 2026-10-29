export type Experience = {
  role: string;
  company: string;
  period: string;
  location?: string;
  highlights: string[];
};

export type Education = {
  course: string;
  institution: string;
  period: string;
};

export type Project = {
  name: string;
  description: string;
  tech: string[];
  url?: string;
};

export type SkillGroup = {
  category: string;
  items: string[];
};

export type Link = {
  label: string;
  url: string;
};

export type Profile = {
  name: string;
  headline: string;
  tagline: string;
  about: string;
  location?: string;
  email?: string;
  phone?: string;
  links: Link[];
  stats: { value: string; label: string }[];
  experience: Experience[];
  education: Education[];
  projects: Project[];
  skills: SkillGroup[];
  languages: string[];
  language: "pt" | "en" | "es";
};

export type ThemeId = "aurora" | "editorial" | "terminal";

export type SiteOptions = {
  theme: ThemeId;
  accent: string;
};
