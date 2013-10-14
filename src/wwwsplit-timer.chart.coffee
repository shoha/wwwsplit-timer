angular.module('wwwsplit-timer.chart', ['d3'])

  .directive('lineChart', ['d3Service', (d3Service) ->
      scope:
        data: '='
      restrict: 'C'
      link: ($scope, elem, attrs) ->
        d3 = d3Service.d3()

        d3.select(elem[0]).append('svg');
    

  ])