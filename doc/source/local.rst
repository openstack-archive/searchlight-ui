================================
Create and Install Local Package
================================

Change working directory to <basedir>/searchlight-ui/

1. Package the searchlight_ui by running::

    python setup.py sdist

2. This will create a python egg in the dist folder, which can be used to
   install on the horizon machine or within horizon's python virtual
   environment (prepend with ``./tools/with_venv.sh``)::

    pip install dist/searchlight-ui-0.0.0.tar.gz (use appropriate version)
