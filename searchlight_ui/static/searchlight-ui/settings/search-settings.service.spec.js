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

  describe('searchlight-ui.settings.settingsService', function() {

    var service, $scope;

    ///////////////////////

    beforeEach(module('horizon.framework'));
    beforeEach(module('horizon.app.core'));
    beforeEach(module('searchlight-ui'));
    beforeEach(module('searchlight-ui.settings'));

    beforeEach(inject(function($injector, _$rootScope_) {
      $scope = _$rootScope_.$new();
      service = $injector.get('searchlight-ui.settings.settingsService');
    }));

    it('should open the modal', function() {
      service.initScope($scope);
      service.open({resultLimit: 1});
    });

  });
})();
