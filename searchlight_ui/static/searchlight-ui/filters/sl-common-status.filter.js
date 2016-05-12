/**
 * (c) Copyright 2015 Hewlett-Packard Development Company, L.P.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function () {
  'use strict';

  angular
    .module('searchlight-ui.filters')
    .filter('slCommonStatus', slCommonStatusFilter);

  slCommonStatusFilter.$inject = [
    '$filter',
    'horizon.framework.util.i18n.gettext'
  ];

  /**
   * @ngdoc filter
   * @name slCommonStatusFilter
   * @description
   * Takes raw status from the API and returns the user friendly status if found.
   *
   * @param {function} $filter angular filter
   *
   * @param {function} gettext internationalization
   *
   * @returns {String} User friendly status if found.
   */
  function slCommonStatusFilter($filter, gettext) {
    var commonStatuses = {
      'active': gettext('Active'),
      'available': gettext('Available'),
      'down': gettext('Down'),
      'saving': gettext('Saving'),
      'queued': gettext('Queued'),
      'pending_delete': gettext('Pending Delete'),
      'pending': gettext('Pending'),
      'killed': gettext('Killed'),
      'deleted': gettext('Deleted'),
      'shutoff': gettext('Shutoff'),
      'suspended': gettext('Suspended'),
      'paused': gettext('Paused'),
      'error': gettext('Error'),
      'rescue': gettext('Rescue'),
      'shelved': gettext('Shelved'),
      'shelved_offloaded': gettext('Shelved Offloaded'),
      'unavailable': gettext('Unavailable')
    };

    return function findStatus(input) {
      if (angular.isDefined(input)) {
        input = $filter('lowercase')(input);
      }
      var result = commonStatuses[input];
      return angular.isDefined(result) ? result : input;
    };
  }

}());
