# (c) Copyright 2016 Hewlett-Packard Development Company, L.P.
#
# Licensed under the Apache License, Version 2.0 (the "License"); you may
# not use this file except in compliance with the License. You may obtain
# a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
# WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
# License for the specific language governing permissions and limitations
# under the License.

# The slug of the dashboard the PANEL associated with. Required.
PANEL_DASHBOARD = 'search'

# The slug of the panel group the PANEL is associated with.
# If you want the panel to show up without a panel group,
# use the panel group "default".
PANEL_GROUP = 'default'

# If set, it will update the default panel of the PANEL_DASHBOARD.
DEFAULT_PANEL = 'search'

# The slug of the panel to be added to HORIZON_CONFIG. Required.
PANEL = 'search'

# If set to True, this settings file will not be added to the settings.
DISABLED = False

ADD_INSTALLED_APPS = ['searchlight_ui']

# Python panel class of the PANEL to be added.
ADD_PANEL = 'searchlight_ui.dashboards.search.search.panel.Search'

ADD_ANGULAR_MODULES = ['horizon.dashboard.project.search']

ADD_SCSS_FILES = ['dashboard/search/search/search.scss']

AUTO_DISCOVER_STATIC_FILES = True
