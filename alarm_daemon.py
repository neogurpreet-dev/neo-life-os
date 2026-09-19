#!/usr/bin/env python3
"""
Life OS — Alarm Daemon
Run once on startup: python alarm_daemon.py
Watches alarms/queue.json and fires Windows toast notifications at the right time.
Claude (Life OS) writes new reminders into that queue automatically.
"""

import time
import json
import os
import subprocess
from datetime import datetime

BASE_DIR  = os.path.dirname(os.path.abspath(__file__))
QUEUE_FILE = os.path.join(BASE_DIR, "alarms", "queue.json")


def _toast_ps(title, message):
    t = title.replace("'", "`'").replace('"', '`"')
    m = message.replace("'", "`'").replace('"', '`"')
    return f"""
$ErrorActionPreference = 'SilentlyContinue'
try {{
    [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
    [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null
    $t = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText02)
    $x = [xml] $t.GetXml()
    $x.toast.visual.binding.text[0].InnerText = '[!] {t}'
    $x.toast.visual.binding.text[1].InnerText = '{m}'
    $d = New-Object Windows.Data.Xml.Dom.XmlDocument
    $d.LoadXml($x.OuterXml)
    $n = [Windows.UI.Notifications.ToastNotification]::new($d)
    [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('Life OS').Show($n)
    Start-Sleep -Seconds 20
}} catch {{
    Add-Type -AssemblyName System.Windows.Forms
    [System.Windows.Forms.MessageBox]::Show('{m}', '[!] Life OS: {t}', 0, 48)
}}
"""


def fire_toast(title, message):
    try:
        subprocess.run(
            ["powershell", "-WindowStyle", "Hidden",
             "-ExecutionPolicy", "Bypass", "-Command", _toast_ps(title, message)],
            timeout=30
        )
    except Exception as e:
        print(f"[daemon] toast error: {e}")


def load_queue():
    if not os.path.exists(QUEUE_FILE):
        return []
    try:
        with open(QUEUE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []


def save_queue(items):
    os.makedirs(os.path.dirname(QUEUE_FILE), exist_ok=True)
    with open(QUEUE_FILE, "w", encoding="utf-8") as f:
        json.dump(items, f, indent=2, ensure_ascii=False)


def run():
    os.makedirs(os.path.join(BASE_DIR, "alarms"), exist_ok=True)
    print(f"[Life OS Alarm Daemon] started — watching {QUEUE_FILE}")
    print("[Life OS Alarm Daemon] Ctrl-C to stop.\n")

    while True:
        try:
            queue = load_queue()
            now = datetime.now()
            remaining = []
            fired = 0

            for alarm in queue:
                try:
                    alarm_dt = datetime.fromisoformat(alarm["datetime"])
                except Exception:
                    continue  # skip malformed entries

                if alarm_dt <= now:
                    title   = alarm.get("title", "Reminder")
                    message = alarm.get("message", title)
                    print(f"[daemon] FIRING: {title} (was {alarm_dt})")
                    fire_toast(title, message)
                    fired += 1
                else:
                    remaining.append(alarm)

            if fired:
                save_queue(remaining)

        except Exception as e:
            print(f"[daemon] error: {e}")

        time.sleep(30)   # check every 30 seconds


if __name__ == "__main__":
    run()
