import pg from 'pg';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL || '';

const needsSsl = Boolean(connectionString) && !/localhost|127\.0\.0\.1|sslmode=disable/.test(connectionString);

export const pool = new Pool({
  connectionString,
  ssl: needsSsl ? { rejectUnauthorized: false } : false,
  max: 4,
  idleTimeoutMillis: 5000,
  connectionTimeoutMillis: 15000,
  allowExitOnIdle: true,
});

pool.on('error', (err) => console.error('[pg] idle client error:', err.message));

const CONN_ERRORS = ['ECONNRESET', 'EPIPE', 'ETIMEDOUT', 'ENOTFOUND', '08006', '08003', '08001', '57P01', '57P02', '57P03'];

function isConnectionError(err) {
  if (!err) return false;
  if (CONN_ERRORS.includes(String(err.code))) return true;
  return /terminat|connection closed|socket hang up|timeout/i.test(String(err.message || ''));
}

/** Query helper: retries once when a pooled connection was closed while idle. */
export async function q(text, params = []) {
  try {
    return await pool.query(text, params);
  } catch (err) {
    if (isConnectionError(err)) {
      return pool.query(text, params);
    }
    throw err;
  }
}

export async function one(text, params = []) {
  const res = await q(text, params);
  return res.rows[0] || null;
}

export async function many(text, params = []) {
  const res = await q(text, params);
  return res.rows;
}

const SCHEMA = `
create table if not exists settings (
  id integer primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists admins (
  id serial primary key,
  email text unique not null,
  password_hash text not null,
  name text not null default 'Admin',
  role text not null default 'owner',
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists categories (
  id serial primary key,
  name text not null,
  kind text not null default 'course',
  icon text default '',
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists courses (
  id serial primary key,
  title text not null,
  category text default '',
  summary text default '',
  description text default '',
  duration text default '',
  fee text default '',
  level text default '',
  mode text default '',
  highlights jsonb not null default '[]'::jsonb,
  image_url text default '',
  badge text default '',
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists jobs (
  id serial primary key,
  title text not null,
  category text default '',
  description text default '',
  type text default '',
  location text default '',
  salary text default '',
  positions integer not null default 1,
  requirements jsonb not null default '[]'::jsonb,
  laptop boolean not null default false,
  training text default '',
  experience text default '',
  badge text default '',
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists services (
  id serial primary key,
  title text not null,
  category text default '',
  description text default '',
  icon text default 'Sparkles',
  price text default '',
  features jsonb not null default '[]'::jsonb,
  image_url text default '',
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists ads (
  id serial primary key,
  title text not null,
  body text default '',
  badge text default '',
  image_url text default '',
  link text default '',
  link_label text default '',
  placement text default 'home',
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists students (
  id serial primary key,
  name text not null,
  course text default '',
  batch text default '',
  photo_url text default '',
  position text default '',
  company text default '',
  quote text default '',
  year text default '',
  placed boolean not null default true,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists applications (
  id serial primary key,
  name text not null,
  phone text default '',
  email text default '',
  city text default '',
  kind text not null default 'job',
  interest text default '',
  experience text default '',
  message text default '',
  status text not null default 'new',
  notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists messages (
  id serial primary key,
  name text not null,
  phone text default '',
  email text default '',
  subject text default '',
  message text default '',
  handled boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists applications_created_idx on applications (created_at desc);
create index if not exists messages_created_idx on messages (created_at desc);
`;

