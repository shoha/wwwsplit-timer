/* globals angular, beforeEach, chai, describe, inject, it */
'use strict';

var expect = chai.expect;

describe('milliseconds_to_HMS::', function() {
  var filter;

  beforeEach(module('wwwsplit-timer'));
  beforeEach(inject(function($filter) {
    filter = $filter;
  }));

  it('should have the milliseconds_to_hms filter', function() {
    expect(filter('milliseconds_to_HMS')).to.exist;
  });

  it('should respond to null with "-"', function() {
    expect(filter('milliseconds_to_HMS')(null)).to.eq('-')
  });

  it('should respond to integers with a properly formatted string', function() {
    expect(filter('milliseconds_to_HMS')(Date.now())).to.match(/^((\d+(.\d+)?):)*\d+(.\d+)?$/);
    expect(filter('milliseconds_to_HMS')(-Date.now())).to.match(/^[-]((\d+(.\d+)?):)*\d+(.\d+)?$/);
  });

  it('should convert integers to the proper string representation', function() {
    expect(filter('milliseconds_to_HMS')(0)).to.eq('0:00.00');
    expect(filter('milliseconds_to_HMS')(59990)).to.eq('0:59.99');
    expect(filter('milliseconds_to_HMS')(60000)).to.eq('1:00.00');
    expect(filter('milliseconds_to_HMS')(3599990)).to.eq('59:59.99');
    expect(filter('milliseconds_to_HMS')(3600000)).to.eq('1:00:00.00');

    expect(filter('milliseconds_to_HMS')(-0)).to.eq('0:00.00');
    expect(filter('milliseconds_to_HMS')(-59990)).to.eq('-0:59.99');
    expect(filter('milliseconds_to_HMS')(-60000)).to.eq('-1:00.00');
    expect(filter('milliseconds_to_HMS')(-3599990)).to.eq('-59:59.99');
    expect(filter('milliseconds_to_HMS')(-3600000)).to.eq('-1:00:00.00');
  });

}); 

describe('timer::', function() {
  var elem, scope, timeout, splits;

  // inject the module
  beforeEach(module('wwwsplit-timer'));

  // inject the templates
  beforeEach(module('wwwsplit-timer.templates'));

  // compile and link
  beforeEach(inject(function($rootScope, $compile, $timeout) {
    timeout = $timeout;

    $rootScope.run = {
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
        split_time: 100,
        icon_id: 0
      },
      {
        title: 'Second split',
        split_time: 200,
        best_segment: 0,
        icon_id: 0
      },
      {
        title: 'Third split',
        split_time: null,
        icon_id: 0
      },
      {
        title: 'Fourth split',
        split_time: 400,
        icon_id: 0
      },
      {
        title: 'Fifth split',
        split_time: 500,
        icon_id: 0
      },
      {
        title: 'Sixth split',
        split_time: 600,
        icon_id: 0
      }]
    };

    $rootScope.running = false;

    elem = angular.element('<div class="timer" ng-model="run" is_running="running"></div>');
    $compile(elem)($rootScope);
    $rootScope.$digest();
    scope = elem.scope();
    splits = scope.current_run.splits;


  }));

  describe('initialization::', function()
  {
    it('should have the run in its scope', inject(function() {

      expect(scope.current_run).to.be.ok;
      expect(splits).to.have.length(6);
    }));

    it('should not be running', inject(function() {
      expect(scope.running).to.be.false;
      expect(scope.start_time).to.not.exist;
      expect(scope.elapsed_time).to.not.exist;
    }));

    it('should not have any live data', inject(function() {
      for(var i = 0; i < splits.length; i++)
      {
        expect(splits[i].live_data).to.not.exist;
      }

      expect(scope.current_run_chart_series.data).to.be.empty;
    }));

  });

  describe('basic functionality::', function() {
    it('should start timer when start_timer is called', inject(function() {
      scope.start_timer();
      expect(scope.start_time).to.exist;
      expect(scope.current_split).to.eq(splits[0]);

      timeout.flush();
      expect(scope.elapsed_time).to.exist;
      expect(scope.elapsed_time).to.be.above(0);
    }));

    it('should increment attempts when start_timer is called', inject(function() {
      var attempts = scope.current_run.attempts;
      scope.start_timer();
      expect(scope.current_run.attempts).to.eq(attempts + 1)
    }));

    it('should advance the current_split when split is called', inject(function() {
      scope.start_timer();
      timeout.flush();
      scope.split();

      expect(scope.current_split).to.eq(splits[1]);
    }));

    it('should store live_data when split is called', inject(function() {
      scope.start_timer();
      timeout.flush();
      scope.split();

      expect(splits[0].live_data).to.exist;
      expect(splits[0].live_data).to.include.keys('live_time')
      expect(splits[0].live_data.live_time).to.eq(scope.elapsed_time);
      expect(scope.current_run_chart_series.data).to.have.length(1);
    }));

    it('should calculate split statistics correctly on split', inject(function() {
      scope.start_timer();
      timeout.flush();
      scope.split();

      expect(splits[0].live_data.live_time).to.eq(scope.elapsed_time);
      expect(splits[0].live_data.live_segment_time).to.eq(scope.elapsed_time);
      expect(splits[0].live_data.relative_time).to.eq(splits[0].live_data.live_time - splits[0].split_time);
      expect(splits[0].live_data.best_segment).to.be.true;

      timeout.flush();
      scope.split();
      expect(splits[1].live_data.live_time).to.eq(scope.elapsed_time);
      expect(splits[1].live_data.live_segment_time).to.eq(scope.elapsed_time - splits[0].live_data.live_time);
      expect(splits[1].live_data.relative_time).to.eq(splits[1].live_data.live_time - splits[1].split_time);
      expect(splits[1].live_data.best_segment).to.be.false;

      timeout.flush();
      scope.split();
      expect(splits[2].live_data.live_time).to.eq(scope.elapsed_time);
      expect(splits[2].live_data.live_segment_time).to.eq(scope.elapsed_time - splits[1].live_data.live_time);
      expect(splits[2].live_data.relative_time).to.not.exist;

    }));

    it('should step back when unsplit is called', inject(function() {
      scope.start_timer();
      timeout.flush();
      scope.split();
      timeout.flush();
      scope.unsplit();

      expect(scope.current_split).to.eq(splits[0]);
      expect(scope.current_split.live_data).to.be.empty;
      expect(scope.current_run_chart_series.data).to.be.empty;
    }));

    it('should reset the run when reset_timer is called', inject(function() {
      scope.start_timer();
      timeout.flush();

      scope.reset_timer();
      expect(scope.running).to.be.false;
      expect(scope.is_finished).to.be.false;
      expect(scope.current_split).to.not.exist;
      expect(scope.start_time).to.not.exist;
      expect(scope.elapsed_time).to.not.exist;

      for(var i = 0; i < splits.length; i++)
      {
        expect(splits[i].live_data).to.not.exist;
      }

      expect(scope.current_run_chart_series.data).to.be.empty;

    }));

    it('should stop running when the run is finished', inject(function() {
      scope.start_timer();

      for(var i = 0; i < splits.length; i ++)
      {
        timeout.flush();
        scope.split();
      }

      expect(scope.is_finished).to.be.true;
      expect(scope.running).to.be.false;
      expect(scope.current_split).to.not.exist;
    }));

  });

});
