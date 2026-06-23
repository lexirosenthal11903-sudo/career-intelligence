/**
 * Test personas — realistic CVs/backgrounds for auditing matching *quality*.
 *
 * Build once, reuse forever. Each persona carries:
 *  - the inputs the product actually receives (`cvText` + the first-message `direction`)
 *  - `expect`: what an HONEST advisor should and should NOT do for this person
 *    (the matching-quality contract — see AUDIT-PLAN §4/§5 and the honest-matching memory).
 *
 * These are fixtures, not assertions. The audit runner (tests/audit/*) feeds `cvText`
 * + `direction` to /api/analyse and checks the JSON against `expect`. Playwright specs
 * can drive the same personas through the UI.
 */

export interface PersonaExpectations {
  /** Seniority the analysis must land on (entry/graduate-level unless noted). */
  seniority: "entry" | "mid" | "senior";
  /** Role titles / directions that would be a SENIORITY MISMATCH if recommended. */
  forbiddenTitles: string[];
  /** Substrings at least one direction's `why` should honestly engage with. */
  honestyMustMention: string[];
  /**
   * True when this is a relationship-driven field (family office, luxury,
   * hospitality): the path-forward must weight network/trust, not just a reading list.
   */
  relationshipDriven: boolean;
  /** A stated aspiration that is a genuine stretch — must NOT be crowned "the clearest fit". */
  statedStretch?: string;
  notes: string;
}

export interface Persona {
  id: string;
  name: string;
  /** Stable test email; the audit runner namespaces these so they never collide with real users. */
  email: string;
  /** The user's opening message in the first session (the `direction` field to /api/analyse). */
  direction: string;
  cvText: string;
  expect: PersonaExpectations;
}

/** Lexi's real case: creative/design grad reaching into a relationship-driven field. */
const artGradFamilyOffice: Persona = {
  id: "art-grad-family-office",
  name: "Sophie Marchetti",
  email: "persona-artgrad@meridian.test",
  direction:
    "I studied art history and I've been doing some freelance design, but honestly I think I want to work for a family office. I'm not totally sure what that even involves day to day.",
  cvText: `SOPHIE MARCHETTI
London | sophie.marchetti@example.com | 07700 900111

EDUCATION
BA History of Art, 2:1 — University of Bristol (2021–2024)
Dissertation: "Patronage and private collections in post-war Milan"

EXPERIENCE
Freelance Graphic Designer (2024–present)
- Brand identity and print for three small independent retailers
- Built decks and lookbooks in Figma and InDesign

Gallery Assistant (internship), Hauser & Wirth Somerset (summer 2023)
- Supported visitor experience and private viewings
- Helped coordinate a collector event for 40 guests

Front of House, members' club (part-time, 2022–2024)
- Looked after members, handled discreet requests, kept confidences

SKILLS
Figma, InDesign, Photoshop. Italian (conversational). Art-market literacy.`,
  expect: {
    seniority: "entry",
    forbiddenTitles: [
      "Chief of Staff",
      "Head of",
      "Director",
      "Principal",
      "Portfolio Manager",
      "Investment Manager",
    ],
    honestyMustMention: ["network", "relationship", "trust", "connection", "who you know"],
    relationshipDriven: true,
    statedStretch: "family office",
    notes:
      "Family office is the stated desire but a real stretch with no finance background. Must NOT be crowned 'clearest fit'. Path forward must weight relationships/trust as much as any course.",
  },
};

