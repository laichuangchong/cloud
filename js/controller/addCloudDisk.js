/**
 * Created by chenzhongying on 2018/1/16.
 */
private_cloud.controller('addCloudDiskController', ['$scope', '$rootScope', 'volume_service', '$http','$state', function ($scope, $rootScope, volume_service, $http,$state) {
    volume_service.getVolume(); //获取云硬盘相关信息
    $rootScope.volume_promise.promise.then(function (data) {
        console.log(data);
        $scope.storage = data;
    });

    $scope.formData = { //初始化表单数据
        size: 1
    };
    $scope.formSubmit = function ($event) {
        $http({
            url: '/api/list_volumes/',
            method: 'POST',
            headers: $rootScope.headers,
            data: {
                "volume": {
                    "availability_zone": "nova",
                    "display_name": $scope.formData.name,
                    "display_description": $scope.formData.description,
                    "size": $scope.formData.size
                }
            }
        }).then(function (response) {
            console.log(response);
            $state.go('storage.couldDisk');
            
        },function(response){
            alert(response.statusText);
        });
    };
}]);