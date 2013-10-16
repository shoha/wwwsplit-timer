angular.module('wwwsplit-timer.charts', ['d3'])

  .directive('lineChart', ['d3Service', '$window', '$timeout', (d3Service, $window, $timeout) ->
      scope:
        data: '='
      restrict: 'C'
      link: ($scope, elem, attrs) ->
        d3 = d3Service.d3()
        time_function = (d) -> d.x
        relative_time_function = (d) -> d.y
        id_function = (d) -> d.id
        prev_chart_width = 0
        prev_chart_height = 0
        transition_time = 750
        init = true;

        margin =
          left: 10
          right: 10
          top: 10
          bottom: 10

        chart_width = window.getComputedStyle(elem[0]).width.substring(0, window.getComputedStyle(elem[0]).width.length - 2) - (margin.left + margin.right);
        chart_height = window.getComputedStyle(elem[0]).height.substring(0, window.getComputedStyle(elem[0]).height.length - 2) - (margin.bottom + margin.top);

        x = d3.scale.linear()

        y = d3.scale.linear()

        svg = d3.select(elem[0])
          .append('svg')
          .attr('width', chart_width + margin.left + margin.right)
          .attr('height', chart_height + margin.top + margin.bottom)

        g = svg
          .append('g')
          .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')

        line = d3.svg.line()
          .x((d) ->
            return x(time_function(d))
          )
          .y((d) ->
            return y(relative_time_function(d))
          )
          .interpolate('linear')

        origin_line = d3.svg.line()
          .x((d) ->
            return d[0]
          )
          .y((d)->
            return y(d[1])
          )
          .interpolate('linear')

        g.append('svg:path').attr('class', 'origin_line')
        g.append('svg:path').attr('class', 'timer_line') 

        update_chart = (init) ->
          chart_width = window.getComputedStyle(elem[0]).width.substring(0, window.getComputedStyle(elem[0]).width.length - 2) - (margin.left + margin.right);
          chart_height = window.getComputedStyle(elem[0]).height.substring(0, window.getComputedStyle(elem[0]).height.length - 2) - (margin.bottom + margin.top);

          prev_chart_width = chart_width
          prev_chart_height = chart_height

          svg.attr('width', chart_width + margin.left + margin.right)
          svg.attr('height', chart_height + margin.top + margin.bottom)
          
          x.domain(d3.extent($scope.data, time_function)).range([0, chart_width])

          y_extent = d3.extent($scope.data, relative_time_function)
          max_y_extent = Math.max(Math.abs(y_extent[0]), Math.abs(y_extent[1]))
          adjusted_y_extent = [-max_y_extent, max_y_extent]

          y.domain(adjusted_y_extent).range([chart_height, 0])

          g.selectAll('path.origin_line')
            .data([[[0, 0],[chart_width, 0]]])
            .attr('d', origin_line)

          g.selectAll('path.timer_line')
            .data([$scope.data])
            .transition()
            .duration(transition_time)
            .attr('d', line)

          circles = g.selectAll('circle')
            .data($scope.data, id_function)

          circles.transition()
            .duration(transition_time)
            .attr('cx', (d) -> x(time_function(d)))
            .attr('cy', (d) -> y(relative_time_function(d)))
          
          circles.enter()
            .append('circle')
            .attr('cx', (d) -> x(time_function(d)))
            .attr('cy', (d) -> y(relative_time_function(d)))
            .attr('r', 4)
            .attr('class', 'circle')

          circles.exit()
            .remove()

        resize_timer = undefined
        $window.onresize = ->
          $timeout.cancel(resize_timer) if resize_timer?
          resize_timer = $timeout ->
            update_chart(init)
          , 100

        $scope.$watch 'data', (new_value, old_value) ->
          return unless old_value
          update_chart(init)

        ,true
  ])