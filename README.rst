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

 * horizon is installed / cloned into <basedir>/horizon
 * searchlight-ui is installed / cloned into <basedir>/searchlight-ui
 * current working directory is <basedir>/horizon
 * horizon offline compression is not enabled (if so, alter step 4 to collectstatic and compress first.)

1. ``./tools/with_venv.sh pip install -e ../searchlight-ui``

2. ``cp -rv ../searchlight-ui/searchlight_ui/enabled/_1001_project_search_panel.py openstack_dashboard/local/enabled/``

3. (Optional) Copy the policy file into horizon's policy files folder, and
   add this config ``POLICY_FILES`` to
   ``openstack_dashboard/local/local_settings.py``::

    'searchlight_ui': 'searchlight_ui',

4. (not under apache) ``./run_tests.sh --runserver 0.0.0.0:8005`` (use appropriate IP and port)

5. (under apache) ``sudo service apache2 restart``


Create and Install Local Package to Apache
------------------------------------------

Assumptions:

 * horizon is installed and running under Apache (e.g. devstack)
 * searchlight-ui is cloned into <basedir>/searchlight-ui
 * current working directory is <basedir>/searchlight-ui


1. Package the searchlight_ui by running::

    python setup.py sdist

   This will create a python egg in the dist folder, which can be used to
   install on the horizon machine or within horizon's python virtual
   environment (prepend wih ``./tools/with_venv.sh``)::

    pip install dist/searchlight-ui-0.0.0.tar.gz

2. Copy ``searchlight_ui/enabled/_1001_project_search_panel.py``
   to <horizon_dir>/``openstack_dashboard/local/enabled/``

3. (Optional) Copy the policy file into horizon's policy files folder, and
   add this config ``POLICY_FILES`` to
   ``openstack_dashboard/local/local_settings.py``::

    'searchlight_ui': 'searchlight_ui',

4. Django has a compressor feature that performs many enhancements for the
   delivery of static files. If the compressor feature is enabled in your
   environment (`COMPRESS_OFFLINE = True`), run the following commands::

    ./manage.py collectstatic
    ./manage.py compress

5. Finally restart your web server to enable searchlight-ui
   in your Horizon::

    sudo service apache2 restart
