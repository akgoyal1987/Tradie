#!/bin/bash
#mongo glance --eval "db.dropDatabase()"
mongo glance --eval "db.users.drop()"
mongo glance --eval "db.videos.drop()"