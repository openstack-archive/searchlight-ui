=======================================
Verifying JavaScript Features using npm
=======================================

The Node.js package manager `npm` can be used to verify JavaScript features in
a development environment. The commands to do this include ``npm run lint``
and ``npm run test``.

1. Install appropriate development packages for tox to run.  In Ubuntu this
   may include, for example, 'python-dev'. You can refer to the
   `Horizon documentations <https://docs.openstack.org/horizon/latest/>`_ for
   more details.

2. Run ``npm install`` to install the npm packages.

If those are successful, you should now be able to run ``npm run lint`` and
``npm run test``.

When running the tests, if it appears to be using a non-current version of
Horizon, you may want to clear your pip cache (``rm -rf <pip cache dir>/*``)
and clear .tox/venv (``rm -rf .tox/*``). The pip cache is found at:

Linux and Unix: ``~/.cache/pip``  # respects the XDG_CACHE_HOME directory.
OS X: ``~/Library/Caches/pip``
Windows: ``<CSIDL_LOCAL_APPDATA>\pip\Cache``
