# PowerShell setup script for vince-chrome-extension-template
Write-Host "Setting up vit command shortcut..." -ForegroundColor Green

# Create function for vit command
function vit { 
    # This function wraps the local vit command
    & ".\node_modules\.bin\vit" @args 
}

Write-Host "Setup complete!" -ForegroundColor Green
Write-Host "You can now use 'vit' command directly" -ForegroundColor Yellow
Write-Host "Example: vit init, vit commit, vit newbranch, etc." -ForegroundColor Yellow 