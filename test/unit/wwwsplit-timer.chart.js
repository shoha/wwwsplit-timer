/* globals angular, beforeEach, chai, describe, inject, it */
'use strict';

var expect = chai.expect;

describe('wwwsplit-timer.charts::', function() {
  var $scope, elem;

  beforeEach(module('wwwsplit-timer.charts'));

  beforeEach(inject(function(_$rootScope_, _$compile_) {
    var $compile = _$compile_;
    var $rootScope = _$rootScope_;

    $rootScope.data = [
      {
        live_data: {
          live_time: Math.random(),
          relative_time: Math.random(),
          name: '',
          id: Math.random(),
        }
      },
      {
        live_data: {
          live_time: Math.random(),
          relative_time: Math.random(),
          name: '',
          id: Math.random(),
        }
      },
      {
        live_data: {
          live_time: Math.random(),
          relative_time: Math.random(),
          name: '',
          id: Math.random(),
        }
      },
      {
        live_data: {
          live_time: Math.random(),
          relative_time: Math.random(),
          name: '',
          id: Math.random(),
        }
      }
    ];


    elem = angular.element('<div class="lineChart" data="data" style="width: 100%; height: 150px"></div>');
    document.body.appendChild(elem[0]);
    $compile(elem)($rootScope);
    $rootScope.$digest();
    $scope = elem.scope();
    
    
  }));

  it('should create the svg element', inject(function() {
    expect(elem.find('svg')).to.have.length(1);
  }));

  it('should have data in its scope', inject(function() {
    expect($scope.data).to.have.length(4);
  }));

  it('should populate the graph with circles', inject(function() {
    expect(elem.find('circle')).to.have.length(4);
  }));

  it('should add circles when new data is added', inject(function() {
    $scope.$apply(function() {
      $scope.data.push({live_data:{live_time: Math.random(), relative_time: Math.random(), name: '', id: Math.random()}});
    })

    expect(elem.find('circle')).to.have.length(5);
  }));

  it('should remove circles when data is removed', inject(function() {
    $scope.$apply(function() {
      $scope.data.pop();
    });

    expect(elem.find('circle')).to.have.length(3);
  }));



});