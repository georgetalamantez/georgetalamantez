@echo off
set sourceDir=C:\Users\Owner\Documents\GitHub\georgetalamantez\urls
set destDir=C:\Users\Owner\Downloads\listing\ipfs\movies

:: Check if destination directory exists, if not create it
if not exist "%destDir%" (
    mkdir "%destDir%"
)

:: Move .torrent files
move "%sourceDir%\*.torrent" "%destDir%\"

echo All .torrent files have been moved.
pause
