========================================
Searchlight UI dashboard devstack plugin
========================================

This directory contains the searchlight-ui devstack plugin.

To enable the plugin, add the following to your local.conf:

    enable_plugin searchlight-ui <searchlight-ui GITURL> [GITREF]

where

    <searchlight-ui GITURL> is the URL of a searchlight-ui repository
    [GITREF] is an optional git ref (branch/ref/tag). The default is master.

For example:

    enable_plugin searchlight-ui https://git.openstack.org/openstack/searchlight-ui

This plugin also depends on the following services to be enabled: ``horizon``,
``searchlight-api``, and ``searchlight-listener``.

* https://github.com/openstack/searchlight/tree/master/devstack
