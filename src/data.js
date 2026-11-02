/**
 * ShopBoard — Product Data Module
 *
 * Contains the catalog of 12 realistic demo digital products.
 * Each product has an id, name, category, description, numeric price, and visual icon svg.
 */

export const products = [
  {
    id: "cv-template",
    name: "CV Template",
    category: "Templates",
    price: 12,
    description:
      "A modern, ATS-friendly resume layout designed to highlight professional skills and career milestones clearly.",
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
  },
  {
    id: "study-planner",
    name: "Study Planner",
    category: "Planners",
    price: 10,
    description:
      "Structured semester and exam planning sheets to help students organize course materials and revision schedules.",
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
  },
  {
    id: "portfolio-template",
    name: "Portfolio Template",
    category: "Templates",
    price: 15,
    description:
      "A clean, responsive web presentation template tailored for creative developers and digital designers.",
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`,
  },
  {
    id: "budget-tracker",
    name: "Budget Tracker",
    category: "Productivity",
    price: 14,
    description:
      "An intuitive personal finance spreadsheet with category breakdowns, monthly goals, and visual spending summaries.",
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
  },
  {
    id: "task-manager",
    name: "Task Manager",
    category: "Productivity",
    price: 12,
    description:
      "A prioritized daily task dashboard featuring status columns, urgency tags, and actionable milestone checkpoints.",
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>`,
  },
  {
    id: "digital-notebook",
    name: "Digital Notebook",
    category: "Productivity",
    price: 8,
    description:
      "Minimalist hyperlinked digital notebook with index tabs, grid paper, and dedicated project documentation templates.",
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`,
  },
  {
    id: "invoice-template",
    name: "Invoice Template",
    category: "Templates",
    price: 9,
    description:
      "Professional freelance invoice template featuring automated calculation fields and clean branding layout.",
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><line x1="8" y1="12" x2="16" y2="12"></line><line x1="8" y1="16" x2="12" y2="16"></line><circle cx="10" cy="8" r="1"></circle></svg>`,
  },
  {
    id: "fitness-planner",
    name: "Fitness Planner",
    category: "Planners",
    price: 11,
    description:
      "Comprehensive weekly workout schedules, nutrition logs, and habit milestones to support wellness goals.",
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>`,
  },
  {
    id: "pitch-deck",
    name: "Pitch Deck Template",
    category: "Templates",
    price: 18,
    description:
      "High-impact presentation slide deck designed for startup founder pitches, proposals, and project reviews.",
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`,
  },
  {
    id: "habit-tracker",
    name: "Habit Tracker",
    category: "Productivity",
    price: 7,
    description:
      "Visual daily habit tracker sheet designed to build consistency and achieve long-term personal milestones.",
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
  },
  {
    id: "student-dashboard",
    name: "Student Dashboard",
    category: "Productivity",
    price: 16,
    description:
      "Comprehensive academic workspace organizing courses, homework deadlines, lecture notes, and study schedules.",
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>`,
  },
  {
    id: "project-planner",
    name: "Project Planner",
    category: "Planners",
    price: 13,
    description:
      "Agile project roadmapping kit with milestone charts, sprint checklists, and deliverable breakdown sheets.",
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`,
  },
];
