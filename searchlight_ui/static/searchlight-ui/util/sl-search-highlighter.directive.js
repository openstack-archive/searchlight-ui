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
    .module('searchlight-ui.util')
    .directive('slSearchHighlighter', slSearchHighlighter);

  slSearchHighlighter.$inject = [
    'searchlight-ui.basePath'
  ];

  /**
   * @ngdoc directive
   * @name slSearchHighlighter
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
   * <sl-search-highlighter hit="hit"
   *                        field="'name'"
   *                        default-value="hit._source.name || hit._source._id | noValue">
   * </sl-search-highlighter>
   */
  function slSearchHighlighter(basePath) {
    var directive = {
      restrict: 'E',
      replace: true,
      scope: {
        hit: '=hit',
        field: '=field',
        defaultValue: '=defaultValue'
      },
      templateUrl: basePath + 'util/sl-search-highlighter.html'
    };

    return directive;
  }

})();

