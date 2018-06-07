app.controller('WaitingRoomController', ['$rootScope', '$scope', function($rootScope, $scope) {
    $scope.state = {
        view: null,
        username: null,
        newGame: {name: null, rplayers: null},
        iid: null
    };

    $scope.createGame = function() {
        let payload = {player: $scope.state.username,
                        game: $scope.state.newGame.name,
                        required_players: $scope.state.newGame.rplayers};
        axios.post('http://localhost:1000/api/create', payload).then(
            function(response) {
                console.log(response.data);
            }
        );
    };

    $scope.joinGame = function(game) {
        let payload = {player: $scope.state.username, game: game};
        axios.post('http://localhost:1000/api/join', payload).then(
            function (response) {
                console.log(response.data);
                clearInterval($scope.state.iid);
                $rootScope.$broadcast('join', {game: game});
            }
        );
    }
    $rootScope.$on('login', function(event,data) {
        $scope.state.username = data;
        $scope.state.iid = setInterval(function() {
            axios.get('http://localhost:1000/api/view').then(
                function (response) {
                    console.log(response.data);
                    $scope.state.view = response.data;
                    $scope.$apply();
                }
            ).catch(
                function(error) {
                    console.log(error.response.data);
                }
            );
        }, 2000);
        $scope.$apply();
    });
  }]);