export const DEFAULT_SETTINGS = {
  studio_name: 'Subhan Console Studio',
  short_name: 'Subhan Console',
  tagline: 'Google Play Console • App Publishing • 3 Month IT Courses with Job',
  hero_heading: 'Learn Google Play Console work and get a job in our own office',
  hero_sub: '3 month professional course, office laptops provided, live Play Console practice, and a job opportunity after the course.',
  announcement: 'New batch admissions open — 3 month course + job opportunity. Laptops provided in office.',
  about: 'Subhan Console Studio is a professional IT training and app publishing set-up near Sarfraz Colony, Hyderabad. We teach Google Play Console account handling, app publishing, Android development and digital skills on real projects — 3 month course, office laptops provided, and job opportunity in our own office for hard working students.',
  owner_name: 'Subhan',
  owner_title: 'Founder & Lead Instructor',
  owner_photo_url: '',
  owner_bio: 'I am Subhan, founder of Subhan Console Studio. For the last 3+ years I have been working on Google Play Console accounts, app publishing and training students in Hyderabad. My goal is simple: teach a real skill in 3 months and give a real job opportunity in the office.',
  owner_phone: '03003440200',
  phone: '03003440200',
  whatsapp: '03003440200',
  whatsapp_message: 'Assalam-o-Alaikum Subhan Console Studio! I want information about your course and job.',
  email: 'subhanconsolestudio@gmail.com',
  address: 'Near Sarfraz Colony, Hyderabad, Sindh, Pakistan',
  map_query: 'Sarfraz Colony, Hyderabad, Sindh, Pakistan',
  hours: 'Monday – Saturday: 10:00 AM – 8:00 PM (Friday break 1:00 – 3:00 PM)',
  facebook: '',
  instagram: '',
  youtube: '',
  tiktok: '',
  stat_years: '3',
  stat_students: '500',
  stat_jobs: '150',
  stat_courses: '12',
  hero_image_url:
    'https://images.pexels.com/photos/5621976/pexels-photo-5621976.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  office_image_url:
    'https://images.unsplash.com/photo-1558655146-364adaf1fcc9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  chat_welcome: 'Assalam-o-Alaikum! I am the Subhan Console Studio assistant. Ask me about courses, jobs, fees, timings or apply — I am online 24/7.',
  admission_note: 'Admission: bring a copy of your CNIC/B-Form and 2 photos. Laptop is provided in the office, you do not need to bring your own.',
};

const SEED_CATEGORIES = [
  { name: 'Google Play Console', kind: 'course', icon: 'Smartphone', sort_order: 1 },
  { name: 'App Development', kind: 'course', icon: 'Code2', sort_order: 2 },
  { name: 'Web Development', kind: 'course', icon: 'Globe', sort_order: 3 },
  { name: 'Graphic Design', kind: 'course', icon: 'Palette', sort_order: 4 },
  { name: 'Video Editing', kind: 'course', icon: 'Video', sort_order: 5 },
  { name: 'Digital Marketing', kind: 'course', icon: 'Megaphone', sort_order: 6 },
  { name: 'Computer Basics', kind: 'course', icon: 'MonitorSmartphone', sort_order: 7 },
  { name: 'Google Play Console', kind: 'job', icon: 'Smartphone', sort_order: 1 },
  { name: 'App Publishing', kind: 'job', icon: 'Rocket', sort_order: 2 },
  { name: 'App Development', kind: 'job', icon: 'Code2', sort_order: 3 },
  { name: 'Data Entry', kind: 'job', icon: 'Keyboard', sort_order: 4 },
  { name: 'Social Media', kind: 'job', icon: 'Megaphone', sort_order: 5 },
  { name: 'Support & Appeals', kind: 'job', icon: 'ShieldCheck', sort_order: 6 },
  { name: 'Play Console Accounts', kind: 'service', icon: 'BadgeCheck', sort_order: 1 },
  { name: 'App Publishing', kind: 'service', icon: 'Rocket', sort_order: 2 },
  { name: 'Rejection & Policy Fix', kind: 'service', icon: 'ShieldAlert', sort_order: 3 },
  { name: 'Web & App Development', kind: 'service', icon: 'Code2', sort_order: 4 },
  { name: 'Office Laptop Facility', kind: 'service', icon: 'Laptop', sort_order: 5 },
];

