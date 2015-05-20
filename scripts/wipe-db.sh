#!/bin/bash
#mongo sos --eval "db.dropDatabase()"
mongo sos --eval "db.users.drop()"
mongo sos --eval "db.videos.drop()"