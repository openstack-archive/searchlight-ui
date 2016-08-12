/*
 * (c) Copyright 2016 Hewlett Packard Enterprise Development LP
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function() {
  "use strict";

  angular
    .module('resources.os-nova-servers.details')
    .controller('ServerOverviewController', controller);

  controller.$inject = [
    'resources.os-nova-servers.resourceType',
    'horizon.app.core.openstack-service-api.nova',
    'horizon.framework.conf.resource-type-registry.service',
    'resources.os-nova-servers.instance-status.service',
    '$scope'
  ];

  function controller(
    resourceTypeCode,
    nova,
    registry,
    statusService,
    $scope
  ) {
    var ctrl = this;

    ctrl.server = {};
    ctrl.resourceType = registry.getResourceType(resourceTypeCode);
    ctrl.getAddresses = statusService.getAddresses;
    ctrl.ruleToString = ruleToString;
    ctrl.policy = { rules: [["compute", "context_is_admin"]] };

    function ruleToString(rule) {
      var ports = '';
      if (rule.port_range_min && rule.protocol) {
        if (rule.port_range_min === rule.port_range_max) {
          ports = rule.port_range_min + '/' + rule.protocol.toLowerCase();
        } else {
          ports = rule.port_range_min + '-' + rule.port_range_max + '/' +
            rule.protocol.toLowerCase();
        }
      } else if (rule.protocol) {
        ports = rule.ip_protocol;
      }
      return interpolate(gettext("ALLOW %(type)s %(ports)s %(direction)s %(target)s"), {
        type: rule.ethertype,
        ports: ports,
        direction: rule.direction === 'egress' ? gettext('to') : gettext('from'),
        // TODO: should handle 'name' too?
        target: rule.remote_ip_prefix === null ? gettext('ANY') : rule.remote_ip_prefix
      }, true);
    }

    $scope.context.loadPromise.then(onGetResponse);

    function onGetResponse(response) {
      ctrl.server = response.data;
      if (ctrl.server.flavor && ctrl.server.flavor.id) {
        nova.getFlavor(ctrl.server.flavor.id).then(onGetFlavor);
      }
      nova.getServerVolumes(ctrl.server.id).then(onGetVolumes);
      nova.getServerSecurityGroups(ctrl.server.id).then(onGetSecurityGroups);
    }

    function onGetFlavor(response) {
      ctrl.flavor = response.data;
    }

    function onGetVolumes(response) {
      ctrl.volumes = response.data.items;
    }

    function onGetSecurityGroups(response) {
      ctrl.securityGroups = response.data.items;
    }
  }

})();
