@echo off
schtasks /create /tn "LifeOS_TestReminder_20260916_1155" /tr "powershell -WindowStyle Hidden -ExecutionPolicy Bypass -File \"C:\Users\proje\AppData\Local\LifeOS\alarms\LifeOS_TestReminder_20260916_1155.ps1\"" /sc once /sd 09/16/2026 /st 11:55 /f /rl HIGHEST
if %errorlevel%==0 (
    echo Alarm set for 2026-09-16 11:55
) else (
    echo Failed to set alarm
)
exit
