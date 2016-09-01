/*
 * (c) Copyright 2016 Hewlett Packard Enterprise Development Company LP
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

  describe('searchlight-search-helper service functions', function () {
    var mockResults;

    // Include the modules that contains search-helper
    beforeEach(module('searchlight-ui.util'));

    // Mock other services required by searchlight-ui.util
    beforeEach(module(function ($provide) {
      // Mock other searchlight dependencies
      $provide.provider('horizon.app.core.openstack-service-api.searchlight', function () {
        this.$get = function () {
          return {
            postSearch: function () {
              return {
                success: function (callback) {
                  callback(mockResults);
                  return this;
                },
                error: angular.noop
              };
            }
          };
        };
      });
      $provide.provider('slCommonStatusFilter', function () {
        this.$get = function () {
          return {};
        };
      });
      $provide.provider('slResourceLabelerFilter', function () {
        this.$get = function () {
          return {};
        };
      });
      $provide.factory('searchlight-ui.settings.settingsService', function () {
        return {
          settings: {
            polling: {}
          }
        };
      });
      $provide.factory('searchlight-ui.util.searchlightQueryGenerator', function () {
        return {
          generate: function () {
            return {};
          }
        };
      });
      $provide.factory('$timeout', function () {
        return {};

      });
    }));

    describe('search', function () {
      var searchHelper;

      beforeEach(inject(function ($injector) {
        searchHelper = $injector.get('searchlight-ui.util.searchlightSearchHelper');
      }));

      it('adds an id to search results', function () {
        mockResults = {
          hits: {
            hits: [
              {
                _source: {
                  project_id: "project_id",
                  updated_at: "updated_at"
                },
                _type: "type",
                _id: "id"
              }
            ]
          }
        };
        var mockQuery = {
          onSearchSuccess: angular.noop
        };
        searchHelper.search(mockQuery);
        expect(mockResults.hits.hits[0].id).toBe("typeid");
      });
    });
  });

})();
