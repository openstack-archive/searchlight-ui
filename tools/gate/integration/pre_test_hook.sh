#!/bin/bash

# This script will be executed inside pre_test_hook function in devstack gate

set -ex

DIR=${BASH_SOURCE%/*}
source $DIR/commons $@

# Enable Searchlight UI plugin
DEVSTACK_LOCAL_CONFIG+=$'\n'"enable_plugin enable_plugin searchlight http://git.openstack.org/openstack/searchlight"
DEVSTACK_LOCAL_CONFIG+=$'\n'"enable_service searchlight-api"
DEVSTACK_LOCAL_CONFIG+=$'\n'"enable_service searchlight-listener"
DEVSTACK_LOCAL_CONFIG+=$'\n'"enable_plugin searchlight-ui https://git.openstack.org/openstack/searchlight-ui"
