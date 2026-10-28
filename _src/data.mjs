// Facts shared by every language: links and lists. The words around them live
// in content/home.<lang>.mjs under the same keys.
//
// Numbers in the texts were checked against the live stores and marketplaces
// on 2026-10-27.

export const SITE = 'https://alex-d-code.github.io/';
export const EMAIL = 'alex.d.code@icloud.com';
export const HANDLE = 'alex.d.code';

export const SOCIAL = [
  { key: 'instagram', name: 'Instagram', url: 'https://www.instagram.com/alex.d.code/' },
  { key: 'threads', name: 'Threads', url: 'https://www.threads.com/@alex.d.code' },
];

// Order on the page. The icon is assets/img/apps/<key>.webp.
export const APPS = [
  {
    key: 'vorbi', name: 'Vorbi',
    site: 'https://aldanchenko.github.io/vorbi-site/',
    appStore: 'https://apps.apple.com/app/id6777660039',
    platforms: ['iOS'],
  },
  {
    key: 'ministry-time', name: 'Ministry Time',
    site: 'https://aldanchenko.github.io/ministry-journal-site/',
    appStore: 'https://apps.apple.com/app/id6751296180',
    googlePlay: 'https://play.google.com/store/apps/details?id=ua.danchenko.ministryjournal',
    platforms: ['iOS', 'Android'],
  },
  {
    key: 'daily-funds', name: 'Daily Funds',
    site: 'https://aldanchenko.github.io/daily-funds-app/',
    appStore: 'https://apps.apple.com/app/id6755143656',
    googlePlay: 'https://play.google.com/store/apps/details?id=ua.danchenko.dailyfunds',
    platforms: ['iOS', 'Android'],
  },
  {
    key: 'bible-study-planner', name: 'Bible Study Planner',
    site: 'https://aldanchenko.github.io/bible_study_planner-site/',
    appStore: 'https://apps.apple.com/app/id6755185622',
    platforms: ['iOS'],
  },
  {
    key: 'currsnap', name: 'CurrSnap',
    site: 'https://aldanchenko.github.io/currsnap-app/',
    appStore: 'https://apps.apple.com/app/id6760613440',
    platforms: ['iOS'],
  },
  {
    key: 'deutli', name: 'Deutli',
    site: 'https://aldanchenko.github.io/deutli-site/',
    platforms: ['iOS'],
    soon: true,
  },
];

// Work, newest first. `link` only where a public page exists.
export const WORK = [
  { key: 'qodo', name: 'Qodo', years: '2023–2026' },
  { key: 'snyk-jetbrains', name: 'Snyk for JetBrains IDEs', years: '2019–2022', link: 'https://plugins.jetbrains.com/plugin/10972-snyk-security' },
  { key: 'snyk-vs', name: 'Snyk for Visual Studio', years: '2020–2022', link: 'https://github.com/snyk/snyk-visual-studio-plugin' },
  { key: 'haltentech', name: 'Haltentech', years: '2022–2023' },
];

export const SERVICES = ['plugins', 'ai', 'mobile', 'web', 'backend', 'desktop', 'cli', 'existing'];

// Client reviews from Upwork, quoted verbatim, no client names. Labels per
// language: content/home.<lang>.mjs → reviews.
export const REVIEWS = [
  {
    key: 'backend', years: '2022–2023',
    text: "Alex is a fantastic freelancer who we've worked with for over a year. I'd hire again. He knows his stuff and communicates well.",
  },
  {
    key: 'vscode', years: '2022',
    text: 'It was a great pleasure to work with Alex, he has great communication skills as well as technical. Everything was delivered as expected, highly recommend',
  },
  {
    key: 'webhook', years: '2017',
    text: 'Aleksandr was great to work with - he was quick, code was very clear and readable and he thought outside the box which I loved! Would hire again :)',
  },
];
