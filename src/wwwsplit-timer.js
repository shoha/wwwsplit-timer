(function() {
  angular.module('wwwsplit-timer', []).directive('timer', [
    '$timeout', function($timeout) {
      return {
        restrict: 'C',
        scope: {
          current_run: '=ngModel',
          running: '=isRunning'
        },
        templateUrl: 'timer.tmpl',
        link: function($scope, elem, attrs) {
          var calculate_split_statistics, find_elapsed_time, reset_splits, update_time_on_timeout;
          $scope.running = false;
          $scope.current_run_chart_series = {
            name: 'Teh Urn',
            showInLegend: false,
            data: []
          };
          $scope.current_run_chart_options = {
            chart: {
              renderTo: 'current_run_chart_data',
              type: 'line',
              backgroundColor: '#333',
              borderColor: '#222'
            },
            colors: ['white'],
            labels: {
              style: {
                color: 'white'
              }
            },
            title: {
              floating: true,
              style: {
                display: 'none'
              }
            },
            xAxis: {
              title: {
                enabled: false,
                text: null,
                style: {
                  color: 'white'
                }
              },
              labels: {
                enabled: false,
                style: {
                  color: 'white'
                }
              }
            },
            yAxis: {
              title: {
                text: null,
                style: {
                  color: 'white'
                }
              },
              labels: {
                enabled: false,
                style: {
                  color: 'white'
                }
              }
            },
            tooltip: {
              formatter: function() {
                return '<b>' + this.key + '</b><br/>' + this.y;
              }
            },
            credits: {
              style: {
                color: 'white'
              }
            },
            width: '100%'
          };
          calculate_split_statistics = function(split, index) {
            var i, _i, _ref;
            if (split.split_time == null) {
              split.live_data.relative_time = null;
              split.live_data.segment_diff = null;
              if (index === 0) {
                split.live_data.live_segment_time = split.live_data.live_time;
                split.live_data.segment_diff = null;
              } else {
                split.live_data.live_segment_time = split.live_data.live_time - $scope.current_run.splits[index - 1].live_data.live_time;
              }
            } else {
              split.live_data.relative_time = split.live_data.live_time - split.split_time;
              if (index === 0) {
                split.live_data.live_segment_time = split.live_data.live_time;
                split.live_data.segment_diff = split.live_data.relative_time;
              } else {
                split.live_data.live_segment_time = split.live_data.live_time - $scope.current_run.splits[index - 1].live_data.live_time;
                for (i = _i = _ref = index - 1; _ref <= 0 ? _i <= 0 : _i >= 0; i = _ref <= 0 ? ++_i : --_i) {
                  if ($scope.current_run.splits[i].live_data.relative_time != null) {
                    split.live_data.segment_diff = split.live_data.relative_time - $scope.current_run.splits[i].live_data.relative_time;
                    break;
                  }
                }
              }
            }
            if ((split.best_segment == null) || split.best_segment > split.live_data.live_segment_time) {
              return split.live_data.best_segment = true;
            } else {
              return split.live_data.best_segment = false;
            }
          };
          find_elapsed_time = function() {
            return $scope.elapsed_time = Date.now() - $scope.start_time;
          };
          update_time_on_timeout = function() {
            find_elapsed_time();
            return $scope.timer_timeout_promise = $timeout(update_time_on_timeout, 25);
          };
          $scope.start_timer = function() {
            var split, _i, _len, _ref;
            if (!$scope.current_run.splits.length) {
              return;
            }
            _ref = $scope.current_run.splits;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              split = _ref[_i];
              split.live_data = {};
            }
            $scope.current_split = $scope.current_run.splits[0];
            $timeout.cancel($scope.timer_timeout_promise);
            $scope.start_time = Date.now();
            $scope.current_run_chart_series.data = [];
            $scope.timer_timeout_promise = $timeout(update_time_on_timeout, 25);
            $scope.current_run.attempts++;
            $scope.running = true;
            $scope.is_finished = false;
            return $scope.is_editing = false;
          };
          reset_splits = function() {
            var split, _i, _len, _ref, _results;
            if ($scope.current_run.splits) {
              _ref = $scope.current_run.splits;
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                split = _ref[_i];
                _results.push(split.live_data = {});
              }
              return _results;
            }
          };
          $scope.reset_timer = function() {
            $timeout.cancel($scope.timer_timeout_promise);
            reset_splits();
            $scope.current_split = null;
            if ($scope.current_run_chart_series) {
              $scope.current_run_chart_series.data = [];
            }
            $scope.running = false;
            $scope.is_finished = false;
            return $scope.elapsed_time = 0;
          };
          $scope.poke_chart_options = function() {
            return $scope.current_run_chart_options.poke = !$scope.current_run_chart_options.poke;
          };
          $scope.split = function() {
            $scope.current_split.live_data = {};
            $scope.current_split.live_data.live_time = $scope.elapsed_time;
            calculate_split_statistics($scope.current_split, $scope.current_run.splits.indexOf($scope.current_split));
            if ($scope.current_split.split_time != null) {
              $scope.current_run_chart_series.data.push({
                x: $scope.current_split.live_data.live_time / 1000,
                y: $scope.current_split.live_data.relative_time / 1000,
                name: $scope.current_split.title
              });
            }
            if ($scope.current_split === $scope.current_run.splits[$scope.current_run.splits.length - 1]) {
              $scope.finish_run();
              return;
            }
            return $scope.current_split = $scope.current_run.splits[$scope.current_run.splits.indexOf($scope.current_split) + 1];
          };
          $scope.unsplit = function() {
            $scope.current_split = $scope.current_run.splits[$scope.current_run.splits.indexOf($scope.current_split) - 1];
            $scope.current_split.live_data = {};
            if ($scope.current_split.split_time != null) {
              return $scope.current_run_chart_series.data.pop();
            }
          };
          return $scope.finish_run = function() {
            $timeout.cancel($scope.timer_timeout_promise);
            $scope.current_split = null;
            $scope.running = false;
            return $scope.is_finished = true;
          };
        }
      };
    }
  ]).filter('split_count_limiter', function() {
    return function(splits, current_split, count) {
      var end, index_of_current_split, start;
      if (splits == null) {
        return [];
      }
      if ((count == null) || count > splits.length) {
        return splits;
      }
      if (!current_split) {
        return splits.slice(0, count);
      }
      index_of_current_split = splits.indexOf(current_split);
      if (index_of_current_split + count > splits.length) {
        return splits.slice(splits.length - count, splits.length);
      }
      start = Math.max(0, index_of_current_split - Math.floor(count / 2));
      end = Math.min(start + count, splits.length);
      return splits.slice(start, end);
    };
  }).filter('milliseconds_to_HMS', function() {
    return function(milliseconds) {
      var h, is_negative, m, s, seconds;
      if (milliseconds == null) {
        return '-';
      }
      if (!milliseconds) {
        milliseconds = 0;
      }
      if (milliseconds < 0) {
        is_negative = true;
        milliseconds *= -1;
      }
      seconds = milliseconds / 1000;
      h = Math.floor(seconds / 3600);
      m = Math.floor(seconds % 3600 / 60);
      s = (seconds % 3600 % 60).toFixed(2);
      return (is_negative ? '-' : '') + (h > 0 ? h + ":" : "") + (m > 0 ? (h > 0 && m < 10 ? "0" : "") + m + ":" : "0:") + (s < 10 ? "0" : "") + s;
    };
  }).filter('HMS_to_milliseconds', function() {
    return function(HMS) {
      var index, seconds, time_components, value, _i, _len, _ref;
      time_components = HMS.split(':');
      seconds = 0;
      _ref = time_components.reverse();
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        value = _ref[index];
        seconds += value * Math.pow(60, index);
      }
      return seconds * 1000;
    };
  });

}).call(this);