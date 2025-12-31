<#
Local helper to deploy to Vercel non-interactively using an environment token.
Usage:
  $env:VERCEL_TOKEN = 'your_token_here'; .\scripts\deploy-vercel.ps1

This will call npx vercel --prod --token $env:VERCEL_TOKEN --confirm
#>
param()

if (-not $env:VERCEL_TOKEN) {
  Write-Host "Please set the VERCEL_TOKEN environment variable before running this script." -ForegroundColor Yellow
  Write-Host "Example (PowerShell):`n  $env:VERCEL_TOKEN='your_token_here'`n  .\scripts\deploy-vercel.ps1"
  exit 1
}

Write-Host "Installing dependencies..."
npm ci

Write-Host "Building project..."
npm run build

Write-Host "Deploying to Vercel (non-interactive)..."
npx vercel --prod --token $env:VERCEL_TOKEN --confirm