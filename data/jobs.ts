import jobData from "./jobs.json";

/* ──────────────────── Types ──────────────────── */

export interface JobLang {
  title: string;
  salary: string;
  workingTime: string;
  education: string;
  experience: string;
  location: string;
  description: string[];
}

export interface Job {
  id: string;
  date: string;
  en: JobLang;
  vi: JobLang;
}

/* ──────────────────── Data ──────────────────── */

/** All job openings — imported from jobs.json (single source of truth) */
export const jobs: Job[] = jobData as Job[];
