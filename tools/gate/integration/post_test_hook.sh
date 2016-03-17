#!/bin/bash

# This script will be executed inside post_test_hook function in devstack gate

set -x

DIR=${BASH_SOURCE%/*}
source $DIR/commons $@

set +e
cd /opt/stack/new/searchlight-ui
sudo -H -u stack tox -e py27integration
retval=$?
set -e

if [ -d ${SEARCHLIGHT_UI_SCREENSHOTS_DIR}/ ]; then
  cp -r ${SEARCHLIGHT_UI_SCREENSHOTS_DIR}/
  /home/jenkins/workspace/gate-searchlight-ui-dsvm-integration/
fi
exit $retval
