# Fix Next.js build issues by cleaning and rebuilding

Write-Host "🧹 Cleaning build artifacts..." -ForegroundColor Yellow

# Remove .next directory if it exists
if (Test-Path .next) {
    Remove-Item -Recurse -Force .next
    Write-Host "✅ Removed .next directory" -ForegroundColor Green
} else {
    Write-Host "ℹ️  .next directory doesn't exist" -ForegroundColor Cyan
}

# Remove node_modules/.cache if it exists
if (Test-Path node_modules\.cache) {
    Remove-Item -Recurse -Force node_modules\.cache
    Write-Host "✅ Removed node_modules/.cache" -ForegroundColor Green
}

# Clear Next.js build cache
if (Test-Path .next\cache) {
    Remove-Item -Recurse -Force .next\cache
    Write-Host "✅ Cleared Next.js cache" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔨 Rebuilding Next.js..." -ForegroundColor Yellow
npm run build

Write-Host ""
Write-Host "✅ Build complete! You can now run 'npm run dev'" -ForegroundColor Green
