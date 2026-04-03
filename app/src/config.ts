// Civic Hub - Mission-led AI operating layer
// Site-wide configuration

export interface SiteConfig {
  language: string;
  siteName: string;
  siteDescription: string;
}

export const siteConfig: SiteConfig = {
  language: "en",
  siteName: "Civic Hub",
  siteDescription: "Civic Hub helps study materials become drills, wellness goals become routines, eco actions become momentum, and accessibility becomes clear action.",
};

// Hero Section
export interface HeroConfig {
  backgroundImage: string;
  backgroundAlt: string;
  title: string;
  subtitle: string;
}

export const heroConfig: HeroConfig = {
  backgroundImage: "/hero-bg.jpg",
  backgroundAlt: "Civic Hub mission overview",
  title: "Civic Hub",
  subtitle: "A calm operating layer for meaningful progress",
};

// Narrative Text Section
export interface NarrativeTextConfig {
  line1: string;
  line2: string;
  line3: string;
}

export const narrativeTextConfig: NarrativeTextConfig = {
  line1: "Study materials become drills, notes, and interview prep.",
  line2: "Goals turn into routines people can realistically follow.",
  line3: "Small eco actions become visible momentum instead of guilt, while accessible text stays readable, useful, and easy to act on.",
};

// ZigZag Grid Section
export interface ZigZagGridItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  imageAlt: string;
  reverse: boolean;
}

export interface ZigZagGridConfig {
  sectionLabel: string;
  sectionTitle: string;
  items: ZigZagGridItem[];
}

export const zigZagGridConfig: ZigZagGridConfig = {
  sectionLabel: "FOUR MODULES",
  sectionTitle: "One system for learning, living, and acting with intention",
  items: [
    {
      id: "education",
      title: "Education",
      subtitle: "STUDY SYSTEMS",
      description: "Study materials become drills, notes, and interview prep. Keep the best parts of your learning in one place and turn them into repeatable practice.",
      image: "/education-module.jpg",
      imageAlt: "Education Module",
      reverse: false,
    },
    {
      id: "healthcare",
      title: "Healthcare & Wellness",
      subtitle: "REALISTIC ROUTINES",
      description: "Goals turn into routines people can realistically follow. Build workout and nutrition plans that fit the week you actually have.",
      image: "/healthcare-module.jpg",
      imageAlt: "Healthcare Module",
      reverse: true,
    },
    {
      id: "sustainability",
      title: "Sustainability",
      subtitle: "VISIBLE MOMENTUM",
      description: "Small eco actions become visible momentum instead of guilt. Log what you do, see the impact, and keep the habit loop encouraging.",
      image: "/sustainability-module.jpg",
      imageAlt: "Sustainability Module",
      reverse: false,
    },
    {
      id: "accessibility",
      title: "Accessibility",
      subtitle: "CLEAR LANGUAGE",
      description: "Make content easier to read, translate, and summarize so more people can understand the message and act on it quickly.",
      image: "/accessibility-module.jpg",
      imageAlt: "Accessibility Module",
      reverse: true,
    },
  ],
};

// Breath Section
export interface BreathSectionConfig {
  backgroundImage: string;
  backgroundAlt: string;
  title: string;
  subtitle: string;
  description: string;
}

export const breathSectionConfig: BreathSectionConfig = {
  backgroundImage: "/breath-section.jpg",
  backgroundAlt: "Civic Hub in use",
  title: "Structured AI workflows",
  subtitle: "BUILT FOR FOLLOW-THROUGH",
  description: "Civic Hub uses domain-specific agents to produce drills, routines, eco actions, and accessible text that can be reviewed, reused, and improved over time.",
};

// Card Stack Section
export interface CardStackItem {
  id: number;
  image: string;
  title: string;
  description: string;
  rotation: number;
}

export interface CardStackConfig {
  sectionTitle: string;
  sectionSubtitle: string;
  cards: CardStackItem[];
}

export const cardStackConfig: CardStackConfig = {
  sectionTitle: "Specialized agents, shared momentum",
  sectionSubtitle: "DOMAIN-SPECIFIC INTELLIGENCE",
  cards: [
    {
      id: 1,
      image: "/agent-education.jpg",
      title: "Education Agent",
      description: "Turns source notes into drills, next steps, and interview prep that support the way you actually study.",
      rotation: -2,
    },
    {
      id: 2,
      image: "/agent-wellness.jpg",
      title: "Wellness Agent",
      description: "Turns goals into realistic routines, meal ideas, and check-ins that fit your week and energy level.",
      rotation: 1,
    },
    {
      id: 3,
      image: "/agent-sustainability.jpg",
      title: "Sustainability Agent",
      description: "Turns eco habits into visible progress, practical challenges, and encouragement that avoids guilt.",
      rotation: -1,
    },
  ],
};

// Footer Section
export interface FooterContactItem {
  type: "email" | "phone";
  label: string;
  value: string;
  href: string;
}

export interface FooterSocialItem {
  platform: string;
  href: string;
}

export interface FooterConfig {
  heading: string;
  description: string;
  ctaText: string;
  contact: FooterContactItem[];
  locationLabel: string;
  address: string[];
  socialLabel: string;
  socials: FooterSocialItem[];
  logoText: string;
  copyright: string;
  links: { label: string; href: string }[];
}

export const footerConfig: FooterConfig = {
  heading: "Ready to build a system that helps people follow through?",
  description: "Civic Hub turns studying, wellness, sustainability, and accessibility into practical workflows that are easier to return to every day.",
  ctaText: "Get Started",
  contact: [
    {
      type: "email",
      label: "hello@civichub.app",
      value: "hello@civichub.app",
      href: "mailto:hello@civichub.app",
    },
  ],
  locationLabel: "Built with purpose",
  address: ["Civic Hub Platform", "Practical AI for everyday progress"],
  socialLabel: "Connect",
  socials: [
    { platform: "github", href: "https://github.com/civichub" },
    { platform: "twitter", href: "https://x.com/civichubapp" },
  ],
  logoText: "Civic Hub",
  copyright: "2025 Civic Hub. Built for learning, wellness, sustainability, and accessibility.",
  links: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

// Platform Features
export const platformFeatures = {
  aiFeatures: [
    "Structured content generation for drills, notes, and plans",
    "Practical evaluation and feedback for interviews and progress",
    "Text transformation for readability, translation, and summaries",
    "Cross-module recommendations that keep momentum visible",
    "Specialized domain agents with shared context",
  ],
  techStack: {
    frontend: ["React", "TypeScript", "Vite", "Tailwind CSS", "shadcn/ui"],
    backend: ["FastAPI", "SQLAlchemy", "Pydantic", "PostgreSQL"],
    ai: ["Gemini API", "Structured Outputs", "Domain Agents"],
    ml: ["scikit-learn", "Handwritten Digit Recognition"],
  },
};
