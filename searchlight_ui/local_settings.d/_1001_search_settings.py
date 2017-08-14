# See https://docs.openstack.org/horizon/latest/configuration/settings.html # noqa

# This adds search policy to
# https://docs.openstack.org/horizon/latest/configuration/settings.html#policy-files
# We disable this rule to avoid the F821 undefined name 'POLICY_FILES' error
POLICY_FILES['search'] = 'searchlight_policy.json'  # noqa
