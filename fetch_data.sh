#!/usr/bin/env bash
TODAY="https://docs.google.com/spreadsheets/u/1/d/1Z4zDkFS0S6KSjAybBM2e7vFI8muhyJTSkQpfJvmqxXs/export?format=csv&id=1Z4zDkFS0S6KSjAybBM2e7vFI8muhyJTSkQpfJvmqxXs&gid=0"
SEVENDAYS="https://docs.google.com/spreadsheets/u/1/d/1Z4zDkFS0S6KSjAybBM2e7vFI8muhyJTSkQpfJvmqxXs/export?format=csv&id=1Z4zDkFS0S6KSjAybBM2e7vFI8muhyJTSkQpfJvmqxXs&gid=1232289472"
SCRIPTDIR=`dirname ${BASH_SOURCE}`
sudo wget "${TODAY}" -O${SCRIPTDIR}/www/today.csv -q
sudo wget "${SEVENDAYS}" -O${SCRIPTDIR}/www/sevendays.csv -q
