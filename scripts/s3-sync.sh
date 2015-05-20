#!/bin/bash
aws s3 sync client/assets s3://getglance/assets --acl public-read