const SEED_COURSES = [
  {
    title: 'Google Play Console Mastery',
    category: 'Google Play Console',
    badge: 'Most popular',
    duration: '3 Months',
    fee: 'Rs 15,000 (easy instalments)',
    level: 'Beginner to Professional',
    mode: 'On-campus • office laptop provided',
    summary: 'Complete Google Play Console training — account setup, app upload, release, policy and appeals — with job opportunity in our office.',
    description:
      'This is our flagship 3 month course. You will work on real Google Play Console accounts from day one: creating and handling accounts, uploading apps, managing releases, reading policy warnings, resolving rejections and handling appeals. Training is done in our office on office laptops, so you do not need to bring your own computer.',
    highlights: [
      'Play Console account setup — new and old accounts',
      'App upload, testing tracks and release management',
      'Play policy, rejection reasons and appeal handling',
      'Developer / company account verification',
      'Live practice on office laptops (laptop provided)',
      '3 month training then job opportunity in our office',
      'Certificate of completion + CV help',
      'WhatsApp support group after the course',
    ],
    image_url: 'https://images.pexels.com/photos/10774600/pexels-photo-10774600.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    sort_order: 1,
  },
  {
    title: 'Android App Development',
    category: 'App Development',
    duration: '3 Months',
    fee: 'Rs 20,000',
    level: 'Beginner to Pro',
    mode: 'On-campus • office laptop provided',
    summary: 'Build and publish your own Android apps — from first screen to Play Store release.',
    description:
      'Learn Android app development step by step. You will build real apps, design the screens, connect data, sign the APK / AAB and publish them on Google Play. By the end of the course you will have published apps in your own portfolio.',
    highlights: [
      'Android basics, screens and navigation',
      'Java / Kotlin essentials for real apps',
      'Firebase, ads (AdMob) and API connections',
      'Signing, AAB build and Play Store release',
      'How to avoid rejection before you upload',
      'Live projects on office laptops',
      'Job opportunity after course completion',
    ],
    image_url: 'https://images.pexels.com/photos/8296105/pexels-photo-8296105.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    sort_order: 2,
  },
  {
    title: 'Web Development (HTML, CSS, JavaScript)',
    category: 'Web Development',
    duration: '3 Months',
    fee: 'Rs 18,000',
    level: 'Beginner to Intermediate',
    mode: 'On-campus • office laptop provided',
    summary: 'Build modern responsive websites and business landing pages that clients pay for.',
    description:
      'A practical web development course for students who want earning skills quickly. You will build responsive websites, business landing pages and simple dashboards, then learn how to host them and deliver projects to clients.',
    highlights: [
      'HTML5, CSS3 and responsive layouts',
      'JavaScript logic and interactivity',
      'Real client-style projects (portfolio, business site)',
      'Hosting, domains and basic SEO',
      'Freelancing and client handling basics',
      'Certificate and job opportunity',
    ],
    image_url: 'https://images.unsplash.com/photo-1778489769184-45868633c527?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    sort_order: 3,
  },
  {
    title: 'Graphic Design & Branding',
    category: 'Graphic Design',
    duration: '2 Months',
    fee: 'Rs 10,000',
    level: 'Beginner',
    mode: 'On-campus • office laptop provided',
    summary: 'App icons, banners, logos, social media posts and Play Store graphics.',
    description:
      'Design is the first thing a client sees. This course teaches the graphics that app businesses need daily: app icons, feature graphics, screenshots for Play Store, logos, banners and social media posts.',
    highlights: [
      'Photoshop / Canva / Illustrator basics to pro',
      'Play Store icon and feature graphic design',
      'App screenshots and mockups',
      'Logo and brand identity work',
      'Social media post design pack',
      'Small paid work from our office projects',
    ],
    image_url: '',
    sort_order: 4,
  },
  {
    title: 'Video Editing (Mobile + PC)',
    category: 'Video Editing',
    duration: '2 Months',
    fee: 'Rs 8,000',
    level: 'Beginner',
    mode: 'On-campus • office laptop provided',
    summary: 'Edit reels, app promo videos and YouTube content from scratch.',
    description:
      'Hands-on video editing training: cutting, transitions, text animation, sound and exporting for Instagram, YouTube and app promo videos. Real projects included so you can start earning while learning.',
    highlights: [
      'Mobile + PC editing workflow',
      'Reels, shorts and YouTube edits',
      'App promo and intro videos',
      'Text animation, captions and sound',
      'Thumbnail design with video work',
      'Freelance earning guidance',
    ],
    image_url: '',
    sort_order: 5,
  },
  {
    title: 'Digital Marketing & Social Media',
    category: 'Digital Marketing',
    duration: '2 Months',
    fee: 'Rs 10,000',
    level: 'Beginner',
    mode: 'On-campus • office laptop provided',
    summary: 'Grow pages, run ads and handle app marketing for clients.',
    description:
      'Learn how apps and businesses get users: page setup, content planning, Facebook / Instagram ads, app install campaigns and reporting. Includes practical work on live pages.',
    highlights: [
      'Facebook, Instagram and page setup',
      'Content calendar and reels strategy',
      'Ad manager — boosting, targeting, budgets',
      'App install and lead campaigns',
      'Reporting and client handling',
      'Live page handling practice',
    ],
    image_url: '',
    sort_order: 6,
  },
  {
    title: 'Play Console Account Handling (Professional)',
    category: 'Google Play Console',
    duration: '1 Month',
    fee: 'Rs 8,000',
    level: 'Professional / Office staff',
    mode: 'On-campus • office laptop provided',
    summary: 'Fast professional track for the Play Console work our office and clients actually need.',
    description:
      'A short professional track for people who want to start earning fast. Focused only on Play Console account handling, uploads, rejections and client accounts — the exact work our office hires for.',
    highlights: [
      'Account creation, verification and recovery basics',
      'Bulk app upload workflow',
      'Rejection, suspension and appeal process',
      'Client account handling and reporting',
      'Confidentiality and account safety rules',
      'Job opportunity in our office after training',
    ],
    image_url: '',
    sort_order: 7,
  },
  {
    title: 'Computer & Office IT Basics',
    category: 'Computer Basics',
    duration: '1 Month',
    fee: 'Rs 5,000',
    level: 'Absolute beginner',
    mode: 'On-campus • office laptop provided',
    summary: 'Start from zero — computer basics, typing, MS Office, email and internet.',
    description:
      'For students who have never used a computer properly. You will learn typing, file management, MS Word / Excel, email, Google tools, internet research and the office discipline needed for any job.',
    highlights: [
      'Typing speed and computer basics',
      'MS Word, Excel, PowerPoint',
      'Email, Google Drive and Docs',
      'Internet research and data entry',
      'Office discipline and communication',
      'Pathway to any advanced course',
    ],
    image_url: '',
    sort_order: 8,
  },
];

