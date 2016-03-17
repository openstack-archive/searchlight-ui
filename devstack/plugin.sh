function searchlight_ui_install {
    setup_develop $SEARCHLIGHT_UI_DIR
}

function searchlight_ui_dashboard_configure {
    cp $SEARCHLIGHT_UI_DIR_ENABLE_FILE \
        $HORIZON_DIR/openstack_dashboard/local/enabled/
}

if is_service_enabled horizon && is_service_enabled search; then
    if [[ "$1" == "stack" && "$2" == "install" ]]; then
        # Perform installation of service source
        echo_summary "Installing searchlight-ui"
        searchlight_ui_install
    elif [[ "$1" == "stack" && "$2" == "post-config" ]]; then
        echo_summary "Configuring searchlight-ui"
        searchlight_ui_dashboard_configure
    elif [[ "$1" == "stack" && "$2" == "extra" ]]; then
        # Initialize (nothing for now)
        echo_summary "Initializing searchlight-ui"
    fi
fi

if [[ "$1" == "unstack" ]]; then
    # Shut down searchlight-ui dashboard services
    :
fi

if [[ "$1" == "clean" ]]; then
    # Remove state and transient data
    # Remember clean.sh first calls unstack.sh

    # Remove searhclight-ui enabled file and pyc
    rm -f ${SEARCHLIGHT_UI_DIR_ENABLE_FILE}*
fi
