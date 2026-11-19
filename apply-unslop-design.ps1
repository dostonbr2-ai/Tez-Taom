Copy-Item -Path ".\_backup_unslop_design\*.html" -Destination ".\" -Force
Copy-Item -Recurse -Path ".\_backup_unslop_design\css\*" -Destination ".\css\" -Force
Copy-Item -Recurse -Path ".\_backup_unslop_design\js\*" -Destination ".\js\" -Force
Write-Host "Unslop dizayni faollashtirildi! (Unslop design applied successfully!)" -ForegroundColor Green
