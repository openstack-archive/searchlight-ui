===========================
Setup Local Dev Environment
===========================

Assumptions:

 * horizon is installed or cloned into <basedir>/horizon/
 * searchlight-ui is installed or cloned into <basedir>/searchlight-ui/
 * current working directory is <basedir>/horizon/

1. Install environment.::

    #Locally cloned Horizon environment
    # - environment that has migrated horizon to using tox (Ocata release)
    .tox/runserver/bin/pip install -e ../searchlight-ui

    # -environment that has not migrated to tox (pre-Ocata release)
    ./tools/with_venv.sh pip install -e ../searchlight-ui

    #Devstack environment
    pip install -e ../searchlight-ui

2. Copy <searchlight-ui>/``searchlight_ui/enabled/_1001_project_search_panel.py``
   to <horizon_dir>/``openstack_dashboard/local/enabled/``::

    cp -rv ../searchlight-ui/searchlight_ui/enabled/_1001_project_search_panel.py openstack_dashboard/local/enabled/

3. Set up the policy files. First copy the policy file
   <searchlight-ui>/``searchlight_ui/conf/searchlight_policy.json`` into
   horizon's policy files <horizon_dir>/``openstack_dashboard/conf/`` folder.
   Then copy
   <searchlight-ui>/``local_settings.d/_1001_search_settings.py``
   to <horizon_dir>/``local/local_settings.d/``::

    cp ../searchlight-ui/searchlight_ui/conf/searchlight_policy.json openstack_dashboard/conf/

    cp ../searchlight-ui/searchlight_ui/local_settings.d/_1001_search_settings.py openstack_dashboard/local/local_settings.d/

4. (If offline compression is enabled - typical in production and devstack).
   Django has a compressor feature that performs many enhancements for the
   delivery of static files. It can be enable or disabled
   (``COMPRESS_ENABLED``). In addition, offline compression may be enabled or
   disabled (``COMPRESS_OFFLINE = True``). If offline compression is enabled
   in your environment, you must run the following commands the first time
   you install searchlight-ui and anytime you make changes to it.::

    ./manage.py collectstatic
    ./manage.py compress

5. Restart your horizon services.::

    #Locally cloned Horizon environment (not under apache)
    # - environment that has migrated horizon to using tox (Ocata release)
    tox -e runserver 0.0.0.0:8005 (desired IP and port are optional)

    # -environment that has not migrated to tox (pre-Ocata release)
    ./run_tests.sh --runserver 0.0.0.0:8005 (optionally set desired IP and port)

    #Devstack
    sudo service apache2 restart
