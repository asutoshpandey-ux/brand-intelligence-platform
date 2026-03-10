# Helper script to sync local .env.local secrets to Vercel securely
# This keeps your keys hidden from GitHub while making Vercel work instantly.

Write-Host "🔐 Syncing secrets to Vercel..." -ForegroundColor Cyan

if (-Not (Test-Path ".env.local")) {
    Write-Error "Error: .env.local file not found!"
    exit
}

# Read .env.local and add each variable to Vercel
Get-Content .env.local | Where-Object { $_ -match "=" -and $_ -notmatch "^#" } | ForEach-Object {
    $parts = $_.Split("=", 2)
    $key = $parts[0].Trim()
    $val = $parts[1].Trim()
    
    Write-Host "Adding $key..."
    echo $val | vercel env add $key production
}

Write-Host "✅ All secrets synced! Now run: vercel --prod" -ForegroundColor Green