const SEED_JOBS = [
  {
    title: 'Google Play Console Operator',
    category: 'Google Play Console',
    type: 'Full Time',
    location: 'Office — Near Sarfraz Colony, Hyderabad',
    salary: 'Rs 25,000 – 40,000 / month',
    positions: 4,
    laptop: true,
    badge: 'Laptop provided',
    training: '3 months course + in-office training, then confirmed job',
    experience: 'Fresh students welcome',
    description:
      'Handle Google Play Console accounts for our office and clients: new account setup, app uploads, release management and day to day account work. Office laptop is provided, you work from our Hyderabad office.',
    requirements: [
      'Basic computer and internet knowledge',
      'Willing to learn Play Console and app publishing',
      'Honest with client account details (confidentiality)',
      'Hyderabad / Sarfraz Colony area preferred',
      'No experience needed — full training provided',
    ],
  },
  {
    title: 'App Publishing Executive',
    category: 'App Publishing',
    type: 'Full Time',
    location: 'Office — Near Sarfraz Colony, Hyderabad',
    salary: 'Rs 22,000 – 35,000 / month',
    positions: 3,
    laptop: true,
    badge: 'Training + Job',
    training: '3 month course then job opportunity in office',
    experience: 'Fresh / 1 year',
    description:
      'Publish and manage client applications on Google Play: preparing listings, graphics, screenshots, version updates and handling the communication with the client side.',
    requirements: [
      'Good attention to detail',
      'Basic graphics / Canva sense is a plus',
      'Typing and file management',
      'Able to work in office full time',
    ],
  },
  {
    title: 'Junior Android App Developer',
    category: 'App Development',
    type: 'Full Time',
    location: 'Office — Near Sarfraz Colony, Hyderabad',
    salary: 'Rs 30,000 – 50,000 / month',
    positions: 2,
    laptop: true,
    badge: 'After course',
    training: 'Course students preferred, 3 month practical training',
    experience: '1 year or strong course project',
    description:
      'Build Android applications for our own products and clients. You will work on real live apps with our team, from screens and features to testing and Play Store release.',
    requirements: [
      'Java / Kotlin basics and Android Studio',
      'Firebase or API experience',
      'At least one published app is a plus',
      'Team work in office',
    ],
  },
  {
    title: 'Data Entry & Apps Data Operator',
    category: 'Data Entry',
    type: 'Full Time / Part Time',
    location: 'Office — Near Sarfraz Colony, Hyderabad',
    salary: 'Rs 18,000 – 25,000 / month',
    positions: 5,
    laptop: true,
    badge: 'Easy start',
    training: 'Short training included',
    experience: 'Fresh',
    description:
      'Accurate data entry work for app accounts, listings and client records. Ideal first job for students who complete the Computer & Office IT Basics course.',
    requirements: [
      'Typing accuracy and speed',
      'MS Excel / Google Sheets basics',
      'Punctual and disciplined',
    ],
  },
  {
    title: 'Social Media Handler',
    category: 'Social Media',
    type: 'Full Time',
    location: 'Office — Near Sarfraz Colony, Hyderabad',
    salary: 'Rs 20,000 – 30,000 / month',
    positions: 2,
    laptop: true,
    badge: '',
    training: 'Digital Marketing course students preferred',
    experience: 'Fresh / 1 year',
    description:
      'Handle our pages and client pages: posting, reels, comments, ad campaigns and monthly reporting. Practical work on live accounts from day one.',
    requirements: [
      'Good Urdu / English writing',
      'Canva or basic designing',
      'Understanding of Facebook & Instagram',
      'Reels and video editing sense is a plus',
    ],
  },
  {
    title: 'Play Console Support & Appeals Officer',
    category: 'Support & Appeals',
    type: 'Full Time',
    location: 'Office — Near Sarfraz Colony, Hyderabad',
    salary: 'Rs 25,000 – 45,000 / month',
    positions: 2,
    laptop: true,
    badge: 'Senior role',
    training: 'Advanced training on real client cases',
    experience: 'Experience with Play policies preferred',
    description:
      'Work on rejected, suspended and policy-flagged apps. Write appeals, prepare evidence, follow up with Google and keep the client updated until the account is healthy again.',
    requirements: [
      'Strong reading and writing in English',
      'Patience and research skill',
      'Understanding of Play Policy is a big plus',
      'Confidential handling of client accounts',
    ],
  },
];

