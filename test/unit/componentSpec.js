/* globals angular, beforeEach, chai, describe, inject, it */
'use strict';

var expect = chai.expect;

describe('timer', function() {
  var elem, scope;

  // inject the module
  beforeEach(module('wwwsplit-timer'));

  // inject the template
  beforeEach(module('templates-main'));

  // compile and link
  beforeEach(inject(function($rootScope, $compile) {
    var ctrlScope = $rootScope.$new();
    ctrlScope.run = {
      title: 'Test Drive',
      attempts: 0,
      game_id: 1,
      game: {
        id: 1,
        title: "Desert Strike: Return to the Gulf",
        run_count: 0
      },
      splits: [{
        title: 'First split',
        split_time: 6404,
        icon_id: 0
      },
      {
        title: 'Second split',
        split_time: 7507,
        icon_id: 0
      },
      {
        title: 'Third split',
        split_time: null,
        icon_id: 0
      },
      {
        title: 'Fourth split',
        split_time: 11547,
        icon_id: 0
      },
      {
        title: 'Fifth split',
        split_time: 11877,
        icon_id: 0
      },
      {
        title: 'Sixth split',
        split_time: 12063,
        icon_id: 0
      }]
    };

    ctrlScope.running = false;

    elem = angular.element('<div class="timer" ng-model="run" is_running="running"></div>');
    $compile(elem)(ctrlScope);
    ctrlScope.$digest();

  }));

  describe('rendering', function() {
    it('should create the controls', inject(function() {
      var control_nav = elem.find('#control_nav');

      expect(control_nav).to.have.length(1);
    }));

    it('should create the splits table', inject(function() {
      var splits_table = elem.find('#current_run_splits');

      expect(splits_table).to.have.length(1);
    }));

    it('should display the proper number of splits', inject(function() {
      var splits = elem.find('.current_run_split');

      expect(splits).to.have.length(6);
    }));

  });

});
