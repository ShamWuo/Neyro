# Check Authentication and Database Setup
Write-Host "=== Checking Authentication Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check .env file
if (Test-Path .env) {
    Write-Host "✅ .env file exists" -ForegroundColor Green
    $envContent = Get-Content .env
    
    # Check required variables
    $required = @(
        "DATABASE_URL",
        "AUTH_SECRET",
        "GOOGLE_CLIENT_ID",
        "GOOGLE_CLIENT_SECRET"
    )
    
    $missing = @()
    foreach ($var in $required) {
        $found = $envContent | Select-String "^$var="
        if ($found) {
            Write-Host "✅ $var is set" -ForegroundColor Green
        } else {
            Write-Host "❌ $var is MISSING" -ForegroundColor Red
            $missing += $var
        }
    }
    
    # Check NEXTAUTH_URL
    $nextAuthUrl = $envContent | Select-String "^NEXTAUTH_URL="
    if ($nextAuthUrl) {
        if ($nextAuthUrl.Line -match "localhost:3001") {
            Write-Host "✅ NEXTAUTH_URL is set for local development" -ForegroundColor Green
        } elseif ($nextAuthUrl.Line -match "vercel|neyro\.app") {
            Write-Host "⚠️  NEXTAUTH_URL is set to production URL" -ForegroundColor Yellow
            Write-Host "   For local dev, change to: NEXTAUTH_URL=http://localhost:3001" -ForegroundColor Yellow
        } else {
            Write-Host "✅ NEXTAUTH_URL is set" -ForegroundColor Green
        }
    } else {
        Write-Host "ℹ️  NEXTAUTH_URL not set (will auto-detect)" -ForegroundColor Cyan
    }
    
    Write-Host ""
    if ($missing.Count -gt 0) {
        Write-Host "❌ Missing required environment variables:" -ForegroundColor Red
        $missing | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
        Write-Host ""
        Write-Host "Please add these to your .env file" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "❌ .env file NOT found" -ForegroundColor Red
    Write-Host "Please create a .env file with required variables" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "=== Testing Database Connection ===" -ForegroundColor Cyan

# Try to test Prisma connection
try {
    $prismaCheck = npx prisma db pull --dry-run 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database connection successful" -ForegroundColor Green
    } else {
        Write-Host "❌ Database connection failed" -ForegroundColor Red
        Write-Host "Error: $prismaCheck" -ForegroundColor Red
        Write-Host ""
        Write-Host "Troubleshooting:" -ForegroundColor Yellow
        Write-Host "1. Check DATABASE_URL in .env file" -ForegroundColor Yellow
        Write-Host "2. Verify database is running/accessible" -ForegroundColor Yellow
        Write-Host "3. Check network connectivity" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Could not test database connection" -ForegroundColor Yellow
    Write-Host "   Error: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Checking Prisma Client ===" -ForegroundColor Cyan

if (Test-Path "node_modules\.prisma\client\index.js") {
    Write-Host "✅ Prisma client is generated" -ForegroundColor Green
} else {
    Write-Host "⚠️  Prisma client not found" -ForegroundColor Yellow
    Write-Host "   Run: npx prisma generate" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "If all checks pass, try signing in at: http://localhost:3001/auth/login" -ForegroundColor Cyan
Write-Host "If sign-in fails, check:" -ForegroundColor Yellow
Write-Host "1. Google OAuth redirect URI is configured for http://localhost:3001/api/auth/callback/google" -ForegroundColor Yellow
Write-Host "2. Dev server is restarted after .env changes" -ForegroundColor Yellow
Write-Host "3. Browser console for OAuth errors" -ForegroundColor Yellow

