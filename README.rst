==============
searchlight-ui
==============

Horizon panels and libraries for searchlight

* Free software: Apache license
* Documentation: http://docs.openstack.org/developer/searchlight
* Source: http://git.openstack.org/cgit/openstack/searchlight-ui
* Bugs: http://bugs.launchpad.net/searchlight

The Searchlight project provides indexing and search capabilities across
OpenStack resources. Its goal is to achieve high performance and flexible
querying combined with near real-time indexing.

Use the following resources to learn more:

* `Official Searchlight documentation * <http://docs.openstack.org/developer/searchlight/>`_

Features
--------

* Please see the searchlight-ui repository

Setup Local Dev Environment
---------------------------

Assumptions:

 * horizon is installed or cloned into <basedir>/horizon/
 * searchlight-ui is installed or cloned into <basedir>/searchlight-ui/
 * current working directory is <basedir>/horizon/

1. Install environment.::

    ./tools/with_venv.sh pip install -e ../searchlight-ui

2. Copy <searchlight-ui>/``searchlight_ui/enabled/_1001_project_search_panel.py``
   to <horizon_dir>/``openstack_dashboard/local/enabled/``::

    cp -rv ../searchlight-ui/searchlight_ui/enabled/_1001_project_search_panel.py openstack_dashboard/local/enabled/

3. (Optional) Copy the policy file
   <searchlight-ui>/``searchlight_ui/conf/searchlight_policy.json`` into
   horizon's policy files <horizon_dir>/``openstack_dashboard/conf/`` folder,
   and add the following config to the ``POLICY_FILES`` setting in
   ``openstack_dashboard/local/local_settings.py``::

    'search': 'searchlight_policy.json',

4. (Optional - usually only in production). Django has a compressor feature
   that performs many enhancements for the  delivery of static files. It can
   be enable or disabled (``COMPRESS_ENABLED``). In addition, offline
   compression may be enabled or disabled (``COMPRESS_OFFLINE = True``). If
   offline compression is enabled in your environment , run the following
   commands.::

    ./manage.py collectstatic
    ./manage.py compress

5. Restart your horizon services.::

    (under apache)      sudo service apache2 restart
    (not under apache) ./run_tests.sh --runserver 0.0.0.0:8005 (use appropriate IP and port)

Create and Install Local Package
--------------------------------

1. Package the searchlight_ui by running::

    python setup.py sdist

2. This will create a python egg in the dist folder, which can be used to
   install on the horizon machine or within horizon's python virtual
   environment (prepend wih ``./tools/with_venv.sh``)::

    pip install dist/searchlight-ui-0.0.0.tar.gz (use appropriate version)
