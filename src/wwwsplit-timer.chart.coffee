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

        padding =
          left: 40
          right: 20
          top: 20
          bottom: 20

        x = d3.scale.linear()

        y = d3.scale.linear()

        svg = d3.select(elem[0])
          .append('svg')
          .attr('transform', 'translate(' + padding.left + ', ' + padding.top + ')')

        update_chart = (init) ->
          chart_width = window.getComputedStyle(elem[0]).width.substring(0, window.getComputedStyle(elem[0]).width.length - 2) - (padding.left + padding.right);
          chart_height = window.getComputedStyle(elem[0]).height.substring(0, window.getComputedStyle(elem[0]).height.length - 2) - (padding.bottom + padding.top);

          prev_chart_width = chart_width
          prev_chart_height = chart_height

          svg.attr('width', chart_width + padding.left + padding.right)
          svg.attr('height', chart_height + padding.top + padding.bottom)
          
          x.domain(d3.extent($scope.data, time_function)).range([0, chart_width])
          y.domain(d3.extent($scope.data, relative_time_function)).range([chart_height, 0])

          circles = svg.selectAll('circle')
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