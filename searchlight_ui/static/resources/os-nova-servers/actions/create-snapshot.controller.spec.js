/**
 * (c) Copyright 2016 Hewlett Packard Enterprise Development Company LP
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function() {
  'use strict';

  describe('CreateSnapshotController', function() {
    var ctrl, context, modalInstance;
    beforeEach(module(function($provide) {
      context = {some: 'thing'};
      modalInstance = {close: angular.noop, dismiss: angular.noop};
      $provide.value('context', context);
      $provide.value('$uibModalInstance', modalInstance);
    }));
    beforeEach(module('resources.os-nova-servers.actions'));

    beforeEach(inject(function($controller) {
      ctrl = $controller('CreateSnapshotController');
      ctrl.form = { $valid: true, '$setSubmitted': angular.noop };
    }));

    it('exists', function() {
      expect(ctrl).toBeDefined();
    });

    describe('submit', function() {
      it('calls close when valid', function() {
        spyOn(modalInstance, 'close');
        ctrl.form.$valid = true;
        ctrl.submit();
        expect(modalInstance.close).toHaveBeenCalledWith({some: 'thing'});
      });

      it('does not call close when invalid', function() {
        spyOn(modalInstance, 'close');
        ctrl.form.$valid = false;
        ctrl.submit();
        expect(modalInstance.close).not.toHaveBeenCalled();
      });
    });

    describe('cancel', function() {
      it('calls dismiss', function() {
        spyOn(modalInstance, 'dismiss');
        ctrl.cancel();
        expect(modalInstance.dismiss).toHaveBeenCalledWith({some: 'thing'});
      });
    });

  });

})();
