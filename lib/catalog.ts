/**
 * Course and entrance-exam reference data.
 *
 * Deliberately free of dates, cutoffs and fee figures that change every cycle —
 * those go stale and would be wrong on the page within months. Anything
 * time-sensitive is presented as "talk to a counsellor" instead. College-level
 * fees come from the scraped dataset, which is dated and sourced.
 */
import type { Stream } from "./colleges";

export type CourseDef = {
  slug: string;
  name: string;
  full: string;
  stream: Stream;
  level: "UG" | "PG";
  duration: string;
  eligibility: string;
  exams: string[];
  blurb: string;
};

export const COURSES: CourseDef[] = [
  {
    slug: "btech",
    name: "B.Tech",
    full: "Bachelor of Technology",
    stream: "Engineering",
    level: "UG",
    duration: "4 years",
    eligibility: "Class 12 with Physics, Chemistry and Mathematics",
    exams: ["JEE Main", "JEE Advanced", "MHT-CET"],
    blurb:
      "The standard undergraduate engineering degree in India. In Maharashtra, admission runs through JEE Main for national institutes and MHT-CET for the state quota, followed by centralised counselling.",
  },
  {
    slug: "mba",
    name: "MBA",
    full: "Master of Business Administration",
    stream: "Management",
    level: "PG",
    duration: "2 years",
    eligibility: "A bachelor's degree in any discipline",
    exams: ["CAT", "MAH MBA CET", "CMAT", "XAT"],
    blurb:
      "Postgraduate management education. Maharashtra hosts some of India's strongest business schools, with admission through CAT for the top tier and MAH MBA CET for the state quota.",
  },
  {
    slug: "mbbs",
    name: "MBBS",
    full: "Bachelor of Medicine, Bachelor of Surgery",
    stream: "Medical",
    level: "UG",
    duration: "5.5 years including internship",
    eligibility: "Class 12 with Physics, Chemistry and Biology",
    exams: ["NEET UG"],
    blurb:
      "The undergraduate medical degree. NEET UG is the single entrance route, with seats split between the All India Quota and the Maharashtra state quota.",
  },
  {
    slug: "llb",
    name: "LLB / BA LLB",
    full: "Bachelor of Laws",
    stream: "Law",
    level: "UG",
    duration: "3 years (LLB) or 5 years (integrated)",
    eligibility: "Class 12 for the integrated course, or a bachelor's degree for the 3-year LLB",
    exams: ["CLAT", "MH CET Law", "LSAT India"],
    blurb:
      "Law can be read as a five-year integrated programme straight after Class 12, or as a three-year LLB after graduation. Maharashtra has both national law universities and long-established government law colleges.",
  },
  {
    slug: "bpharm",
    name: "B.Pharm",
    full: "Bachelor of Pharmacy",
    stream: "Pharmacy",
    level: "UG",
    duration: "4 years",
    eligibility: "Class 12 with Physics, Chemistry and Biology or Mathematics",
    exams: ["MHT-CET", "GPAT (for PG)"],
    blurb:
      "Pharmacy education covering drug formulation, pharmacology and regulatory practice, with strong industry links across the Mumbai–Pune corridor.",
  },
];

export type ExamDef = {
  slug: string;
  name: string;
  full: string;
  level: string;
  conductedBy: string;
  streams: Stream[];
  mode: string;
  blurb: string;
  eligibility: string;
};

export const EXAMS: ExamDef[] = [
  {
    slug: "jee-main",
    name: "JEE Main",
    full: "Joint Entrance Examination (Main)",
    level: "National",
    conductedBy: "National Testing Agency (NTA)",
    streams: ["Engineering"],
    mode: "Computer-based, multiple sessions per year",
    eligibility: "Class 12 with Physics, Chemistry and Mathematics",
    blurb:
      "The entry route to NITs, IIITs and centrally funded institutes, and the qualifying round for JEE Advanced. Many Maharashtra private colleges accept the score directly.",
  },
  {
    slug: "jee-advanced",
    name: "JEE Advanced",
    full: "Joint Entrance Examination (Advanced)",
    level: "National",
    conductedBy: "The IITs, on rotation",
    streams: ["Engineering"],
    mode: "Computer-based",
    eligibility: "A qualifying rank in JEE Main",
    blurb:
      "The IIT entrance. In Maharashtra this is the route into IIT Bombay, consistently among the highest-ranked engineering institutes in the country.",
  },
  {
    slug: "mht-cet",
    name: "MHT-CET",
    full: "Maharashtra Common Entrance Test",
    level: "State",
    conductedBy: "Maharashtra State CET Cell",
    streams: ["Engineering", "Pharmacy"],
    mode: "Computer-based",
    eligibility: "Class 12 with PCM or PCB, and Maharashtra domicile for state-quota seats",
    blurb:
      "The state entrance test for engineering and pharmacy seats across Maharashtra. It carries the state-quota advantage that national exams do not.",
  },
  {
    slug: "neet",
    name: "NEET UG",
    full: "National Eligibility cum Entrance Test (Undergraduate)",
    level: "National",
    conductedBy: "National Testing Agency (NTA)",
    streams: ["Medical", "Dental"],
    mode: "Pen and paper",
    eligibility: "Class 12 with Physics, Chemistry and Biology",
    blurb:
      "The single entrance exam for MBBS and BDS across India. Seats are divided between the All India Quota and state quotas, each with separate counselling.",
  },
  {
    slug: "cat",
    name: "CAT",
    full: "Common Admission Test",
    level: "National",
    conductedBy: "The IIMs, on rotation",
    streams: ["Management"],
    mode: "Computer-based",
    eligibility: "A bachelor's degree with the required minimum marks",
    blurb:
      "The gateway to the IIMs and most top-tier business schools, including several in Mumbai and Pune.",
  },
  {
    slug: "mah-mba-cet",
    name: "MAH MBA CET",
    full: "Maharashtra MBA Common Entrance Test",
    level: "State",
    conductedBy: "Maharashtra State CET Cell",
    streams: ["Management"],
    mode: "Computer-based",
    eligibility: "A bachelor's degree; Maharashtra domicile for state-quota seats",
    blurb:
      "The state route into Maharashtra's MBA and MMS seats, including well-regarded government and university-affiliated institutes.",
  },
  {
    slug: "clat",
    name: "CLAT",
    full: "Common Law Admission Test",
    level: "National",
    conductedBy: "Consortium of National Law Universities",
    streams: ["Law"],
    mode: "Pen and paper",
    eligibility: "Class 12 for the five-year integrated programme",
    blurb:
      "The entrance for National Law Universities, including Maharashtra National Law University's campuses.",
  },
  {
    slug: "mh-cet-law",
    name: "MH CET Law",
    full: "Maharashtra Common Entrance Test for Law",
    level: "State",
    conductedBy: "Maharashtra State CET Cell",
    streams: ["Law"],
    mode: "Computer-based",
    eligibility: "Class 12 for the five-year course, or graduation for the three-year LLB",
    blurb:
      "The state law entrance, used by government law colleges and most private law schools across Maharashtra.",
  },
];

export function getCourse(slug: string) {
  return COURSES.find((c) => c.slug === slug);
}

export function getExam(slug: string) {
  return EXAMS.find((e) => e.slug === slug);
}
