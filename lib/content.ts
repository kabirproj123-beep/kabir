/**
 * Editable site content — the admin-ready data layer.
 *
 * Every value here is intended to be editable from an admin panel backed by
 * Firestore. For the draft we serve these local defaults (no DB/billing needed).
 * When you're ready to go live, `getContent()` in lib/data.ts merges any
 * document at Firestore `content/site` over these defaults, so the shape you see
 * here is exactly the shape the admin will write.
 *
 * All placeholder copy is safe to show a client and easy to swap.
 */

export type Service = {
  id: string;
  title: string;
  summary: string;
  points: string[];
};

export type Step = {
  id: string;
  title: string;
  body: string;
};

export type Destination = {
  code: string;
  name: string;
  note: string;
};

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  detail: string;
  avatar: string;
};

export type Stat = {
  value: string;
  label: string;
};

export type FaqItem = {
  q: string;
  a: string;
};

// Founding year, kept for computing experience. Never render this bare —
// use `yearsGuiding` for display so the site never looks frozen in the past.
const FOUNDED = 2013;

export const site = {
  name: "Meridian",
  tagline: "Maharashtra college discovery & admissions",
  founded: FOUNDED,
  yearsGuiding: `${new Date().getFullYear() - FOUNDED}+`,
  description:
    "Compare every major college in Maharashtra — Engineering, Medical, Management and Law. Real fees, placements and rankings, plus free counselling from admission experts.",
  location: "Pune, Maharashtra",
  phone: "+91 90000 00000",
  whatsapp: "+919000000000",
  email: "hello@meridian.example",
  instagram: "https://instagram.com",
  address: "Level 4, FC Road, Shivajinagar, Pune 411005",
};

export const nav = [
  { label: "Colleges", href: "/colleges" },
  { label: "Rankings", href: "/rankings" },
  { label: "Courses", href: "/courses" },
  { label: "Exams", href: "/exams" },
  { label: "Counselling", href: "/counselling" },
  { label: "Study abroad", href: "/study-abroad" },
  { label: "About", href: "/about" },
];

/**
 * Indian universities that run twinning / credit-transfer routes to a foreign
 * degree. These are NOT part of the Maharashtra college database (they sit in
 * other states) — they appear only in the study-abroad pathway section.
 */
export const abroadPartners = [
  {
    name: "Thapar Institute of Engineering & Technology",
    place: "Patiala, Punjab",
    note: "2+2 B.E. pathway with Trinity College Dublin",
  },
  {
    name: "SRM Institute of Science & Technology",
    place: "Chennai, Tamil Nadu",
    note: "Semester-abroad and credit transfer to US & UK partners",
  },
  {
    name: "Shiv Nadar University",
    place: "Delhi NCR",
    note: "Exchange programmes across Europe and North America",
  },
];

// Universities our students have been admitted to — shown as a marquee.
export const admits = [
  "Purdue",
  "TU Munich",
  "Trinity College Dublin",
  "University of Toronto",
  "UNSW Sydney",
  "Imperial College London",
  "TU Delft",
  "ETH Zürich",
  "University of Melbourne",
  "Boston University",
];

export const hero = {
  eyebrow: "Counselling · Test prep · Study abroad · Careers",
  titleLead: "Guidance that goes",
  titleAccent: "the whole way.",
  body: "From choosing the right stream to walking into the right career, one team stays with you at every step — with advice that's honest and prep that actually moves the needle.",
  primaryCta: { label: "Book a free session", href: "/contact" },
  secondaryCta: { label: "Explore services", href: "/services" },
};

/**
 * Imagery. Placeholder photography (free Unsplash) so the draft feels alive —
 * swap these URLs for the client's own shots later. Kept here so images are
 * editable from the same admin layer as the copy.
 */
