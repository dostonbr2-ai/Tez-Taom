Copy-Item -Path ".\_backup_original_design\*.html" -Destination ".\" -Force
Copy-Item -Recurse -Path ".\_backup_original_design\css\*" -Destination ".\css\" -Force
Copy-Item -Recurse -Path ".\_backup_original_design\js\*" -Destination ".\js\" -Force
Write-Host "Asl dizayn muvaffaqiyatli tiklandi! (Original design restored successfully!)" -ForegroundColor Green
