/**
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
    .module('searchlight-ui.util')
    .factory('searchlight-ui.util.redirect-action.service', factory);

  factory.$inject = [
    '$location',
    '$q'
  ];

  function factory(
    $location,
    $q
  ) {

    return function(generator) {
      return {
        perform: perform,
        allowed: allowed
      };

      function perform(item) {
        $location.url(generator(item));
      }

      function allowed() {
        return $q.resolve({});
      }
    };
  }
})();
