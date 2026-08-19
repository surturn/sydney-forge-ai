/**
 * SINGLE SOURCE OF TRUTH for all copy and asset paths.
 * Real photos/scans land here later — a `null` src renders a labelled
 * placeholder rather than breaking. Never hardcode copy in a scene.
 */

export type Media = { src: string | null; alt: string };
export type StackGroup = { group: string; items: string[] };
export type Panel = { kicker: string; heading: string[]; body?: string };

export type Project = {
  id: string;
  name: string;
  status: string;
  blurb: string;
  bullets: string[];
  stack: string[];
  poster: Media;
};

export type Credential = {
  title: string;
  issuer: string;
  period: string;
  note: string;
};

export type Link = { label: string; href: string; kind: 'email' | 'external' };

export const SCENES = [
  { index: 0, id: 'cold-open', label: 'Cold Open' },
  { index: 1, id: 'personal', label: 'Personal' },
  { index: 2, id: 'work', label: 'Work' },
  { index: 3, id: 'hobbies', label: 'Hobbies' },
  { index: 4, id: 'credentials', label: 'Credentials' },
  { index: 5, id: 'outro', label: 'Outro' },
] as const;

export const content = {
  identity: {
    name: 'Sydney Kamau',
    role: 'Full-Stack Developer',
    location: 'Nairobi, Kenya',
    coords: '-1.2921°, 36.8219°',
    email: 'sydneykamau2005@gmail.com',
    github: 'https://github.com/surturn',
    company: 'Invonics Technologies',
    companyUrl: 'https://invonicstechnologies.com',
  },

  scene1: {
    panels: [
      {
        kicker: 'II — PERSONAL',
        heading: ['Nairobi,', 'and a habit', 'of shipping.'],
        body:
          'Full-stack developer building scalable web applications, automation systems, and AI-powered platforms.',
      },
      {
        kicker: 'THE WORK',
        heading: ['Real problems,', 'in real sectors.'],
        body:
          'Agriculture, government service delivery, and business automation — end-to-end systems that hold up in production, including a live school asset-management platform and an event ticketing platform for the Kenyan market.',
      },
      {
        kicker: 'THE STACK',
        heading: ['What it', 'runs on.'],
      },
    ] as Panel[],

    stack: [
      { group: 'Languages', items: ['JavaScript', 'Python', 'SQL', 'HTML', 'CSS'] },
      { group: 'Frameworks', items: ['React', 'Node.js', 'Tailwind CSS', 'Django', 'FastAPI'] },
      {
        group: 'Tools',
        items: [
          'Firebase', 'Docker', 'Git/GitHub', 'n8n', 'Linux', 'Nginx',
          'Redis', 'Celery', 'ngrok', 'PostgreSQL', 'Sentry', 'Cloudflare R2',
        ],
      },
      {
        group: 'Competencies',
        items: [
          'Full-Stack Development', 'REST APIs', 'Database Design',
          'Debugging', 'Automation Workflows',
        ],
      },
    ] as StackGroup[],
  },

  projects: [
    {
      id: 'assetflow',
      name: 'AssetFlow Schools',
      status: 'Deployed',
      blurb:
        "School asset-management platform, positioned against the Auditor-General's finding of KSh 6.6 billion in unaccounted assets at Kenyan public secondary schools.",
      bullets: [
        'Designed and shipped a QR-code asset-tagging architecture for tracking school assets end to end',
        'Led a full product-admin panel audit and integrated Sentry with structured logging (structlog/Loki) for production observability',
        'Built competitive positioning and battlecards against incumbent providers',
      ],
      stack: ['React', 'Django', 'PostgreSQL', 'Celery', 'Redis', 'Cloudflare R2'],
      poster: { src: null, alt: 'AssetFlow Schools asset-tagging dashboard' },
    },
    {
      id: 'eventify',
      name: 'Eventify',
      status: 'Deployed',
      blurb: 'Event ticketing platform built for the Kenyan market.',
      bullets: [
        'Led a security audit covering five attacker profiles, hardening against scalping, freeloading, and offline gate-scanner reconciliation fraud',
        'Built a Material 3 design system and an organiser-first homepage strategy to drive event-host adoption',
      ],
      stack: ['React', 'Material 3'],
      poster: { src: null, alt: 'Eventify ticketing interface' },
    },
    {
      id: 'farmassist',
      name: 'FarmAssist',
      status: 'AI Farming Companion',
      blurb:
        'AI-powered platform assisting farmers with crop disease detection and decision-making.',
      bullets: [
        'Integrated AI vision models and weather-based recommendations',
        'Designed full-stack architecture and real-time data handling',
      ],
      stack: ['Node.js', 'Express', 'React', 'Tailwind CSS', 'YOLOv8'],
      poster: { src: null, alt: 'FarmAssist crop disease detection view' },
    },
    {
      id: 'leadgen',
      name: 'Lead Generation Automation',
      status: 'Automation System',
      blurb: 'Automated pipelines for scraping and routing leads.',
      bullets: [
        'Reduced manual workload by over 60 percent',
        'Implemented API integrations and deployed using Docker',
      ],
      stack: ['FastAPI', 'JavaScript', 'Docker'],
      poster: { src: null, alt: 'Lead generation pipeline diagram' },
    },
  ] as Project[],

  hobbies: {
    items: [
      {
        title: 'Football',
        body: 'The original systems game — eleven variables, one objective, endless optimisation.',
      },
      {
        title: 'FIFA',
        body: "Strategy and optimisation don't stop at the keyboard.",
      },
    ],
    poster: { src: null, alt: 'A football at rest' },
  },

  credentials: [
    {
      title: 'BSc, Computer Science',
      issuer: 'Multimedia University of Kenya',
      period: '2024 — Present',
      note: 'Software engineering and AI/ML systems.',
    },
    {
      title: 'Certificate in Full Stack Development',
      issuer: 'Emobilis',
      period: '2024',
      note: 'Comprehensive full-stack program covering modern web technologies.',
    },
    {
      title: "President's Award Kenya",
      issuer: 'Gold Level — Chairman, Western Region',
      period: 'Leadership',
      note: 'Led regional programs and coordinated multi-team initiatives.',
    },
    {
      title: 'Quantium',
      issuer: 'Simulation',
      period: 'Training',
      note: 'Built a data-driven pricing analysis application.',
    },
    {
      title: 'Datacom',
      issuer: 'Simulation',
      period: 'Training',
      note: 'Used AI tools for debugging and system design.',
    },
  ] as Credential[],

  outro: {
    signoff: 'Built from Nairobi.',
    links: [
      { label: 'Email', href: 'mailto:sydneykamau2005@gmail.com', kind: 'email' },
      { label: 'GitHub', href: 'https://github.com/surturn', kind: 'external' },
      { label: 'Invonics Technologies', href: 'https://invonicstechnologies.com', kind: 'external' },
    ] as Link[],
  },
};