/** STEM grad who knows exactly what they want — tests that we don't over-pivot a clear case. */
const stemGradFocused: Persona = {
  id: "stem-grad-data",
  name: "Daniel Okafor",
  email: "persona-stemgrad@meridian.test",
  direction:
    "I want to be a data analyst, ideally somewhere I can grow into data science. I'm pretty clear on this.",
  cvText: `DANIEL OKAFOR
Manchester | daniel.okafor@example.com

EDUCATION
BSc Mathematics, First Class — University of Manchester (2021–2024)
Final-year project: predictive model for bike-share demand (Python, scikit-learn)

EXPERIENCE
Data Intern, Co-op Insurance (summer 2023)
- Cleaned and joined claims datasets in SQL; built three Power BI dashboards
- Automated a weekly report that took the team 4 hours, down to 10 minutes

Student Ambassador, University of Manchester (2022–2024)
- Ran data workshops for open days

SKILLS
Python (pandas, scikit-learn), SQL, Power BI, Excel. A-levels: Maths A*, Further Maths A, Physics A.`,
  expect: {
    seniority: "entry",
    forbiddenTitles: ["Lead Data Scientist", "Head of Data", "Senior Analyst", "Data Science Manager"],
    honestyMustMention: ["analyst", "junior", "graduate", "data"],
    relationshipDriven: false,
    notes:
      "Clear, well-evidenced goal. Directions should largely affirm + sharpen, not force an unrelated pivot. Roles must be junior/graduate analyst level. One adjacent direction is fine but must be framed as discovery.",
  },
};

/** Career-changer: established in one field, pivoting into a competitive new one. */
const careerChanger: Persona = {
  id: "career-changer-teacher-ux",
  name: "Rachel Adeyemi",
  email: "persona-changer@meridian.test",
  direction:
    "I've been a secondary school teacher for six years and I'm burnt out. I think I want to move into UX design but I have no professional design experience.",
  cvText: `RACHEL ADEYEMI
Leeds | rachel.adeyemi@example.com

EXPERIENCE
Secondary School Teacher (English), Leeds (2018–present)
- Taught 150+ students per year; redesigned the KS3 curriculum
- Head of Year for two cohorts — pastoral lead, parent liaison
- Ran the school's first student-feedback programme

Self-directed (2024)
- Completed Google UX Design Certificate (Coursera)
- Two case studies: redesigned a local charity's booking flow; a habit-tracker concept

EDUCATION
PGCE Secondary English — University of Leeds (2017)
BA English Literature, 2:1 — University of Sheffield (2014–2017)

SKILLS
Figma (learning), user research instincts from teaching, curriculum design, public speaking.`,
  expect: {
    seniority: "entry",
    forbiddenTitles: ["Senior UX Designer", "UX Lead", "Head of Design", "Design Director", "Principal Designer"],
    honestyMustMention: ["competing", "portfolio", "no professional", "junior", "against", "bootcamp", "stretch"],
    relationshipDriven: false,
    statedStretch: "UX design",
    notes:
      "Genuine pivot into a competitive field with no professional design experience. Must name the competitive reality honestly (who she's up against, what they have that she doesn't) AND credit transferable skills. Entry/junior UX only.",
  },
};

/** Thin-CV graduate: minimal history — tests we anchor in degree/projects, never invent experience. */
const thinCvGraduate: Persona = {
  id: "thin-cv-graduate",
  name: "Tom Hayes",
  email: "persona-thincv@meridian.test",
  direction: "I just graduated and I have no idea what I want to do. Help.",
  cvText: `TOM HAYES
Bristol | tom.hayes@example.com

EDUCATION
BA Geography, 2:2 — University of the West of England (2021–2024)

EXPERIENCE
Part-time retail assistant, supermarket (2021–2024)

INTERESTS
Hiking, five-a-side football, podcasts about climate.`,
  expect: {
    seniority: "entry",
    forbiddenTitles: ["Manager", "Senior", "Lead", "Head of", "Consultant", "Specialist"],
    honestyMustMention: ["geography", "graduate", "start", "entry"],
    relationshipDriven: false,
    notes:
      "Very little to go on. Must anchor honestly in degree subject + interests + stated openness — never fabricate experience. Directions should be genuinely exploratory and entry-level. A good test of empty-ish-input grace.",
  },
};

export const personas: Persona[] = [
  artGradFamilyOffice,
  stemGradFocused,
  careerChanger,
  thinCvGraduate,
];

export const personasById: Record<string, Persona> = Object.fromEntries(
  personas.map((p) => [p.id, p])
);
