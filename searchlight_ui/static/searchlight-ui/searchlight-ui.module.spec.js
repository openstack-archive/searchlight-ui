/**
 * (c) Copyright 2015 Hewlett-Packard Development Company, L.P.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
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

  describe('searchlight-ui', function() {
    it('should exist', function() {
      expect(angular.module('searchlight-ui')).toBeDefined();
    });
  });

  describe('searchlight-ui.basePath constant', function () {
    var searchBasePath, staticUrl;

    beforeEach(module('searchlight-ui'));
    beforeEach(inject(function ($injector) {
      searchBasePath = $injector.get('searchlight-ui.basePath');
      staticUrl = $injector.get('$window').STATIC_URL;
    }));

    it('should be defined', function () {
      expect(searchBasePath).toBeDefined();
    });

    it('should equal to "/static/searchlight-ui/"', function () {
      expect(searchBasePath).toEqual(staticUrl + 'searchlight-ui/');
    });
  });

})();