const SEED_SERVICES = [
  {
    title: 'Google Play Console Accounts',
    category: 'Play Console Accounts',
    icon: 'BadgeCheck',
    price: 'From Rs 12,000',
    description:
      'New and existing Play Console developer accounts for individuals and companies — created, verified and prepared for app publishing.',
    features: ['Individual & company accounts', 'Identity / verification guidance', 'Ready for upload and release', 'Account safety briefing'],
    sort_order: 1,
  },
  {
    title: 'App Upload & Publishing',
    category: 'App Publishing',
    icon: 'Rocket',
    price: 'From Rs 5,000',
    description:
      'We upload, prepare the listing, set the testing tracks and publish your app on Google Play — properly, without policy mistakes.',
    features: ['Store listing + graphics', 'Screenshots and feature graphic', 'Closed / open testing setup', 'Production release'],
    sort_order: 2,
  },
  {
    title: 'Rejection & Policy Fix',
    category: 'Rejection & Policy Fix',
    icon: 'ShieldAlert',
    price: 'Case based',
    description:
      'App rejected or account suspended? We read the policy issue, fix the cause and file a proper appeal with evidence.',
    features: ['Rejection reason analysis', 'Fix before re-upload', 'Appeal writing', 'Follow up until review'],
    sort_order: 3,
  },
  {
    title: 'Web & App Development',
    category: 'Web & App Development',
    icon: 'Code2',
    price: 'Project based',
    description:
      'Custom Android apps, business websites and admin panels built by our in-house team — with Play Store publishing included.',
    features: ['Android apps', 'Business websites', 'Admin panels & dashboards', 'Maintenance support'],
    sort_order: 4,
  },
  {
    title: 'Office Laptop Facility',
    category: 'Office Laptop Facility',
    icon: 'Laptop',
    price: 'Free for students & staff',
    description:
      'You do not need your own computer. Every student and team member works on an office laptop with internet in our Hyderabad office.',
    features: ['Office laptop provided', 'Internet + printing', 'AC workspace', 'Sitting for students after course'],
    sort_order: 5,
  },
  {
    title: 'Company Account Setup',
    category: 'Play Console Accounts',
    icon: 'Building2',
    price: 'From Rs 15,000',
    description:
      'Complete setup for companies that want a verified developer account: documents, D-U-N-S guidance and organisation account creation.',
    features: ['Organisation account', 'Documentation help', 'Team member access setup', 'Tax / payment profile guidance'],
    sort_order: 6,
  },
];

