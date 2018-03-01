/**
 * Created by chenzhongying on 2018/2/8.
 */
private_cloud.controller('userNetworkController',['$scope','$rootScope','$http','subnets_service',function($scope,$rootScope,$http,subnets_service){
    $scope.adminstatus = {
        true:'UP',
        false:'DOWN'
    };
    subnets_service.getSubnets();
    $rootScope.subnets_promise.promise.then(function(data){
        $http({
            url:'/api/net_networks/',
            headers:$rootScope.headers
        }).then(function(response){
            console.log(response);
            $scope.networks = response.data.networks;
            angular.forEach($scope.networks,function(value,key) {
                angular.forEach(value.subnets, function (subvalue) {
                    angular.forEach(data,function(subnetvalue){
                        if(subvalue == subnetvalue.id){
                            console.log(subnetvalue.name);
                            if($scope.networks[key].subnetInfo != undefined){
                                $scope.networks[key].subnetInfo += subnetvalue.name+' '+subnetvalue.cidr;
                            }else{
                                $scope.networks[key].subnetInfo = subnetvalue.name+' '+subnetvalue.cidr;
                            }
                        }
                    });
                });
            });
            // $scope.networks = response.data.networks;
        },function(response){
            alert(response.statusText);
        });
    });
    $scope.editData = function(data){ //编辑网络弹出框初始信息
        console.log(data);
        $scope.networkId = data.id;
       $scope.editNetFormData = {
           name:data.name,
           admin_state_up:String(data.admin_state_up)
       };
    };
    $scope.formSubmit = function($event,type){
        switch(type){
            case 'editNetwork':
                $http({
                    url:'/api/net_networks/'+$scope.networkId,
                    method:'PUT',
                    headers:$rootScope.headers
                }).then(function(response){
                    console.log(response);
                    $('#edit_network').modal('hide');
                    $timeout(function(){
                        $state.go('etwork.userNetwork',{},{reload: true});
                    },500);
                },function(response){
                    alert(response.statusText);
                });
                break;
            case '':
        }
    };
    
}]);