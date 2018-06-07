app.controller('MainController', ['$rootScope', '$scope', function($rootScope, $scope) {
    $scope.state ={currentView: 'login'};

    $rootScope.$on('login', function(event,data) {
        $scope.state.currentView = 'waitingRoom';
        $scope.$apply();
    });
    $rootScope.$on('join', function(event,data) {
        $scope.state.currentView = 'game';
        $scope.$apply();
    });

    $scope.show = function(page) {
        return $scope.state.currentView === page;
    }
  }]);