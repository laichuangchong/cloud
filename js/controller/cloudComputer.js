/**
 * Created by chenzhongying on 2018/1/5.
 */
private_cloud.controller('cloudComputerController', ['$scope', '$rootScope', '$http', 'all_check_service', '$q', function ($scope, $rootScope, $http, all_check_service,$q) {
    $scope.cloudHost = [];//云主机列表

    $scope.network_promise = $q.defer();
    $http({ //获取所有网络类型
        url: "/api/list_networks",
        method: 'GET',
        headers: $rootScope.headers
    }).then(function (response) {
        console.log(response.data.networks);
        angular.forEach(response.data.networks, function (value, key) {
            switch (value["provider:network_type"]) {
                case 'vxlan':
                    $scope.fixedName = value.name;
                    break;
                case 'flat':
                    $scope.floatingName = value.name;
                    break;
            }

        });
        console.log($scope.fixedName);
        console.log($scope.floatingName);
        $scope.network_promise.resolve();
    }, function (response) {
        alert(response.data.error.message);
    });
    $scope.network_promise.promise.then(function(){
        $http({
            url: "/api/list_servers/detail",
            method: 'GET',
            headers: $rootScope.headers
        }).then(function (response) {
            console.log(response.data.servers);
            var data = response.data.servers;
            angular.forEach(data, function (value, key) {
                var item = {};
                item.ipData = [];
                console.log(value.addresses[$scope.fixedName]);
                var addresses = value.addresses[$scope.fixedName];
                angular.forEach(addresses, function (value, key) { //获取IP
                    switch (value["OS-EXT-IPS:type"]) {
                        case 'fixed':
                            item.ipData.push({name: $scope.fixedName, addr: value.addr});
                            break;
                        case "floating":
                            item.ipData.push({name: $scope.floatingName, addr: value.addr});
                            break;
                    }

                });

                item.name = value.name; //云主机名称
                var imageId = value.image.id; //镜像ID
                $http({ //获取镜像
                    url: "/api/list_images/" + imageId,
                    method: 'GET',
                    headers: $rootScope.headers
                }).then(function (response) {
                    console.log(response.data.image.name);
                    item.imageName = response.data.image.name; //镜像名称
                    $scope.cloudHost.push(item);
                }, function (response) {
                    alert(response.data.error.message);
                });
                $http({ //获取配置
                    url:"/api/list_flavors/"+value.flavor.id,
                    method: 'GET',
                    headers: $rootScope.headers
                }).then(function(response){
                    console.log(response);
                    item.config = response.data.flavor.name;
                },function(response){
                    alert(response.data.error.message);
                });
            });
        }, function (response) {
            alert(response.data.error.message);
        });
    });



    $scope.all_check = false; //全选按钮状态
    console.log($scope.all_check);
    $scope.allCheck = function (status) { //父选项
        all_check_service.allCheck(status, $scope.hostList);
    };
    $scope.itemCheck = function () { //子选项
        all_check_service.itemCheck($scope);

    };
}]);