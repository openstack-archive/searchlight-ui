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

  describe('searchlight-query-generator service functions', function () {
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
            polling: {},
            general: {}
          }
        };
      });
      $provide.factory('searchlight-ui.util.searchlightQueryUtils', function () {
        return {};
      });
    }));

    describe('generateItems', function () {
      var queryGenerator;

      beforeEach(inject(function ($injector) {
        queryGenerator = $injector.get('searchlight-ui.util.searchlightQueryGenerator');
        spyOn(queryGenerator, 'generate').and.callFake(function (query) {
          return query;
        });
      }));

      it('generates a single item query', function () {
        var mockItems = [
          {
            _type: "type",
            _id: "id"
          }
        ];
        var query = queryGenerator.generateItems(mockItems);
        expect(query).toEqual({
          "query": {
            "bool": {
              "filter": {
                "bool": {
                  "should": [
                    {
                      "ids": {
                        "type": "type",
                        "values": [
                          "id"
                        ]
                      }
                    }
                  ]
                }
              }
            }
          }
        });
      });

      it('generates a multiple same type item query', function () {
        var mockItems = [
          {
            _type: "type",
            _id: "1"
          },
          {
            _type: "type",
            _id: "2"
          }
        ];
        var query = queryGenerator.generateItems(mockItems);
        expect(query).toEqual({
          "query": {
            "bool": {
              "filter": {
                "bool": {
                  "should": [
                    {
                      "ids": {
                        "type": "type",
                        "values": [
                          "1", "2"
                        ]
                      }
                    }
                  ]
                }
              }
            }
          }
        });
      });

      it('generates a multiple type, multiple item query', function () {
        var mockItems = [
          {
            _type: "A",
            _id: "1"
          },
          {
            _type: "A",
            _id: "2"
          },
          {
            _type: "B",
            _id: "3"
          },
          {
            _type: "B",
            _id: "4"
          }
        ];
        var query = queryGenerator.generateItems(mockItems);
        expect(query).toEqual({
          "query": {
            "bool": {
              "filter": {
                "bool": {
                  "should": [
                    {
                      "ids": {
                        "type": "A",
                        "values": [
                          "1", "2"
                        ]
                      }
                    },
                    {
                      "ids": {
                        "type": "B",
                        "values": [
                          "3", "4"
                        ]
                      }
                    }
                  ]
                }
              }
            }
          }
        });
      });
    });
  });

})();
