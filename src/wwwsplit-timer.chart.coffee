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

        bg = svg.append('g')

        g = svg
          .append('g')
          .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')

        timer_line = d3.svg.line()
          .x((d) ->
            return x(time_function(d))
          )
          .y((d) ->
            return y(relative_time_function(d))
          )
          .interpolate('linear')

        bg.append('svg:rect').attr('id', 'ahead_rect')
        bg.append('svg:rect').attr('id', 'behind_rect')
        bg.append('svg:line').attr('id', 'origin_line')
        g.append('svg:path').attr('id', 'timer_line') 
        
        update_chart = (init) ->
          chart_width = window.getComputedStyle(elem[0]).width.substring(0, window.getComputedStyle(elem[0]).width.length - 2) - (margin.left + margin.right);
          chart_height = window.getComputedStyle(elem[0]).height.substring(0, window.getComputedStyle(elem[0]).height.length - 2) - (margin.bottom + margin.top);

          prev_chart_width = chart_width
          prev_chart_height = chart_height

          svg.attr('width', chart_width + margin.left + margin.right)
          svg.attr('height', chart_height + margin.top + margin.bottom)
          
          x.domain(d3.extent($scope.data, time_function)).range([0, chart_width])

          if $scope.data.length == 0
            adjusted_y_extent = [-10, 10]
          else
            y_extent = d3.extent($scope.data, relative_time_function)
            max_y_extent = Math.max(Math.abs(y_extent[0]), Math.abs(y_extent[1]))
            adjusted_y_extent = [-max_y_extent, max_y_extent]

          y.domain(adjusted_y_extent).range([chart_height, 0])

          bg.selectAll('rect#ahead_rect')
            .attr('x', 0)
            .attr('y', (chart_height + margin.top + margin.bottom) / 2)
            .attr('width', (chart_width + margin.left + margin.right))
            .attr('height', (chart_height + margin.top + margin.bottom) / 2)

          bg.selectAll('rect#behind_rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', (chart_width + margin.left + margin.right))
            .attr('height', (chart_height + margin.top + margin.bottom) / 2)

          bg.selectAll('line#origin_line')
            .attr('x1', 0)
            .attr('y1', (chart_height + margin.top + margin.bottom) / 2)
            .attr('x2', (chart_width + margin.left + margin.right))
            .attr('y2', (chart_height + margin.top + margin.bottom) / 2)

          g.selectAll('path#timer_line')
            .data([$scope.data])
            .transition()
            .duration(transition_time)
            .attr('d', timer_line)

          circles = g.selectAll('.circle')
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