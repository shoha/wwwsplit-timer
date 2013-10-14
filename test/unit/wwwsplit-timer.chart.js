/* globals angular, beforeEach, chai, describe, inject, it */
'use strict';

var expect = chai.expect;

describe('wwwsplit-timer.chart::', function() {
  var $scope, elem;

  beforeEach(module('wwwsplit-timer.chart'));

  beforeEach(inject(function(_$rootScope_, _$compile_) {
    var $compile = _$compile_;
    var $rootScope = _$rootScope_;

    elem = angular.element('<div class="lineChart"></div>');
    $compile(elem)($rootScope);
    $rootScope.$digest();
    $scope = elem.scope();
  }));

  it('should create the svg element', inject(function() {
    expect(elem.find('svg')).to.have.length(1);
  }));

});