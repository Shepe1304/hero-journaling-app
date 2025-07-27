# Hero Journaling App (Odyscribe)

Turn your life into an epic story. **Odyscribe** is a fantasy-themed journaling web app that transforms your daily reflections into immersive, AI-generated narrative chapters—complete with mood tracking, markdown support, and narration.

---

## ✨ Features

- **Fantasy-Themed Journaling:** Write daily entries with mood selection and markdown formatting
- **AI-Powered Chapters:** Convert your journal entries into narrative chapters using AI, with selectable story tone and narrator persona
- **Storybook:** Collect and revisit your generated chapters in a personal storybook
- **Narration Mode:** Listen to your chapters with voice narration and background music
- **Dashboard:** View, search, and filter your entries by mood, date, or title
- **Profile & Stats:** Track your journaling streak, entry/chapter stats, and recent activity
- **Authentication:** Secure sign up, login, and session management via Supabase
- **Responsive Design:** Optimized for desktop and mobile

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router, React 19, Turbopack)
- **Database & Auth:** [Supabase](https://supabase.com/)
- **AI Integration:** OpenAI (via Nebius API)
- **UI Framework:** Tailwind CSS with tailwindcss-animate
- **Components:** Radix UI primitives (Select, Tabs, Dropdown, etc.)
- **Icons:** Lucide React
- **Deployment:** Vercel/Netlify (or any Node.js host)

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- npm or yarn
- Supabase project (for DB & Auth)
- Nebius API key (for AI chapter generation)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/odyscribe.git
   cd odyscribe
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables:**

   - Copy `.env.example` to `.env.local` and fill in your credentials:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     NEBIUS_API_KEY=your_nebius_api_key
     ```

4. **Set up the database:**

   - Run the SQL schema in your Supabase project (see [Database Schema](#database-schema))

5. **Run the development server:**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser:**
   - Visit [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
odyscribe/
├── app/                     # Next.js app directory (routing, pages, API)
│   ├── api/                 # API routes (AI chapter generation)
│   ├── auth/                # Authentication pages (login, sign-up)
│   ├── chapter/             # Chapter generation & display
│   ├── dashboard/           # Main dashboard
│   ├── entry/               # Journal entry CRUD operations
│   ├── landing/             # Marketing/landing page
│   ├── profile/             # User profile & statistics
│   ├── protected/           # Protected route components
│   ├── storybook/           # Chapter collection and reading
│   ├── utils/               # Utility functions
│   ├── globals.css          # Global styles and Tailwind imports
│   ├── layout.tsx           # Root layout component
│   └── page.tsx             # Home page
├── components/              # Reusable UI and logic components
├── lib/                     # Supabase client, middleware, utilities
├── public/                  # Static assets (favicon, images)
├── .env.example             # Example environment variables
├── components.json          # Radix UI configuration
├── middleware.ts            # Next.js middleware for auth
├── next.config.ts           # Next.js configuration
├── package.json             # Dependencies and scripts
├── tailwind.config.ts       # Tailwind CSS configuration
└── tsconfig.json            # TypeScript configuration
```

---

## 🎭 Key Concepts

- **Journal Entries:** Write daily reflections, select a mood, and use markdown for rich formatting
- **Chapters:** Transform entries into narrative chapters using AI. Choose from different story tones and narrator personas (e.g., Wise Sage, Cheeky Bard)
- **Storybook:** Your generated chapters are collected in a personal storybook for easy reading and listening
- **Narration:** Listen to your chapters with built-in narration mode and background music
- **Authentication:** All user data is private and secured via Supabase Auth with RLS policies

---

## 🗄️ Database Schema

The app uses two main tables in Supabase:

### journal_entries

- Basic journal entry information with mood tracking and markdown content

### journal_chapters

```sql
create table public.journal_chapters (
  id uuid not null default gen_random_uuid (),
  entry_id uuid null,
  user_id uuid null,
  title text null,
  content text null,
  story_tone text null,
  narrator text null,
  status text null default 'draft'::text,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  summary text null,
  constraint journal_chapters_pkey primary key (id),
  constraint journal_chapters_entry_id_fkey foreign KEY (entry_id) references journal_entries (id) on delete CASCADE,
  constraint journal_chapters_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
);
```

---

## 🔧 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Integration
NEBIUS_API_KEY=your_nebius_api_key
```

See [.env.example](.env.example) for the template.

---

## 📜 Available Scripts

- `npm run dev` — Start development server with Turbopack
- `npm run build` — Build for production
- `npm run start` — Start production server
- `npm run lint` — Lint code with ESLint

---

## 🎨 UI Components

The app uses a modern component architecture with:

- **Radix UI Primitives:** Accessible, unstyled components
- **Tailwind CSS:** Utility-first styling with custom animations
- **Dark/Light Mode:** Automatic theme switching with next-themes
- **Responsive Design:** Mobile-first approach with Tailwind breakpoints

---

## 🤖 AI Integration

Odyscribe uses OpenAI models through the Nebius API to:

- Transform journal entries into narrative chapters
- Support multiple story tones (epic, whimsical, dramatic, etc.)
- Generate content with different narrator personalities
- Create chapter summaries for quick reference

---

## 🔐 Authentication & Security

- **Supabase Auth:** Handles user registration, login, and session management
- **Row Level Security (RLS):** Ensures users can only access their own data
- **Middleware Protection:** Server-side route protection for authenticated pages
- **Type Safety:** Full TypeScript support for secure development

---

## 🚀 Deployment

The app is optimized for deployment on:

- **Vercel** (recommended for Next.js apps)
- **Netlify**
- Any Node.js hosting provider

Make sure to set your environment variables in your deployment platform.

---

## 🤝 Contributing

Pull requests and issues are welcome! Please:

1. Open an issue to discuss your idea or bug before submitting a PR
2. Follow the existing code style and conventions
3. Test your changes thoroughly
4. Update documentation as needed

---

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

**Odyscribe** — Journal your journey. Become the hero of your own story. ⚔️✨
