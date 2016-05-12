/**
 * (c) Copyright 2016 Hewlett-Packard Development Company, L.P.
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
    .filter('slQueryStatus', slQueryStatusFilter);

  slQueryStatusFilter.$inject = [
    'horizon.framework.util.i18n.gettext'
  ];

  /**
   * @ngdoc filter
   * @name slQueryStatusFilter
   * @description
   * Takes raw status from the API and returns the user friendly status if found.
   *
   * @param {function} gettext internationalization
   *
   * @returns {String} User friendly status if found.
   */
  function slQueryStatusFilter( gettext) {
    var statusCodes = {
      400: gettext('The current query is not valid. Please check your syntax.'),
      401: gettext('You must re-authenticate yourself.'),
      403: gettext('You are not allowed to perform this request.'),
      404: gettext('The requested resource was not found.'),
      500: gettext('The search service had an error processing your request.'),
      default: gettext('There was an error processing your request.')
    };

    return function findStatus(input) {
      var result = statusCodes[input];
      return angular.isDefined(result) ? result : statusCodes.default;
    };
  }

}());
