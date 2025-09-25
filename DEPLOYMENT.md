# OceoChat Deployment Guide

## Vercel Deployment

### Prerequisites
1. Vercel account
2. GitHub repository
3. Environment variables

### Environment Variables
Set these in your Vercel dashboard:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

### Deployment Steps

1. **Connect Repository**
   - Go to Vercel dashboard
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Build Settings**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Set Environment Variables**
   - Add all required environment variables
   - Make sure to mark public variables with `NEXT_PUBLIC_` prefix

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your app

### Build Configuration

The app includes:
- `next.config.js` with production optimizations
- `vercel.json` with deployment settings
- TypeScript and ESLint error ignoring for deployment
- Proper external package handling for Google Generative AI

### Database Setup

Make sure your Supabase database has the following tables:
- `conversations` (id, user_id, title, created_at, updated_at)
- `messages` (id, conversation_id, role, content, user_id, created_at, metadata)
- `profiles` (id, user_id, email, created_at, updated_at)

### API Keys Required

1. **Google Gemini API Key**
   - Get from Google AI Studio
   - Set as `GEMINI_API_KEY`

2. **Supabase Keys**
   - Get from Supabase dashboard
   - Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Post-Deployment

1. Test all API endpoints
2. Verify authentication works
3. Check ocean data integration
4. Test chat functionality
5. Verify about page loads correctly

## Troubleshooting

### Common Issues

1. **Build Errors**
   - TypeScript errors are ignored in production
   - ESLint errors are ignored in production
   - Check environment variables are set

2. **API Errors**
   - Verify Gemini API key is valid
   - Check Supabase connection
   - Ensure database tables exist

3. **Authentication Issues**
   - Verify Supabase auth settings
   - Check redirect URLs in Supabase dashboard

### Performance Optimization

- Images are optimized automatically
- Dynamic imports for heavy components
- Server-side rendering for better SEO
- Proper caching headers

## About Page

The app includes a comprehensive about page at `/about-us` featuring:
- YAKREEN Technologies branding
- Product information
- Technology stack details
- Contact information
- Professional design

## Features Ready for Production

✅ ChatGPT-style AI responses
✅ Real-time ocean data integration
✅ Live data visualizations
✅ Automatic chat naming
✅ Manual chat renaming
✅ Professional UI/UX
✅ About page with company info
✅ Vercel deployment ready
✅ Environment configuration
✅ Error handling
✅ TypeScript support
✅ Responsive design
