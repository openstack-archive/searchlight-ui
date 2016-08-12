/**
 * (c) Copyright 2016 Hewlett Packard Enterprise Development Company LP
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use self file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

(function() {
  'use strict';

  angular
    .module('resources.os-nova-servers')
    .factory('resources.os-nova-servers.instance-status.service', factory);

  /**
   * @ngDoc factory
   * @name horizon.app.core.instances.instance-status.service
   *
   * @Description
   * Provides useful status-evaluation features.
   */
  function factory(
  ) {
    var powerStates = {
      0: "NO STATE",
      1: "RUNNING",
      2: "BLOCKED",
      3: "PAUSED",
      4: "SHUTDOWN",
      5: "SHUTOFF",
      6: "CRASHED",
      7: "SUSPENDED",
      8: "FAILED",
      9: "BUILDING"
    };

    var statuses = {
      'DELETED': gettext('Deleted'),
      'ACTIVE': gettext('Active'),
      'SHUTOFF': gettext('Shutoff'),
      'SUSPENDED': gettext('Suspended'),
      'PAUSED': gettext('Paused'),
      'ERROR': gettext('Error'),
      'RESIZE': gettext('Resize/Migrate'),
      'VERIFY_RESIZE': gettext('Confirm or Revert Resize/Migrate'),
      'REVERT_RESIZE': gettext('Revert Resize/Migrate'),
      'REBOOT': gettext('Reboot'),
      'HARD_REBOOT': gettext('Hard Reboot'),
      'PASSWORD': gettext('Password'),
      'REBUILD': gettext('Rebuild'),
      'MIGRATING': gettext('Migrating'),
      'BUILD': gettext('Build'),
      'RESCUE':  gettext('Rescue'),
      'SOFT-DELETE':  gettext('Soft Deleted'),
      'SHELVED':  gettext('Rescue'),
      'SHELVED_OFFLOADED':  gettext('Shelved Offloaded'),
      'BUILDING':  gettext('Building'),
      'STOPPED':  gettext('Stopped'),
      'RESCUED':  gettext('Rescued'),
      'RESIZED':  gettext('Resized')
    };

    return {
      isDeleting: isDeleting,
      anyStatus: anyStatus,
      anyPowerState: anyPowerState,
      getAddresses: getAddresses,
      statuses: statuses,
      powerStates: powerStates
    };

    function getAddresses(list) {
      return list.map(getAddr).join(', ');

      function getAddr(item) {
        return item.addr;
      }
    }

    function anyStatus(instance, validStatuses) {
      return valueInList(instance.status, validStatuses);
    }

    function anyPowerState(instance, validStatuses) {
      return valueInList(powerStates[instance['OS-EXT-STS:power_state']], validStatuses);
    }

    function isDeleting(instance) {
      return upperCase(instance['OS-EXT-STS:task_state']) === 'DELETING';
    }

    function valueInList(value, list) {
      return list.indexOf(upperCase(value)) > -1;
    }

    function upperCase(val) {
      return String(val).toUpperCase();
    }
  }
})();
