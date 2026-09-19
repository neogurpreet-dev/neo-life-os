@echo off
title Life OS Alarm Daemon
echo.
echo  =============================================
echo   Life OS — Alarm Daemon
echo  =============================================
echo   Watching for reminders set via Claude...
echo   Keep this window open (or minimise it).
echo   Press Ctrl-C to stop.
echo  =============================================
echo.
python "%~dp0alarm_daemon.py"
pause