const U = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80`;
export const media = {
  hero: U("1523240795612-9a054b0db644"),      // mentors + students collaborating
  about: U("1522202176988-66273c2fd55f"),     // a counselling session
  studyAbroad: U("1541339907198-e08756dedf3f"), // university campus
  contact: U("1531482615713-2afd69097998"),   // student at work
};

export const stats: Stat[] = [
  { value: "12+", label: "Years guiding students" },
  { value: "900+", label: "Students placed" },
  { value: "42", label: "Partner universities" },
  { value: "1:1", label: "Senior mentorship" },
];

export const services: Service[] = [
  {
    id: "counselling",
    title: "Admissions counselling",
    summary:
      "Honest, one-on-one guidance to choose the right stream, course, and shortlist — for colleges in India and abroad, matched to your profile.",
    points: ["Profile evaluation", "Course & campus fit", "Personalised shortlist"],
  },
  {
    id: "test-prep",
    title: "Test preparation",
    summary:
      "Focused coaching for SAT, GRE, GMAT, IELTS and competitive exams — small batches, diagnostic tests, and weekly full-length mocks.",
    points: ["SAT · GRE · GMAT", "IELTS & TOEFL", "Full-length mocks"],
  },
  {
    id: "study-abroad",
    title: "Study abroad",
    summary:
      "End-to-end support for universities across eleven countries — applications, SOPs, scholarships, and visas handled start to finish.",
    points: ["University applications", "Scholarship strategy", "Visa & documentation"],
  },
  {
    id: "careers",
    title: "Career mentorship",
    summary:
      "Beyond the admit — profile building, internships, and a career map drawn with mentors who've walked the path themselves.",
    points: ["Profile building", "Internship pathways", "Career mapping"],
  },
];

export const steps: Step[] = [
  {
    id: "01",
    title: "Discovery call",
    body: "A free, honest conversation about your goals, budget, and timeline — no scripts, no pressure.",
  },
  {
    id: "02",
    title: "Plan & shortlist",
    body: "We map your strengths against real outcomes and build a plan — courses, exams, and a reach-to-safe shortlist.",
  },
  {
    id: "03",
    title: "Prep & apply",
    body: "Coaching, essays, and paperwork run in parallel against every deadline, reviewed by a senior mentor.",
  },
  {
    id: "04",
    title: "Offers & beyond",
    body: "We compare offers and scholarships, handle the logistics, and stay on for career guidance long after.",
  },
];

export const destinations: Destination[] = [
  { code: "US", name: "United States", note: "STEM & research" },
  { code: "UK", name: "United Kingdom", note: "1-year masters" },
  { code: "CA", name: "Canada", note: "Work & PR pathway" },
  { code: "AU", name: "Australia", note: "Post-study work" },
  { code: "DE", name: "Germany", note: "Low-cost, English-taught" },
  { code: "IE", name: "Ireland", note: "Tech & pharma hub" },
];

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    quote:
      "I came in fixated on one plan. Meridian pushed back with data, and I ended up somewhere better than my dream school — with a scholarship I didn't know I qualified for.",
    name: "Ananya R.",
    detail: "MS Computer Science · Purdue",
    avatar: U("1494790108377-be9c29b29330"),
  },
  {
    id: "t2",
    quote:
      "The test prep was ruthless in the best way. Weekly mocks, real feedback, no fluff. My GRE went up 14 points in six weeks.",
    name: "Karan M.",
    detail: "GRE 329 · TU Munich",
    avatar: U("1500648767791-00dcc994a43e"),
  },
  {
    id: "t3",
    quote:
      "They treated my application like it mattered. Three rewrites later it actually sounded like me — and three universities said yes.",
    name: "Fatima S.",
    detail: "MSc Finance · Trinity College Dublin",
    avatar: U("1438761681033-6461ffad8d80"),
  },
];

export const faqs: FaqItem[] = [
  {
    q: "Is the first counselling session really free?",
    a: "Yes. The discovery call is free and has no obligation. We'd rather earn your trust than sell you a package on day one.",
  },
  {
    q: "Do you only help with studying abroad?",
    a: "No. Study abroad is one of four things we do. We also handle admissions counselling for Indian colleges, test prep, and long-term career mentorship.",
  },
  {
    q: "When should I start the process?",
    a: "The earlier the better, so nothing is rushed — but we regularly help students on tight timelines too. Book a call and we'll tell you honestly where you stand.",
  },
  {
    q: "Do you help with scholarships and visas?",
    a: "Both. Scholarship strategy is built into the application phase, and we handle visa documentation and interview prep before departure.",
  },
];
