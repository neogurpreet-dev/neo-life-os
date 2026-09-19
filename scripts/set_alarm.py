#!/usr/bin/env python3
"""
Life OS — Reminder Setter  (Claude-side, runs via device_bash)
Writes a new alarm into alarms/queue.json.
The alarm_daemon.py running on Windows will fire the toast notification at the right time.
Google Calendar event is created separately by Claude via the Calendar MCP.

Usage:
  python set_alarm.py --title "Call Mom" --datetime "2026-09-16 20:00"
  python set_alarm.py --title "Submit assignment" --datetime "2026-09-17 23:45" --message "Upload to Moodle!"
"""

import json
import os
import argparse
from datetime import datetime

BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
QUEUE_FILE = os.path.join(BASE_DIR, "alarms", "queue.json")


def queue_alarm(title, alarm_dt, message=None):
    os.makedirs(os.path.dirname(QUEUE_FILE), exist_ok=True)

    # Load existing queue
    if os.path.exists(QUEUE_FILE):
        try:
            with open(QUEUE_FILE, "r", encoding="utf-8") as f:
                queue = json.load(f)
        except Exception:
            queue = []
    else:
        queue = []

    entry = {
        "title":    title,
        "datetime": alarm_dt.isoformat(),
        "message":  message or title,
        "queued_at": datetime.now().isoformat()
    }
    queue.append(entry)
    queue.sort(key=lambda x: x["datetime"])

    with open(QUEUE_FILE, "w", encoding="utf-8") as f:
        json.dump(queue, f, indent=2, ensure_ascii=False)

    return entry


def main():
    parser = argparse.ArgumentParser(description="Life OS — queue a Windows alarm")
    parser.add_argument("--title",    required=True)
    parser.add_argument("--datetime", required=True,
                        help="YYYY-MM-DD HH:MM  e.g. '2026-09-16 20:00'")
    parser.add_argument("--message",  default=None)
    args = parser.parse_args()

    try:
        alarm_dt = datetime.strptime(args.datetime, "%Y-%m-%d %H:%M")
    except ValueError:
        print("ERROR: --datetime must be YYYY-MM-DD HH:MM")
        raise SystemExit(1)

    entry = queue_alarm(args.title, alarm_dt, args.message)
    print(f"OK alarm queued")
    print(f"   Title : {entry['title']}")
    print(f"   When  : {alarm_dt.strftime('%A, %d %b %Y at %I:%M %p')}")
    print(f"   Queue : {QUEUE_FILE}")
    print(f"   Daemon must be running on Windows (start_life_os.bat)")


if __name__ == "__main__":
    main()
