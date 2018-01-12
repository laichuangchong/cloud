/**
 * Created by chenzhongying on 2018/1/5.
 */
private_cloud.controller('cloudComputerController', ['$scope', '$http', function ($scope, $http) {
    $scope.checkStatus = {};
    $scope.hostList = [
        {
            name:'node2',
            basename:'centos6',
            ip:['172.16.100.2','211.152.59.231'],
            configure:'m1.large',
            status:'运行中',
            mission:'None',
            'bettery_status':'运行中',
            operation:['172.16.100.2','211.152.59.231'],
            action:'dongzuo'
        },
        {
            name:'node2',
            basename:'centos6',
            ip:['172.16.100.2','211.152.59.231'],
            configure:'m1.large',
            status:'运行中',
            mission:'None',
            'bettery_status':'运行中',
            operation:['172.16.100.2','211.152.59.231'],
            action:'dongzuo'
        },
        {
            name:'node2',
            basename:'centos6',
            ip:['172.16.100.2','211.152.59.231'],
            configure:'m1.large',
            status:'运行中',
            mission:'None',
            'bettery_status':'运行中',
            operation:['172.16.100.2','211.152.59.231'],
            action:'dongzuo'
        },
    ];
  

}]);