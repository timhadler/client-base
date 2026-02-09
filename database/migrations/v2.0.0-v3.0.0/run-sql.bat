@echo off
setlocal

set DB_HOST=localhost
set DB_USER=root
set DB_PASS=password
set DB_NAME=clientbase

cd /d "%~dp0"

echo Starting SQL execution...
echo.

for %%f in (*.sql) do (
    echo ----------------------------------
    echo Running %%f

    mariadb -h %DB_HOST% -u %DB_USER% -p%DB_PASS% %DB_NAME% < "%%f"

    if errorlevel 1 (
        echo.
        echo ERROR in %%f
        echo Execution stopped.
        exit /b 1
    )
)

echo.
echo All SQL files ran successfully.
pause
