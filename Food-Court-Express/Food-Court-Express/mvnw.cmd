@echo off
setlocal
set "MAVEN_VERSION=3.9.11"
set "WRAPPER_DIR=%~dp0.mvn\wrapper"
set "MAVEN_HOME=%WRAPPER_DIR%\apache-maven-%MAVEN_VERSION%"
if exist "%MAVEN_HOME%\bin\mvn.cmd" goto run_maven
if not exist "%WRAPPER_DIR%" mkdir "%WRAPPER_DIR%"
echo Maven %MAVEN_VERSION% is not cached. Downloading it now...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference = 'Stop'; $url = 'https://archive.apache.org/dist/maven/maven-3/3.9.11/binaries/apache-maven-3.9.11-bin.zip'; $dest = Join-Path '%WRAPPER_DIR%' 'apache-maven-3.9.11-bin.zip'; Invoke-WebRequest -Uri $url -OutFile $dest; Expand-Archive -LiteralPath $dest -DestinationPath '%WRAPPER_DIR%' -Force; Remove-Item -LiteralPath $dest"
if errorlevel 1 (
  echo ERROR: Could not download Maven. Check your internet connection and try again.
  exit /b 1
)
:run_maven
call "%MAVEN_HOME%\bin\mvn.cmd" %*
exit /b %ERRORLEVEL%
