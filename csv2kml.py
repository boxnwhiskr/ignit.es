#!/usr/bin/env python
import csv

import sys


def main():
    rows = iter(sys.stdin.readline, '')
    # skip header
    next(rows)

    print('<?xml version="1.0" encoding="UTF-8"?>')
    print('<kml xmlns="http://www.opengis.net/kml/2.2">')
    for (lon, lat, _, _, _, events) in csv.reader(rows):
        print('<Placemark>')
        print('<name>%s</name>' % events)
        print('<Point><coordinates>%s,%s,0</coordinates></Point>' % (lon, lat))
        print('</Placemark>')
    print('</kml>')


if __name__ == '__main__':
    main()