const SEED_ADS = [
  {
    title: 'Admissions Open — 3 Month Course',
    body: '3 month professional course with job opportunity after completion. Office laptops provided, limited seats per batch.',
    badge: 'New batch',
    link: '/apply',
    link_label: 'Apply now',
    placement: 'home',
    sort_order: 1,
  },
  {
    title: 'Play Console Accounts Available',
    body: 'Need a Google Play Console account for your app? Individual and company accounts ready with full support.',
    badge: 'Service',
    link: '/services',
    link_label: 'See services',
    placement: 'home',
    sort_order: 2,
  },
  {
    title: 'Free Demo Class This Week',
    body: 'Visit our office near Sarfraz Colony, Hyderabad and attend one class free before you decide. WhatsApp us to book your seat.',
    badge: 'Free',
    link: '/contact',
    link_label: 'Book a seat',
    placement: 'home',
    sort_order: 3,
  },
];

const SEED_STUDENTS = [
  {
    name: 'Ahsan Raza',
    course: 'Google Play Console Mastery',
    batch: 'Batch 12',
    year: '2024',
    position: 'Play Console Operator',
    company: 'Subhan Console Studio (Office)',
    quote: 'Course ke baad office mein 3 month training mili aur phir job confirm ho gayi. Laptop office ne diya.',
    placed: true,
    sort_order: 1,
  },
  {
    name: 'Hira Shaikh',
    course: 'Graphic Design & Branding',
    batch: 'Batch 09',
    year: '2023',
    position: 'Graphic Designer',
    company: 'Local print & media house, Hyderabad',
    quote: 'Play Store icons aur feature graphics ka kaam seekha, ab ghar baithe client work karti hoon.',
    placed: true,
    sort_order: 2,
  },
  {
    name: 'Bilal Ahmed',
    course: 'Android App Development',
    batch: 'Batch 11',
    year: '2024',
    position: 'Junior App Developer',
    company: 'IT company, Hyderabad',
    quote: 'Sir ne live projects pe kaam karwaya, isi liye interview mein confidence tha.',
    placed: true,
    sort_order: 3,
  },
  {
    name: 'Faiza Memon',
    course: 'Digital Marketing & Social Media',
    batch: 'Batch 10',
    year: '2023',
    position: 'Social Media Handler',
    company: 'Clothing brand (remote)',
    quote: 'Pages handle karna aur ads chalana seekha — pehla client course ke andar hi mil gaya.',
    placed: true,
    sort_order: 4,
  },
  {
    name: 'Usman Ali',
    course: 'Computer & Office IT Basics',
    batch: 'Batch 13',
    year: '2025',
    position: 'Data Entry Operator',
    company: 'Subhan Console Studio (Office)',
    quote: 'Zero se shuru kiya tha, ab office mein data entry ka kaam kar raha hoon.',
    placed: true,
    sort_order: 5,
  },
  {
    name: 'Kashif Hussain',
    course: 'Web Development',
    batch: 'Batch 08',
    year: '2023',
    position: 'Freelance Web Developer',
    company: 'Self employed',
    quote: 'Hosting, client dealing aur website banana — sab practical seekha.',
    placed: true,
    sort_order: 6,
  },
];

