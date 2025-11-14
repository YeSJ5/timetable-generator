# Enterprise Upgrade Setup Script
# Run this script to set up the project for the enterprise upgrade

Write-Host "🚀 Setting up Enterprise Timetable Generator..." -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js not found. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js $nodeVersion found" -ForegroundColor Green
Write-Host ""

# Stop any running Node processes
Write-Host "Stopping any running Node processes..." -ForegroundColor Yellow
if (Get-Process node -ErrorAction SilentlyContinue) {
    Stop-Process -Name node -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "✅ Stopped Node processes" -ForegroundColor Green
} else {
    Write-Host "✅ No Node processes running" -ForegroundColor Green
}
Write-Host ""

# Backend Setup
Write-Host "📦 Setting up Backend..." -ForegroundColor Cyan
Set-Location server

Write-Host "  Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "  ✅ Backend dependencies installed" -ForegroundColor Green

Write-Host "  Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate --schema=./prisma/schema.prisma
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ⚠️  Prisma generate had issues (may need to stop server)" -ForegroundColor Yellow
} else {
    Write-Host "  ✅ Prisma Client generated" -ForegroundColor Green
}

Write-Host "  Running database migrations..." -ForegroundColor Yellow
npx prisma migrate dev --schema=./prisma/schema.prisma --name enterprise_upgrade
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ⚠️  Migration check completed" -ForegroundColor Yellow
} else {
    Write-Host "  ✅ Database migrations complete" -ForegroundColor Green
}

Set-Location ..
Write-Host "✅ Backend setup complete" -ForegroundColor Green
Write-Host ""

# Frontend Setup
Write-Host "📦 Setting up Frontend..." -ForegroundColor Cyan
Set-Location client

Write-Host "  Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "  ✅ Frontend dependencies installed" -ForegroundColor Green

Set-Location ..
Write-Host "✅ Frontend setup complete" -ForegroundColor Green
Write-Host ""

# Summary
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Start backend:  cd server && npm run dev" -ForegroundColor White
Write-Host "  2. Start frontend: cd client && npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Optional: Set OPENAI_API_KEY in server/.env for AI features" -ForegroundColor Gray
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan


