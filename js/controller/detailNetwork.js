/**
 * Created by chenzhongying on 2018/3/5.
 */
private_cloud.controller('detailNetworkController', ['$scope', '$rootScope', '$http', '$state', 'subnets_service', '$q','$timeout', function ($scope, $rootScope, $http, $state, subnets_service, $q,$timeout) {
    $scope.network_promise = $q.defer();
    $scope.subNetworks = [];//相关子网
    $scope.ports = [];//相关端口
    $scope.editPortFormData = {};//编辑端口的数据
    $http({ //获取相关子网
        url: '/api/net_networks/' + $state.params.id,
        headers: $rootScope.headers
    }).then(function (response) {
        console.log(response);
        $scope.network = response.data.network;
        $scope.network_promise.resolve(response.data.network);
    }, function (response) {
        alert(response.statusText);
    });
    $http({  //获取相关端口
        url: '/api/net_ports/',
        headers: $rootScope.headers
    }).then(function (response) {
        console.log(response);
        $scope.allPorts = response.data.ports;
        angular.forEach($scope.allPorts,function(value){
            if(value.network_id == $state.params.id){
                $scope.ports.push(value);
            }
        });
        console.log($scope.ports);
    }, function (response) {
        alert(response.statusText);
    });
    subnets_service.getSubnets();

    $q.all({network:$scope.network_promise.promise,subNetworks:$rootScope.subnets_promise.promise}).then(function(data){
        console.log(data.network);
        angular.forEach(data.network.subnets,function(value){
            console.log(value);
            angular.forEach(data.subNetworks,function(network){
                if(network.id == value){
                    $scope.subNetworks.push(network);
                }
            });
        });
        console.log($scope.subNetworks);
    });
    $scope.edit_subNetwork = function(data){
        $scope.currentNetwork = data;
        $scope.subNetworkFormData = {
            name:data.name,
            enable_dhcp:data.enable_dhcp,
            gateway_ip:data.gateway_ip
        };
    };
    $scope.formSubmit = function($event,type){
        switch(type){
            case 'edit_subNetwork':
                console.log($scope.subNetworkFormData);
                $http({
                    url:'/api/net_subnets/'+$scope.currentNetwork.id,
                    method:'PUT',
                    headers:$rootScope.headers,
                    data:{
                        subnet:$scope.subNetworkFormData
                    }
                }).then(function(response){
                    console.log(response);
                    $('#edit_subNetwork').modal('hide');
                    $timeout(function () {
                        $state.go('network.detailNetwork', {}, {reload: true});
                    }, 500);

                },function(response){
                    alert(response.statusText);
                });
        }
    };
    $scope.deleteNetwork = function(info,key){ //删除网络
        if(confirm('您确定要删除'+info.name+'吗？该操纵无法撤销。')){
            $http({
                url:'/api/net_subnets/'+info.id,
                method:'DELETE',
                headers:$rootScope.headers
            }).then(function(response){
                console.log(response);
                alert('删除成功');
                $scope.subNetworks.splice(key,1);
            },function(response){
                alert(response.statusText);
            });
        }
    };

    $scope.edit_port = function(info){ //编辑端口初始化数据
        $scope.editPortFormData = {
            id:info.id,
            name:info.name,

        };

    };
    $scope.deletePart = function(info,key){ //删除端口
        $http({
            url:"/api/add_routers_if/"+info.id,
            headers:$rootScope.headers,
            method:"PUT"
        }).then(function(response){
            console.log(response);
        },function(response){
            alert(response.statusText);
        });
    };
}]);