async function seedCategories() {
  const { rows } = await q('select count(*)::int as n from categories');
  if (rows[0].n > 0) return;
  for (const c of SEED_CATEGORIES) {
    await q('insert into categories (name, kind, icon, sort_order) values ($1,$2,$3,$4)', [c.name, c.kind, c.icon, c.sort_order]);
  }
}

const JSON_COLUMNS = ['highlights', 'requirements', 'features'];
const INT_COLUMNS = ['sort_order', 'positions'];
const BOOL_COLUMNS = ['laptop', 'placed', 'active'];

function castFor(column) {
  if (JSON_COLUMNS.includes(column)) return '::jsonb';
  if (INT_COLUMNS.includes(column)) return '::int';
  if (BOOL_COLUMNS.includes(column)) return '::boolean';
  return '';
}

export function dollarParam(n) {
  return String.fromCharCode(36) + n;
}

async function seedTable(table, rows, columns) {
  const { rows: count } = await q(`select count(*)::int as n from ${table}`);
  if (count[0].n > 0) return;
  let index = 0;
  for (const row of rows) {
    index += 1;
    const keys = columns;
    const values = keys.map((k) => {
      const v = row[k];
      if (v === undefined || v === null) {
        // Seed rows may omit ordering/optional numbers — keep the columns happy.
        if (k === 'sort_order') return index;
        if (k === 'positions') return 1;
        return null;
      }
      if (Array.isArray(v)) return JSON.stringify(v);
      return v;
    });
    const placeholders = keys.map((k, i) => dollarParam(i + 1) + castFor(k)).join(', ');
    await q(`insert into ${table} (${keys.join(', ')}) values (${placeholders})`, values);
  }
}

const COURSE_COLS = ['title', 'category', 'summary', 'description', 'duration', 'fee', 'level', 'mode', 'highlights', 'image_url', 'badge', 'sort_order'];
const JOB_COLS = ['title', 'category', 'description', 'type', 'location', 'salary', 'positions', 'requirements', 'laptop', 'training', 'experience', 'badge', 'sort_order'];
const SERVICE_COLS = ['title', 'category', 'description', 'icon', 'price', 'features', 'sort_order'];
const AD_COLS = ['title', 'body', 'badge', 'link', 'link_label', 'placement', 'sort_order'];
const STUDENT_COLS = ['name', 'course', 'batch', 'year', 'position', 'company', 'quote', 'placed', 'sort_order'];

