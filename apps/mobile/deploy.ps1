# Neyro V2 - Quick Deploy Script
# Run these commands in order

# Step 1: Install EAS CLI (one-time setup)
Write-Host "Installing EAS CLI..." -ForegroundColor Cyan
npm install -g eas-cli

# Step 2: Login to Expo
Write-Host "`nLogging in to Expo..." -ForegroundColor Cyan
eas login

# Step 3: Configure EAS (first time only)
Write-Host "`nConfiguring EAS build..." -ForegroundColor Cyan
eas build:configure

# Step 4: Build preview for both platforms
Write-Host "`nStarting build for iOS and Android..." -ForegroundColor Cyan
Write-Host "This will take ~20 minutes. You'll get shareable links when done." -ForegroundColor Yellow
eas build --platform all --profile preview

Write-Host "`n✅ Build complete! Check the links above to download and share with testers." -ForegroundColor Green
