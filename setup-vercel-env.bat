@echo off
REM Script to add environment variables to Vercel
REM This will prompt for each variable and add them to production, preview, and development

echo Adding Environment Variables to Vercel...
echo.

echo Adding DATABASE_URL...
vercel env add DATABASE_URL production preview development

echo.
echo Adding NEXT_PUBLIC_SUPABASE_URL...
vercel env add NEXT_PUBLIC_SUPABASE_URL production preview development

echo.
echo Adding NEXT_PUBLIC_SUPABASE_ANON_KEY...
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production preview development

echo.
echo All environment variables have been added!
echo Now deploying to production...
echo.

vercel --prod
