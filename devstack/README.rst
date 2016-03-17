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

Once you enable the plugin in your local.conf, ensure ``horizon``,
``searchlight-api``, and ``searchlight-listener`` services are enabled. If they
are enabled, searchlight-ui will be enabled automatically.
