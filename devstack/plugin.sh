#!/usr/bin/env bash
# Install searchlight-ui

# To enable searchlight-ui
# enable_plugin searchlight-ui http://git.openstack.org/openstack/searchlight-ui

# stack.sh
# ---------
# install_searchlight_ui
# configure_searchlight_ui
# init_searchlight_ui
# start_searchlight_ui
# stop_searchlight_ui
# cleanup_searchlight_ui

# Save trace setting
XTRACE=$(set +o | grep xtrace)
set +o xtrace


# Defaults
# --------
# Set up default repos


# Tell Tempest this project is present
TEMPEST_SERVICES+=,searchlight-ui


function install_searchlight_ui {
    # NOTE(From magnum_ui): workaround for devstack bug: 1540328
    # where devstack install 'test-requirements' but should not do it
    # for the project as it installs Horizon from url.
    # Remove following two 'mv' commands when mentioned bug is fixed.
    mv ${SEARCHLIGHT_UI_DIR}/test-requirements.txt ${SEARCHLIGHT_UI_DIR}/_test-requirements.txt

    setup_develop ${SEARCHLIGHT_UI_DIR}

    mv ${SEARCHLIGHT_UI_DIR}/_test-requirements.txt ${SEARCHLIGHT_UI_DIR}/test-requirements.txt
}

function configure_searchlight_ui {
    cp ${SEARCHLIGHT_UI_DIR_ENABLE_FILE} ${HORIZON_ENABLE_DIR}/
    cp ${SEARCHLIGHT_UI_DIR_POLICY_FILE} ${HORIZON_POLICY_DIR}/
    cp ${SEARCHLIGHT_UI_DIR_LOCAL_SETTINGS_FILE} ${HORIZON_LOCAL_SETTINGS_D_DIR}/
    # NOTE: If locale directory does not exist, compilemessages will fail,
    # so check for an existence of locale directory is required.
    if [ -d ${SEARCHLIGHT_UI_DIR}/searchlight_ui/locale ]; then
        (cd ${SEARCHLIGHT_UI_DIR}/searchlight_ui; DJANGO_SETTINGS_MODULE=openstack_dashboard.settings ../manage.py compilemessages)
    fi
}

# check for service enabled
if is_service_enabled searchlight-ui; then

    if [[ "$1" == "stack" && "$2" == "pre-install"  ]]; then
        # Set up system services
        # no-op
        :

    elif [[ "$1" == "stack" && "$2" == "install"  ]]; then
        # Perform installation of service source
        echo_summary "Installing Searchlight UI"
        install_searchlight_ui

    elif [[ "$1" == "stack" && "$2" == "post-config"  ]]; then
        # Configure after the other layer 1 and 2 services have been configured
        echo_summary "Configuring Searchlight UI"
        configure_searchlight_ui

    elif [[ "$1" == "stack" && "$2" == "extra"  ]]; then
        # no-op
        :
    fi

    if [[ "$1" == "unstack"  ]]; then
        # no-op
        :
    fi

    if [[ "$1" == "clean"  ]]; then
        # Remove state and transient data
        # Remember clean.sh first calls unstack.sh
        echo_summary "Cleaning Searchlight UI"
        # Remove searhclight-ui enabled file and pyc
        rm -f ${HORIZON_ENABLE_DIR}/${SEARCHLIGHT_UI_ENABLE_FILENAME}*
        # Remove searchlight-ui policy file
        rm -f ${HORIZON_POLICY_DIR}/${SEARCHLIGHT_UI_POLICY_FILENAME}
        # Remove the local_settings.d/ file and pyc
        rm -f ${HORIZON_LOCAL_SETTINGS_D_DIR}/ ${SEARCHLIGHT_UI_LOCAL_SETTINGS_D_FILENAME}*
    fi
fi

# Restore xtrace
$XTRACE
