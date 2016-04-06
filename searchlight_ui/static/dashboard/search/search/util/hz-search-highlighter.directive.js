/*
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
    .module('horizon.dashboard.project.search')
    .directive('hzSearchHighlighter', hzSearchHighlighter);

  hzSearchHighlighter.$inject = [
    'horizon.dashboard.project.search.basePath'
  ];

  /**
   * @ngdoc directive
   * @name hzSearchHighlighter
   * @description
   * Takes a searchlight "hit" (search result) and if the requested "field" is highlighted
   * in the results, outputs the highlighted result. Otherwise, outputs the "default-falue".
   *
   * @param {function} basePath the base url path
   *
   * @returns {function} This directive.
   *
   * @example
   *
   * <hz-search-highlighter hit="hit"
   *                        field="'name'"
   *                        default-value="hit._source.name || hit._source._id | noValue">
   * </hz-search-highlighter>
   */
  function hzSearchHighlighter(basePath) {
    var directive = {
      restrict: 'E',
      replace: true,
      scope: {
        hit: '=hit',
        field: '=field',
        defaultValue: '=defaultValue'
      },
      templateUrl: basePath + 'util/hz-search-highlighter.html'
    };

    return directive;
  }

})();

