/**
 * Created by chenzhongying on 2018/2/6.
 */
private_cloud.controller('wallController', ['$rootScope', '$scope', '$http', '$timeout', '$state', 'count_service',function ($rootScope, $scope, $http, $timeout, $state,count_service) {
    $http({
        url: '/api/list_segroups',
        headers: $rootScope.headers
    }).then(function (response) {
        console.log(response);
        $scope.walls = response.data.security_groups;
    }, function (response) {
        alert(response.statusText);
    });
    $scope.formData = {};//初始化表单数据
    $scope.formSubmit = function () { //创建防火墙
        $http({
            url: '/api/list_segroups/',
            method: 'POST',
            headers: $rootScope.headers,
            data: {
                "security_group": {
                    "name": $scope.formData.wallName,
                    "description": $scope.formData.description
                }
            }
        }).then(function (response) {
            console.log(response);
            $('#creat_wall').modal('hide');
            $timeout(function () {
                $state.go('security.wall', {}, {reload: true});
            }, 500);

        }, function (response) {
            alert(response.statusText);
        });
    };
    /*$scope.deleteWall = function (wallId, key, wallName) { //删除防火墙
        if (confirm('确定要删除防火墙' + wallName + '吗？')) {
            $http({
                url: '/api/list_segroups/' + wallId,
                method: 'DELETE',
                headers: $rootScope.headers
            }).then(function (response) {
                console.log(response);
                $scope.walls.splice(key, 1);
            }, function (response) {
                alert(response.statusText);
            });
        }
    };*/

}]);