async function seedAdmin() {
  const { rows } = await q('select count(*)::int as n from admins');
  if (rows[0].n > 0) return;
  const email = (process.env.ADMIN_EMAIL || 'subhanconsolestudio@gmail.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '@Subhanconsole187';
  const hash = await bcrypt.hash(password, 10);
  await q('insert into admins (email, password_hash, name, role) values ($1,$2,$3,$4)', [email, hash, 'Subhan', 'owner']);
  console.log(`[seed] admin account created for ${email}`);
}

async function step(label, fn) {
  try {
    return await fn();
  } catch (err) {
    throw new Error(`${label}: ${err.message}`);
  }
}

async function init() {
  if (!connectionString) {
    throw new Error('DATABASE_URL is not configured for this project yet.');
  }
  await step('schema', () => q(SCHEMA));

  await step('settings', async () => {
    const existing = await one('select data from settings where id = 1');
    if (!existing) {
      const data = { ...DEFAULT_SETTINGS, _jwt_secret: crypto.randomBytes(32).toString('hex') };
      await q('insert into settings (id, data) values (1, $1::jsonb) on conflict (id) do nothing', [JSON.stringify(data)]);
      return;
    }
    const current = existing.data || {};
    const merged = { ...DEFAULT_SETTINGS, ...current };
    if (!current._jwt_secret) merged._jwt_secret = crypto.randomBytes(32).toString('hex');
    if (Object.keys(merged).length !== Object.keys(current).length) {
      await q('update settings set data = $1::jsonb where id = 1', [JSON.stringify(merged)]);
    }
  });

  await step('admin', seedAdmin);
  await step('categories', seedCategories);
  await step('courses', () => seedTable('courses', SEED_COURSES, COURSE_COLS));
  await step('jobs', () => seedTable('jobs', SEED_JOBS, JOB_COLS));
  await step('services', () => seedTable('services', SEED_SERVICES, SERVICE_COLS));
  await step('ads', () => seedTable('ads', SEED_ADS, AD_COLS));
  await step('students', () => seedTable('students', SEED_STUDENTS, STUDENT_COLS));
}

let initPromise = null;
let lastError = null;

export function getDbStatus() {
  return {
    configured: Boolean(process.env.DATABASE_URL),
    ready: Boolean(initPromise),
    error: lastError,
  };
}

export function ensureReady() {
  if (!initPromise) {
    initPromise = init()
      .then(() => {
        lastError = null;
        return true;
      })
      .catch((err) => {
        initPromise = null;
        lastError = String(err.message || err).replace(/\/\/[^@\s]*@/g, '//***@');
        throw err;
      });
  }
  return initPromise;
}

export async function getSettings({ internal = false } = {}) {
  const row = await one('select data from settings where id = 1');
  const data = { ...DEFAULT_SETTINGS, ...(row?.data || {}) };
  if (internal) return data;
  const clean = {};
  for (const [k, v] of Object.entries(data)) {
    if (!k.startsWith('_')) clean[k] = v;
  }
  return clean;
}

export async function saveSettings(patch = {}) {
  const row = await one('select data from settings where id = 1');
  const current = row?.data || {};
  const next = { ...current };
  for (const [k, v] of Object.entries(patch)) {
    if (k.startsWith('_')) continue;
    if (v === null || ['string', 'number', 'boolean'].includes(typeof v)) next[k] = v;
  }
  await q('update settings set data = $1::jsonb, updated_at = now() where id = 1', [JSON.stringify({ ...DEFAULT_SETTINGS, ...next })]);
  return getSettings();
}

export async function getJwtSecret() {
  const row = await one("select data->>'_jwt_secret' as secret from settings where id = 1");
  if (row?.secret) return row.secret;
  const secret = crypto.randomBytes(32).toString('hex');
  await q("update settings set data = jsonb_set(data, '{_jwt_secret}', to_jsonb($1::text)) where id = 1", [secret]);
  return secret;
}
