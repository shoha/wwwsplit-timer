angular.module('wwwsplit-timer-demo', ['wwwsplit-timer']).controller('demoCtrl', function($scope)
{
  $scope.run = {
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

  $scope.running = false;

});
