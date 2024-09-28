@echo off
REM Change to the directory where your .mjs file is located
cd /d "C:\users\owner\downloads\listing\chunks\split-pdf.mjs"

REM Run the .mjs script with the correct PDF path
node --experimental-modules split-pdf.mjs "C:\users\owner\downloads\listing\ipfs\temp\1.pdf" >> log.txt 2>&1

REM Check if the script ran successfully
if %ERRORLEVEL% == 0 (
    echo Script ran successfully!
) else (
    echo There was an error running the script. Check log.txt for details.
)

pause
