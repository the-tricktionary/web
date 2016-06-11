#! /usr/bin/env bash
NOW=`date +"%Y%M%d-%H%M%S"`
echo "Backing up firebase database $NOW"
firebase database:get "/" > "backups/backup-$NOW.bak.json" || ERR=true
if [ "$ERR" == "true" ]
then
    echo "Backup Failed"
    exit 1
else
    echo "Backup succeed"
    exit 0
fi