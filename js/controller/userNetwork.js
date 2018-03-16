/**
 * Created by chenzhongying on 2018/2/8.
 */
private_cloud.controller('userNetworkController', ['$scope', '$rootScope', '$http', 'subnets_service', '$timeout', '$state', function ($scope, $rootScope, $http, subnets_service, $timeout, $state) {
    $scope.subNetworkFormData = { //添加子网初始值
        enable_dhcp: true, //激活DHCP
        ip_version: 4
    };
    subnets_service.getSubnets();
    $rootScope.subnets_promise.promise.then(function (data) {
        $http({
            url: '/api/net_networks/',
            headers: $rootScope.headers
        }).then(function (response) {
            console.log(response);
            $scope.networks = response.data.networks;
            angular.forEach($scope.networks, function (value, key) {
                $scope.networks[key].subnetInfo = [];
                angular.forEach(value.subnets, function (subvalue) {
                    angular.forEach(data, function (subnetvalue) {
                        if (subvalue == subnetvalue.id) {
                            $scope.networks[key].subnetInfo.push(subnetvalue);
                        }
                    });
                   
                });
            });
            // $scope.networks = response.data.networks;
        }, function (response) {
            alert(response.statusText);
        });
    });
    $scope.editData = function (data) { //编辑网络弹出框初始信息
        console.log(data);
        $scope.networkId = data.id;
        $scope.editNetFormData = {
            name: data.name,
            admin_state_up: String(data.admin_state_up)
        };
    };
    $scope.createSubNetwork = function (info) { //创建子网弹出框信息
        $scope.currentNetwork = info;
        $scope.subNetworkFormData = { //重现初始化
            enable_dhcp: true,
            network_id: info.id,
            ip_version: 4
        };
    };
    $scope.formSubmit = function ($event, type) {
        switch (type) {
            case 'editNetwork':
                $http({
                    url: '/api/net_networks/' + $scope.networkId,
                    method: 'PUT',
                    headers: $rootScope.headers,
                    data: {
                        "network": $scope.editNetFormData
                    }
                }).then(function (response) {
                    console.log(response);
                    $('#edit_network').modal('hide');
                    $timeout(function () {
                        $state.go('network.userNetwork', {}, {reload: true});
                    }, 500);
                }, function (response) {
                    alert(response.statusText);
                });
                break;
            case 'subNetwork':
                $http({
                    url: '/api/net_subnets/',
                    method: 'POST',
                    headers: $rootScope.headers,
                    data: {
                        subnet: $scope.subNetworkFormData
                    }
                }).then(function (response) {
                    console.log(response);
                    $('#create_subNetwork').modal('hide');
                    $timeout(function () {
                        $state.go('network.userNetwork', {}, {reload: true});
                    }, 500);
                }, function (response) {
                    console.log(response.statusText);
                });
                break;
        }
    };
    $scope.deleteNetwork = function(info,key){ //删除网络
        if(confirm('您确定要删除'+info.name+'吗？该操纵无法撤销。')){
            $http({
                url:'/api/net_networks/'+info.id,
                method:'DELETE',
                headers:$rootScope.headers
            }).then(function(response){
                console.log(response);
                alert('删除成功');
                $scope.networks.splice(key,1);
            },function(response){
                alert(response.statusText);
            });
        }
    };
}]);