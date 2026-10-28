// Words for the English page. Keys match data.mjs; {{email}} becomes a mail
// link. Every language file has the same shape; the build stops if one misses
// a service, a work item, an app or a review label.
export default {
  title: 'Alex D Code — software engineer for hire: apps, plugins, AI',
  description: 'Software engineer with 19 years of experience: IDE plugins, AI features, mobile and web apps, backends, desktop apps and CLI tools. Open to new projects.',
  lastmod: '2026-10-28',

  name: 'Alex',
  jobTitle: 'Software developer',
  role: 'Developer of IDE plugins, AI features and mobile apps',
  status: 'Open to new projects',
  zone: 'EET · UTC+2/+3',

  bio: { title: 'Bio', short: 'Short', long: 'Long' },

  short: [
    'I’m a software developer with 19 years of experience. From 2023 to 2026 I built IDE extensions at Qodo, an AI code review assistant, and before that, security plugins for JetBrains IDEs and Visual Studio at Snyk. Plugins I’ve worked on have over 1.5 million installs.',
    'I also make <a href="#apps">my own apps</a>; five of them are in the App Store. I’m open to new projects: plugins, AI features, mobile and web apps, backends. Write to me at {{email}}.',
  ],

  long: [
    'I’ve written software for clients since 2007 and have worked remotely since 2012. Most of my career is Java and Kotlin, with TypeScript, C#, Dart and some Python added along the way: I learn what the project needs. I picked up C# and the Visual Studio SDK to build Snyk’s Visual Studio extension, and Flutter to ship five apps of my own in a little over a year.',
    'From 2023 to 2026 I worked on the IDE extensions of Qodo, an AI code review assistant. I was one of the main developers of its JetBrains plugin (650K+ downloads) and also worked on the VS Code extension (900K+ installs), the Visual Studio 2022 extension and the shared chat UI in React.',
    'At Snyk (2019–2022) I rewrote the security plugin for JetBrains IDEs from scratch in Kotlin (830K+ downloads) and started the Visual Studio extension, writing about 70% of its code. Both are open source. At Haltentech (2022–2023) I was a developer and tech lead: backends and web apps for the company’s clients in Spring Boot and Kotlin on AWS, with Vue.js front ends.',
    'Since 2016 I’ve also worked through Upwork, where I’m Top Rated Plus with 100% Job Success: a medical records web app, IntelliJ and PyCharm plugins, Spring Boot services, Vaadin web apps, Java desktop apps. Since 2023 I’ve worked on AI tools for developers, and I use AI in my own work every day.',
    'How I work: I ask questions early and suggest options with their trade-offs instead of guessing. You get small, regular results you can try, with notes on what changed, and the code comes with tests and clear pull requests. My time zone is EET (UTC+2/+3), so my working day overlaps with the rest of Europe and the US morning. I speak English, Ukrainian and Russian.',
    'If you have a project in mind, write to me at {{email}}.',
  ],

  services: {
    title: 'What I can build for you',
    items: {
      plugins: 'IDE plugins and developer tools',
      ai: 'AI features and agents',
      mobile: 'Mobile apps',
      web: 'Websites and web apps',
      backend: 'Backends and APIs',
      desktop: 'Desktop apps',
      cli: 'CLI tools and automation',
      existing: 'Your existing code',
    },
  },

  work: {
    title: 'Selected work',
    items: {
      qodo: 'IDE extensions for an AI code review assistant',
      'snyk-jetbrains': 'security scanner I rewrote in Kotlin',
      'snyk-vs': 'security scanner I started and mostly wrote',
      haltentech: 'developer and tech lead: backends and web apps',
    },
  },

  apps: {
    title: 'My own apps',
    soon: 'Coming soon',
    items: {
      vorbi: 'Romanian course',
      'ministry-time': 'Service time diary',
      'daily-funds': 'Budget and expenses',
      'bible-study-planner': 'Bible reading plans',
      currsnap: 'Currency converter',
      deutli: 'German course',
    },
  },

  reviews: {
    title: 'What clients say',
    source: 'Upwork review',
    items: {
      backend: 'Backend update in Java',
      vscode: 'VS Code extension',
      webhook: 'Webhook endpoint in Java',
    },
  },

  // Notes are written in English; `lang` marks that on the other languages.
  notes: { title: 'Notes', lang: '' },

  contact: {
    title: 'Contact',
    text: 'Tell me what you need, and I’ll reply with questions and a first plan.',
    upwork: 'You can also hire me through Upwork, where I’m Top Rated Plus with 100% Job Success, or find me on LinkedIn. Write to me and I’ll send the links.',
  },
};
