@echo off
echo Building Lost & Found System...

REM Create directories if they don't exist
if not exist bin mkdir bin
if not exist data mkdir data

REM Try to compile with Visual Studio C++ (cl.exe)
where cl >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Found Visual Studio C++ compiler
    cl /EHsc /I.\include /Fe:bin\lostfound.exe src\main.cpp src\Storage.cpp src\Services.cpp src\Trie.cpp
    if %ERRORLEVEL% EQU 0 (
        echo Build successful!
        echo Run the program with: bin\lostfound.exe
    ) else (
        echo Build failed with Visual Studio compiler
    )
) else (
    echo Visual Studio C++ compiler not found
    echo Please install Visual Studio Build Tools or MinGW-w64
    echo.
    echo Alternative: Use online compiler like:
    echo - OnlineGDB (https://www.onlinegdb.com/)
    echo - Replit (https://replit.com/)
    echo - Compiler Explorer (https://godbolt.org/)
)

pause
