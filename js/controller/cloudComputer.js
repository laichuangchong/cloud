/**
 * Created by chenzhongying on 2018/1/5.
 */
private_cloud.controller('cloudComputerController', ['$scope', '$http', 'all_check_service', function ($scope, $http, all_check_service) {

    $scope.hostList = [
        {
            name: 'node2',
            basename: 'centos6',
            ip: ['172.16.100.2', '211.152.59.231'],
            configure: 'm1.large',
            status: '运行中',
            mission: 'None',
            'bettery_status': '运行中',
            operation: ['172.16.100.2', '211.152.59.231'],
            action: 'dongzuo'
        },
        {
            name: 'node2',
            basename: 'centos6',
            ip: ['172.16.100.2', '211.152.59.231'],
            configure: 'm1.large',
            status: '运行中',
            mission: 'None',
            'bettery_status': '运行中',
            operation: ['172.16.100.2', '211.152.59.231'],
            action: 'dongzuo'
        },
        {
            name: 'node2',
            basename: 'centos6',
            ip: ['172.16.100.2', '211.152.59.231'],
            configure: 'm1.large',
            status: '运行中',
            mission: 'None',
            'bettery_status': '运行中',
            operation: ['172.16.100.2', '211.152.59.231'],
            action: 'dongzuo'
        },
    ];
    $scope.all_check = false; //全选按钮状态
    console.log($scope.all_check);
    $scope.allCheck = function (status) { //父选项
        all_check_service.allCheck(status, $scope.hostList);
    };
    $scope.itemCheck = function () { //子选项
        all_check_service.itemCheck($scope);

    };
}]);