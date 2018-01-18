/**
 * Created by chenzhongying on 2018/1/10.
 */
private_cloud.controller('ngLoginController', ['$scope', 'tokenService', '$rootScope', function ($scope, tokenService, $rootScope) {
        $scope.login = function ($event) {
            $event.preventDefault();
            console.log($scope.userName);
            console.log($scope.password);
            tokenService.getToken($scope.userName, $scope.password);
        };
        $rootScope.token_promise.promise.then(function (token) {
            $rootScope.headers = {
                'X-Auth-Token':token,
                'Accept': 'application/json'
            };
            console.log('重新获取成功'+token);
            window.location.href = '/';
        }, function (info) {
            console.log(info);
        });

    }]
);