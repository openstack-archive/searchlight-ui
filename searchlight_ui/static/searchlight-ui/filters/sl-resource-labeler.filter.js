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
    .filter('slResourceLabeler', slResourceLabelerFilter);

  slResourceLabelerFilter.$inject = [
    'titleFilter',
    'noUnderscoreFilter',
    'horizon.framework.conf.resource-type-registry.service',
    'horizon.framework.util.i18n.gettext'
  ];

  /**
   * @ngdoc filter
   * @name resourceTypeLabelerFilter
   * @description
   * Takes raw status from the API and returns the user friendly status if found.
   *
   * @param {function} titleFilter Horizon title filter
   *
   * @param {function} noUnderscoreFilter Horizon noUnderscoreFilter
   *
   * @param {function} registry resource type registry
   *
   * @param {function} gettext internationalization
   *
   * @returns {String} User friendly status if found.
   */
  function slResourceLabelerFilter(titleFilter, noUnderscoreFilter, registry, gettext) {

    return function label(resourceType, input, propertyName) {
      var resourceTypeRegistration = registry.getResourceType(resourceType);

      var output = input;

      if (angular.isDefined(resourceTypeRegistration)) {
        if (angular.isUndefined(input)) {
          output = resourceTypeRegistration.getName(1) || resourceType;
        } else if (angular.isUndefined(propertyName)) {
          output = resourceTypeRegistration.label(input);
        } else {
          output = resourceTypeRegistration.format(propertyName, input);
        }
      }

      if (output === input) {
        output = input;
        // There was no registered label. Let's Try to make it look human.

        // Extensions
        var osExtRegEx = new RegExp('OS-EXT-.*:', 'i');
        output = angular.isString(output)
          ? output.replace(osExtRegEx, gettext('(Extension)') + ' ')
          : output;

        output = titleFilter(noUnderscoreFilter(output));

        var idRegEx = new RegExp('id', 'ig');
        output = angular.isString(output)
          ? output.replace(idRegEx, 'ID') : output;

        // Swift  - could go away with default value function registration
        var xObjectRegEx = new RegExp('x-object-');
        output = angular.isString(output)
          ? output.replace(xObjectRegEx, '(Custom)') : output;
      }

      return output;
    };
  }
})();
