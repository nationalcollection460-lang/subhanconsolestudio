export type FieldDef = {
  name: string;
  label: string;
  type?: 'text' | 'textarea' | 'select' | 'number' | 'toggle' | 'list' | 'image';
  options?: string[] | ((site: any) => string[]);
  placeholder?: string;
  hint?: string;
  required?: boolean;
  full?: boolean;
};

export type ResourceConfig = {
  key: string;
  title: string;
  subtitle: string;
  singular: string;
  endpoint: string;
  titleField: string;
  imageField?: string;
  badgeField?: string;
  activeField?: string;
  tableColumns: { name: string; label: string }[];
  folder: string;
  fields: FieldDef[];
};

export const RESOURCES: Record<string, ResourceConfig> = {
  courses: {
    key: 'courses',
    title: 'Courses',
    subtitle: 'Add or change the courses shown on the website (fees, duration, details).',
    singular: 'course',
    endpoint: '/admin/courses',
    titleField: 'title',
    imageField: 'image_url',
    badgeField: 'badge',
    activeField: 'active',
    folder: 'courses',
    tableColumns: [
      { name: 'category', label: 'Category' },
      { name: 'duration', label: 'Duration' },
      { name: 'fee', label: 'Fee' },
    ],
    fields: [
      { name: 'title', label: 'Course title *', required: true, placeholder: 'e.g. Google Play Console Mastery' },
      { name: 'category', label: 'Category', type: 'select', options: (site) => site?.categories?.course || [] },
      { name: 'duration', label: 'Duration', placeholder: '3 Months' },
      { name: 'fee', label: 'Fee', placeholder: 'Rs 15,000 (instalments available)' },
      { name: 'level', label: 'Level', placeholder: 'Beginner to Pro' },
      { name: 'mode', label: 'Mode / facility', placeholder: 'On-campus • office laptop provided' },
      { name: 'summary', label: 'Short summary (shown on cards)', type: 'textarea' },
      { name: 'description', label: 'Full details', type: 'textarea' },
      { name: 'highlights', label: 'What students will learn (one point per line)', type: 'list', full: true },
      { name: 'image_url', label: 'Course photo', type: 'image', full: true },
      { name: 'badge', label: 'Badge', placeholder: 'Most popular' },
      { name: 'sort_order', label: 'Sort order', type: 'number', hint: 'Smaller number shows first' },
      { name: 'active', label: 'Show on website', type: 'toggle' },
    ],
  },
  jobs: {
    key: 'jobs',
    title: 'Jobs & work',
    subtitle: 'Office jobs and work services. These are shown on the Jobs page and on the home page.',
    singular: 'job',
    endpoint: '/admin/jobs',
    titleField: 'title',
    badgeField: 'badge',
    activeField: 'active',
    folder: 'jobs',
    tableColumns: [
      { name: 'category', label: 'Category' },
      { name: 'salary', label: 'Salary' },
      { name: 'positions', label: 'Seats' },
    ],
    fields: [
      { name: 'title', label: 'Job / work title *', required: true, placeholder: 'e.g. Google Play Console Operator' },
      { name: 'category', label: 'Category', type: 'select', options: (site) => site?.categories?.job || [] },
      { name: 'type', label: 'Type', placeholder: 'Full Time / Part Time' },
      { name: 'salary', label: 'Salary', placeholder: 'Rs 25,000 – 40,000 / month' },
      { name: 'location', label: 'Location', placeholder: 'Office — Near Sarfraz Colony, Hyderabad' },
      { name: 'positions', label: 'Number of seats', type: 'number' },
      { name: 'experience', label: 'Experience needed', placeholder: 'Fresh students welcome' },
      { name: 'training', label: 'Training note', placeholder: '3 months course + in-office training, then job' },
      { name: 'description', label: 'What is the work?', type: 'textarea', full: true },
      { name: 'requirements', label: 'Requirements (one per line)', type: 'list', full: true },
      { name: 'laptop', label: 'Laptop provided by office', type: 'toggle' },
      { name: 'badge', label: 'Badge', placeholder: 'Laptop provided' },
      { name: 'sort_order', label: 'Sort order', type: 'number' },
      { name: 'active', label: 'Show on website', type: 'toggle' },
    ],
  },
  services: {
    key: 'services',
    title: 'Client services',
    subtitle: 'Paid services for clients — Play Console accounts, app publishing, appeals, development.',
    singular: 'service',
    endpoint: '/admin/services',
    titleField: 'title',
    imageField: 'image_url',
    activeField: 'active',
    folder: 'services',
    tableColumns: [
      { name: 'category', label: 'Category' },
      { name: 'price', label: 'Price' },
    ],
    fields: [
      { name: 'title', label: 'Service title *', required: true, placeholder: 'e.g. App Upload & Publishing' },
      { name: 'category', label: 'Category', type: 'select', options: (site) => site?.categories?.service || [] },
      { name: 'price', label: 'Price', placeholder: 'From Rs 5,000' },
      { name: 'icon', label: 'Icon', placeholder: 'Rocket / BadgeCheck / Code2 / Laptop' },
      { name: 'description', label: 'Description', type: 'textarea', full: true },
      { name: 'features', label: 'Features (one per line)', type: 'list', full: true },
      { name: 'image_url', label: 'Photo (optional)', type: 'image', full: true },
      { name: 'sort_order', label: 'Sort order', type: 'number' },
      { name: 'active', label: 'Show on website', type: 'toggle' },
    ],
  },
  ads: {
    key: 'ads',
    title: 'Ads & announcements',
    subtitle: 'Small announcement cards shown on the home page (new batch, offers, free demo class).',
    singular: 'ad',
    endpoint: '/admin/ads',
    titleField: 'title',
    imageField: 'image_url',
    badgeField: 'badge',
    activeField: 'active',
    folder: 'ads',
    tableColumns: [
      { name: 'badge', label: 'Badge' },
      { name: 'link', label: 'Link' },
    ],
    fields: [
      { name: 'title', label: 'Title *', required: true, placeholder: 'Admissions Open — 3 Month Course' },
      { name: 'badge', label: 'Badge', placeholder: 'New batch' },
      { name: 'body', label: 'Text', type: 'textarea', full: true },
      { name: 'link', label: 'Link', placeholder: '/apply or https://wa.me/92…' },
      { name: 'link_label', label: 'Link button text', placeholder: 'Apply now' },
      { name: 'image_url', label: 'Photo (optional)', type: 'image', full: true },
      { name: 'sort_order', label: 'Sort order', type: 'number' },
      { name: 'active', label: 'Show on website', type: 'toggle' },
    ],
  },
  students: {
    key: 'students',
    title: 'Students',
    subtitle: 'Add student names, photos, course, job/company and their feedback. Shown on the Students page.',
    singular: 'student',
    endpoint: '/admin/students',
    titleField: 'name',
    imageField: 'photo_url',
    activeField: 'active',
    folder: 'students',
    tableColumns: [
      { name: 'course', label: 'Course' },
      { name: 'position', label: 'Job' },
      { name: 'year', label: 'Year' },
    ],
    fields: [
      { name: 'name', label: 'Student name *', required: true },
      { name: 'course', label: 'Course completed', type: 'select', options: (site) => site?.categories?.course || [] },
      { name: 'batch', label: 'Batch', placeholder: 'Batch 12' },
      { name: 'year', label: 'Year', placeholder: '2025' },
      { name: 'position', label: 'Job / position now', placeholder: 'Play Console Operator' },
      { name: 'company', label: 'Company / workplace', placeholder: 'Subhan Console Studio (Office)' },
      { name: 'quote', label: 'Student feedback', type: 'textarea', full: true },
      { name: 'photo_url', label: 'Student photo', type: 'image', full: true },
      { name: 'placed', label: 'Working now (placed)', type: 'toggle' },
      { name: 'sort_order', label: 'Sort order', type: 'number' },
      { name: 'active', label: 'Show on website', type: 'toggle' },
    ],
  },
  categories: {
    key: 'categories',
    title: 'Categories',
    subtitle: 'Categories used in the filters and dropdowns (course, job, service).',
    singular: 'category',
    endpoint: '/admin/categories',
    titleField: 'name',
    activeField: 'active',
    folder: 'uploads',
    tableColumns: [
      { name: 'kind', label: 'Type' },
      { name: 'icon', label: 'Icon' },
    ],
    fields: [
      { name: 'name', label: 'Category name *', required: true, placeholder: 'e.g. Google Play Console' },
      { name: 'kind', label: 'Type', type: 'select', options: ['course', 'job', 'service'], hint: 'course = courses list, job = jobs list, service = client services' },
      { name: 'icon', label: 'Icon name (optional)', placeholder: 'Smartphone / Code2 / Rocket' },
      { name: 'sort_order', label: 'Sort order', type: 'number' },
      { name: 'active', label: 'Active', type: 'toggle' },
    ],
  },
};
