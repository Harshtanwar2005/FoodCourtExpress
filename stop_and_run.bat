@echo off
echo Purane servers ko band kar rahe hain...
taskkill /f /im java.exe 2>nul
FOR /F "tokens=5" %%T IN ('netstat -aon ^| findstr :7000') DO taskkill /F /PID %%T 2>nul

echo Server compile aur start ho raha hai...
javac -cp ".;sqlite.jar" *.java
java -cp ".;sqlite.jar" Server
pause