# West Coast Swing Cape Town Website

A modern, accessible website for the West Coast Swing Cape Town community built with Next.js 15, React 18, and Tailwind CSS.

## 🎨 Design

This website implements the **Dual Accent** design variant featuring:
- **Primary Colors**: Cloud Dancer (#f0eee9) background, Dark text (#282723)
- **Accent Colors**: Yellow (#FFD117) and Pink (#db409c)
- **Typography**: League Spartan for headings, Inter for body text
- **Approach**: Neurodivergent-friendly with generous whitespace and clear visual hierarchy

## 🚀 Features

### Completed
- ✅ Responsive Header with sticky navigation
- ✅ Hero section with:
  - Background image (dancers with Table Mountain)
  - Gradient subtitle
  - 7 expandable feature blocks (alternating yellow/pink)
  - Smooth scroll to preferences poll
- ✅ Interactive Preferences Poll with:
  - Multi-select card UI
  - Email capture with localStorage
  - Thank you state
- ✅ What is WCS section with YouTube video embed
- ✅ Who Are We section with community story
- ✅ Skills Tracker teaser with email signup
- ✅ Map section for neighborhood voting
- ✅ Contact section with social links and SVG icons
- ✅ Footer with alternating hover colors
- ✅ API routes for data collection (console logging for now)

### Interactive Features
- Feature blocks expand/collapse with accordion behavior
- Preference cards select/deselect with visual feedback
- Map zones provide single-selection voting
- Email auto-population from poll to skills tracker
- Smooth scrolling throughout

## 📁 Project Structure

```
wcs-website/
├── app/
│   ├── layout.tsx          # Root layout with fonts and metadata
│   ├── page.tsx            # Main homepage
│   ├── globals.css         # Tailwind config and custom styles
│   └── api/                # API routes
│       ├── poll-submit/
│       ├── skills-signup/
│       └── map-vote/
├── components/
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── FeatureBlock.tsx
│   ├── PreferencesPoll.tsx
│   ├── WhatIsWCS.tsx
│   ├── WhoAreWe.tsx
│   ├── SkillsTracker.tsx
│   ├── MapSection.tsx
│   ├── ContactSection.tsx
│   └── Footer.tsx
└── public/
    └── images/
        ├── dancers_black.png
        └── WCS CT Logo black.png
```

## 🛠️ Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

The development server will be available at `http://localhost:3000`

### Environment Variables
Currently no environment variables needed. For future database integration:

```bash
# .env.local (create this file)
POSTGRES_URL=your_database_url
# or
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
```

## 📊 Data Collection

All form submissions currently log to console. API routes are ready for database integration:

- `/api/poll-submit` - Preference poll responses
- `/api/skills-signup` - Skills tracker email signups
- `/api/map-vote` - Neighborhood voting

### To Add Database
1. Choose provider (Vercel Postgres, Supabase, etc.)
2. Add connection string to `.env.local`
3. Update API routes in `app/api/*/route.ts` to save data
4. Create tables using schema in technical spec document

## 🎯 Next Steps

### Phase 1 Complete ✅
- Project setup
- All homepage sections built
- Basic interactivity working
- API routes created

### Phase 2 (Suggested)
1. **Database Integration**
   - Connect Vercel Postgres or Supabase
   - Store poll responses, emails, and votes
   - Admin dashboard to view responses

2. **Additional Pages**
   - What's On / Events calendar
   - Our Story (full timeline)
   - Meet the Team (with photos and bios)
   - About WCS (detailed info)
   - Community resources page
   - Code of Conduct

3. **Mobile Menu**
   - Implement hamburger menu functionality
   - Slide-out navigation drawer
   - Links to all pages

4. **Skills Tracker Feature**
   - Build interactive skills tracker
   - Progress visualization
   - User authentication

5. **Testing & Optimization**
   - Performance optimization
   - Accessibility audit (WCAG AA compliance)
   - Cross-browser testing
   - SEO improvements

## 🚢 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Vercel will auto-detect Next.js and deploy
4. Add custom domain if desired

### Manual Deployment
```bash
# Build the project
npm run build

# Output will be in .next folder
# Deploy .next and package.json to your hosting provider
```

## 📝 Design Specs

Full design specifications are in:
- `context/WCS_Website_Spec_Document1_Content.md` - Content strategy
- `context/WCS_Website_Spec_Document2_Design.md` - Visual design (Dual Accent)
- `context/WCS_Website_Spec_Document3_Technical.md` - Technical implementation

## 🎨 Customization

### Colors
Edit `app/globals.css` to change the color scheme:
```css
--color-cloud-dancer: #f0eee9;
--color-text-dark: #282723;
--color-yellow-accent: #FFD117;
--color-pink-accent: #db409c;
```

### Fonts
Edit `app/layout.tsx` to change fonts:
```typescript
import { League_Spartan, Inter } from "next/font/google";
```

### Content
All content is in the components. Edit the respective component files to update copy.

## 🐛 Known Issues

None currently! 🎉

## 📄 License

This project is for the West Coast Swing Cape Town community.

## 🤝 Contributing

If you're part of the WCS Cape Town community and want to contribute:
1. Contact the community leads
2. Fork the repository
3. Make your changes
4. Submit a pull request

## 📧 Contact

- Email: hello@wcscapetown.co.za
- Instagram: [@wcscapetown](https://instagram.com/wcscapetown)
- Facebook: [West Coast Swing Cape Town](https://facebook.com/wcscapetown)

---

Built with ❤️ for the WCS Cape Town community
