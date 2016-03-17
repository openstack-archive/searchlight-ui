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

Howto
-----

1. Package the searchlight_ui by running::

    python setup.py sdist

   This will create a python egg in the dist folder, which can be used to
   install on the horizon machine or within horizon's python virtual
   environment::

   cd ../horizon
   ./tools/with_venv.sh pip install ../searchlight-ui/dist/searchlight-ui-0.0.0.tar.gz

2. Copy ``_1001_project_search_panel.py`` in
   ``searchlight_ui/enabled`` directory
   to ``openstack_dashboard/local/enabled``

   Example (from searchlight-ui)::

   cp -rv searchlight_ui/enabled/_1001_project_search_panel.py ../horizon/openstack_dashboard/local/enabled/

3. (Optional) Copy the policy file into horizon's policy files folder, and
   add this config ``POLICY_FILES``::

    'searchlight_ui': 'searchlight_ui',

4. Django has a compressor feature that performs many enhancements for the
   delivery of static files. If the compressor feature is enabled in your
   environment (``COMPRESS_OFFLINE = True``), run the following commands::

    $ ./manage.py collectstatic
    $ ./manage.py compress

5. Finally restart your web server to enable searchlight-ui
   in your Horizon::

    $ sudo service apache2 restart
