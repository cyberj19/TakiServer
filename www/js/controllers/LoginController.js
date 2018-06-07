app.controller('LoginController', ['$rootScope', '$scope', function($rootScope, $scope) {
    $scope.state = {username: '', message: 'Please select a username'};
    $scope.login = function() {
        let payload = {'name': $scope.state.username};
        console.log('Making login request with payload ', payload);
        axios.post('http://localhost:1000/api/login',
        payload).then(
            function (response) {
                console.log(response.data);
                $rootScope.$broadcast('login', $scope.state.username);
            }
        ).catch(
            function (error) {
                console.log(error.response.data);
            }
        );
    };

  }]);