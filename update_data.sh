#!/usr/bin/env bash

# Fetch clickstream data from google sheets
TODAY="https://docs.google.com/spreadsheets/u/1/d/1Z4zDkFS0S6KSjAybBM2e7vFI8muhyJTSkQpfJvmqxXs/export?format=csv&id=1Z4zDkFS0S6KSjAybBM2e7vFI8muhyJTSkQpfJvmqxXs&gid=0"
SEVENDAYS="https://docs.google.com/spreadsheets/u/1/d/1Z4zDkFS0S6KSjAybBM2e7vFI8muhyJTSkQpfJvmqxXs/export?format=csv&id=1Z4zDkFS0S6KSjAybBM2e7vFI8muhyJTSkQpfJvmqxXs&gid=1232289472"
SCRIPTDIR=`dirname ${BASH_SOURCE}`
wget "${TODAY}" -q -O- | ${SCRIPTDIR}/csv2kml.py > ${SCRIPTDIR}/www/data/today.kml
wget "${SEVENDAYS}" -q -O- | ${SCRIPTDIR}/csv2kml.py > ${SCRIPTDIR}/www/data/sevendays.kml

# Estimate recent candle count
cp ${SCRIPTDIR}/www/data/cur_count.json ${SCRIPTDIR}/www/data/old_count.json
tail -n 10000 /var/log/nginx/access.log | grep "GET /ignited" | ${SCRIPTDIR}/estimate.py > ${SCRIPTDIR}/www/data/cur_count.json
