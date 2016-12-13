#!/usr/bin/env python

import json
import sys
from datetime import datetime, timedelta


def main():
    now = datetime.now()
    hour_ago = now - timedelta(hours=1)
    min_ago = now - timedelta(minutes=1)

    hour_ts = [
        ts for ts
        in (parse_timestamp(log) for log in iter(sys.stdin.readline, ''))
        if ts > hour_ago
        ]
    min_ts = [
        ts for ts in hour_ts
        if ts > min_ago
        ]

    if len(hour_ts) == 0:
        count_for_hour = 0
    else:
        count_for_hour = float(len(hour_ts)) / (
            hour_ts[0] - now).seconds * 60 * 60

    if len(min_ts) == 0:
        count_for_min = 0
    else:
        count_for_min = float(len(min_ts)) / (min_ts[0] - now).seconds * 60

    print(json.dumps({
        'hour': count_for_hour,
        'min': count_for_min,
    }))


def parse_timestamp(log):
    ts = log.split(' ')[3][1:]
    return datetime.strptime(ts, '%d/%b/%Y:%H:%M:%S')


if __name__ == '__main__':
    main()

