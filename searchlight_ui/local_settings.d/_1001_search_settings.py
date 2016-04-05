# See http://docs.openstack.org/developer/horizon/topics/settings.html#openstack-settings-partial  # noqa

# This adds search policy to
# http://docs.openstack.org/developer/horizon/topics/settings.html#policy-files
# We disable this rule to avoid the F821 undefined name 'POLICY_FILES' error
POLICY_FILES['search'] = 'searchlight_policy.json'  # noqa
