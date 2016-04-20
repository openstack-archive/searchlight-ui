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
(function() {
  'use strict';

  describe('horizon.dashboard.project.search.commonStatus Filter', function () {
    beforeEach(module('horizon.framework.util.i18n'));
    beforeEach(module('horizon.dashboard.project.search'));

    describe('commonStatus', function () {
      var commonStatusFilter;
      beforeEach(inject(function (_commonStatusFilter_) {
        commonStatusFilter = _commonStatusFilter_;
      }));

      it('Returns value when key is present', function () {
        expect(commonStatusFilter('active')).toBe('Active');
      });

      it('Returns input when key is not present', function () {
        expect(commonStatusFilter('unknown')).toBe('unknown');
      });

    });

  });
})();
