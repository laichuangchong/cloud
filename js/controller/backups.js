/**
 * Created by chenzhongying on 2018/1/5.
 */
private_cloud.controller('backupsController', ['$scope', '$http', 'all_check_service', function ($scope, $http, all_check_service) {
    $scope.hostList = [
        {
            name: 'node2',
            basename: 'centos6',
            time: 1516070191969,
            size: "10G"
        },
        {
            name: 'node2',
            basename: 'centos6',
            time: 1516070191969,
            size: "10G"
        },
        {
            name: 'node2',
            basename: 'centos6',
            time: 1516070191969,
            size: "10G"
        }
    ];
    $scope.all_check = false; //全选按钮状态
    console.log($scope.all_check);
    $scope.allCheck = function (status) { //父选项
        all_check_service.allCheck(status, $scope.hostList);
    };
    $scope.itemCheck = function () { //子选项
        all_check_service.itemCheck($scope);

    };
    $scope.deleteBase = function (name) {
        if (confirm('确定删除' + name + "吗？这个动作不能撤消哦")) {
            alert('删除成功');
        }
    };
}]);