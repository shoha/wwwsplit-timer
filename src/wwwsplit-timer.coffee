angular.module('wwwsplit-timer', ['wwwsplit-timer.templates', 'wwwsplit-timer.charts']).directive('timer', ['$timeout',
  ($timeout) ->
    restrict: 'C'
    scope:
      current_run: '=ngModel'
      running: '=isRunning'


    templateUrl: 'timer.tmpl'

    link: ($scope, elem, attrs) ->

      $scope.running = false

      # TIMER FUNCTIONS
      calculate_split_statistics = (split, index)->
        if not split.split_time?
          split.live_data.relative_time = null
          split.live_data.segment_diff = null
          if index == 0
            split.live_data.live_segment_time = split.live_data.live_time
            split.live_data.segment_diff = null
          else
            split.live_data.live_segment_time = split.live_data.live_time -
            $scope.current_run.splits[index - 1].live_data.live_time

        else
          split.live_data.relative_time = split.live_data.live_time - split.split_time

          if index == 0
            split.live_data.live_segment_time = split.live_data.live_time
            split.live_data.segment_diff = split.live_data.relative_time
          else
            split.live_data.live_segment_time = split.live_data.live_time -
            $scope.current_run.splits[index - 1].live_data.live_time

            for i in [index - 1..0]
              if $scope.current_run.splits[i].live_data.relative_time?
                split.live_data.segment_diff = split.live_data.relative_time -
                $scope.current_run.splits[i].live_data.relative_time
                break

        if not split.best_segment? or split.best_segment > split.live_data.live_segment_time
          split.live_data.best_segment = true
        else
          split.live_data.best_segment = false

      find_elapsed_time = ->
        $scope.elapsed_time = Date.now() - $scope.start_time

      update_time_on_timeout = ->
        find_elapsed_time()
        $scope.timer_timeout_promise = $timeout update_time_on_timeout, 25

      $scope.start_timer = ->
        return if not $scope.current_run.splits.length
        for split in $scope.current_run.splits
          split.live_data = {}
        $scope.current_split = $scope.current_run.splits[0]
        $timeout.cancel $scope.timer_timeout_promise
        $scope.start_time = Date.now()
        $scope.current_run.chart_data = []
        $scope.timer_timeout_promise = $timeout update_time_on_timeout, 25
        $scope.current_run.attempts++
        $scope.running = true
        $scope.is_finished = false
        $scope.is_editing = false

      reset_splits = ->
        (split.live_data = {} for split in $scope.current_run.splits) if $scope.current_run.splits

      $scope.reset_timer = ->
        $timeout.cancel $scope.timer_timeout_promise
        reset_splits()
        $scope.current_split = null
        $scope.current_run.chart_data = []
        $scope.running = false
        $scope.is_finished = false
        $scope.elapsed_time = null
        $scope.start_time = null;

      $scope.split = ->
        $scope.current_split.live_data = {}
        $scope.current_split.live_data.live_time = $scope.elapsed_time
        calculate_split_statistics $scope.current_split, $scope.current_run.splits.indexOf($scope.current_split)

        if $scope.current_split.split_time?
          data_point_id = (Math.random() * 1000000).toString(16);
          
          $scope.current_run.chart_data.push
            x: $scope.current_split.live_data.live_time / 1000
            y: $scope.current_split.live_data.relative_time / 1000
            name: $scope.current_split.title
            id: data_point_id
          $scope.current_split.live_data.data_point_id = data_point_id;

        if $scope.current_split == $scope.current_run.splits[$scope.current_run.splits.length - 1]
          $scope.finish_run()
          return

        $scope.current_split = $scope.current_run.splits[$scope.current_run.splits.indexOf($scope.current_split) + 1]

      $scope.unsplit = ->
        $scope.current_split = $scope.current_run.splits[$scope.current_run.splits.indexOf($scope.current_split) - 1]
        ($scope.current_run.chart_data.splice(i, 1) if d.id == $scope.current_split.live_data.data_point_id) for d, i in $scope.current_run.chart_data
        $scope.current_split.live_data = {}
        # $scope.current_run.chart_data.pop() if $scope.current_split.split_time?

      $scope.finish_run = ->
        $timeout.cancel $scope.timer_timeout_promise
        $scope.current_split = null
        $scope.running = false
        $scope.is_finished = true

      $scope.$watch('current_run', (new_value, old_value) ->
        return unless old_value?

        (new_value.chart_data ||= []) if new_value
      )
])
    
  .filter 'milliseconds_to_HMS', ->
      (milliseconds) ->
        return '-' if not milliseconds?
        milliseconds = 0 if not milliseconds

        if milliseconds < 0
          is_negative = true
          milliseconds *= -1

        seconds = milliseconds / 1000

        h = Math.floor(seconds / 3600)
        m = Math.floor(seconds % 3600 / 60)
        s = (seconds % 3600 % 60).toFixed(2)

        (if is_negative then '-' else '') + (if h > 0 then h + ":" else "") + (if m > 0 or h > 0 then (if h > 0 and m < 10 then "0" else "") + m +
        ":" else "0:") + (if s < 10 then "0" else "") + s
