/**
 * Created by chenzhongying on 2018/1/5.
 */
private_cloud.controller('cloudComputerController', ['$scope', '$sce', '$rootScope', '$http', 'all_check_service', '$q', '$timeout', function ($scope, $sce, $rootScope, $http, all_check_service, $q, $timeout) {
    $scope.vm_state = { //状态
        initialized: '创建',
        active: '运行',
        rescued: '灾备运行',
        paused: '暂停',
        suspended: '挂起',
        stopped: '停止',
        soft_deleted: '软删除',
        hard_deleted: '应删除',
        resized: '确认迁移',
        error: '错误'
    };
    $scope.task_state = { //任务
        null: '没有任务执行',
        budilding: '孵化',
        image_snapshotting: '正在创建快找',
        image_backingup: '备份',
        pausing: '暂停',
        unpausing: '暂停恢复',
        suspending: '正在挂起',
        resuming: '挂起恢复',
        deleting: '正在删除',
        stopping: '正在停止',
        starting: '正在启动',
        rescuing: '灾难恢复',
        unrescuing: '灾难复原',
        rebooting: '正在重启',
        rebuilding: '正在重建',
        powering_on: '打开电源',
        powering_off: '关闭电源',
        resizing: '调整配置',
        resize_confirming: '配置调整确认',
        scheduling: '调度',
        block_device_mapping: '块设备映射',
        networking: '网络映射',
        spawning: '正在生成'
    };
    $scope.power_state = { //电池状态
        0: '无',
        1: '运行中',
        3: '暂停',
        4: '关闭',
        6: '崩溃',
        7: '挂起'
    };
    $scope.cloudHost = [];//云主机列表
    $scope.network_promise = $q.defer();
    $http({ //获取镜像
        url: "/api/list_images",
        method: 'GET',
        headers: $rootScope.headers
    }).then(function (response) {
        console.log(response.data.images);
        $scope.images = response.data.images;//所有镜像列表
    }, function (response) {
        alert(response.data.error.message);
    });

    $http({ //获取所有配置类型
        url: "/api/list_flavors/detail",
        method: 'GET',
        headers: $rootScope.headers
    }).then(function (response) {
        console.log(response);
        $scope.flavors = response.data.flavors;//所有配置类型

    }, function (response) {
        alert(response.data.error.message);
    });

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

    $scope.network_promise.promise.then(function () {
        $http({
            url: "/api/list_servers/detail", //获取云主机列表
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
                var flavorId = value.flavor.id; //镜像ID

                angular.forEach($scope.flavors, function (value) {
                    if (value.id == flavorId) {
                        console.log(key + " " + value.name);
                        item.config = value.name;
                        $timeout(function () {
                            $('#config' + key).popover({
                                html: true,
                                content: '<table class="table table-bordered table-striped table-condensed">' +
                                '<tbody>' +
                                '<tr>' +
                                '<td width="100px">VCPUs</td>' +
                                '<td width="100px">' + value.vcpus +
                                '</td>' +
                                '</tr>' +
                                '<tr>' +
                                '<td>内存</td>' +
                                '<td>' + value.ram / 1024 + '</td>' +
                                '</tr>' +
                                '<tr>' +
                                '<td>大小</td>' +
                                '<td>' + value.disk + '</td>' +
                                '</tr>' +
                                '</tbody>' +
                                '</table>'
                            });
                        }, 100);

                    }
                });
                item.name = value.name; //云主机名称
                item.id = value.id; //云主机id
                var imageId = value.image.id; //镜像ID
                item.vmState = $scope.vm_state[value['OS-EXT-STS:vm_state']]; //状态
                item.taskState = $scope.task_state[value['OS-EXT-STS:task_state']]; //任务状态
                item.powerState = $scope.power_state[value['OS-EXT-STS:power_state']]; //电源状态
                angular.forEach($scope.images, function (value, key) {
                    if (imageId == value.id) {
                        item.imageName = value.name; //镜像名称
                    }
                });

                $http({ //获取vnc地址
                    url: '/api/server_action/' + value.id,
                    method: 'POST',
                    headers: $rootScope.headers,
                    data: {
                        "os-getVNCConsole": {
                            "type": "novnc"
                        }
                    }

                }).then(function (response) {
                    console.log(response.data.console.url);
                    item.vnc = response.data.console.url;
                }, function (response) {
                    alert(response.data.error.message);
                });

                $scope.cloudHost.push(item);
            });
        }, function (response) {
            alert(response.data.error.message);
        });
    });

    $scope.restart = function (cloudId) { //重启
        $http({
            url: '/api/server_action/' + cloudId,
            method: 'POST',
            headers: $rootScope.headers,
            data: {
                "reboot": {
                    "type": "HARD"
                }
            }
        });
    };
    $scope.all_check = false; //全选按钮状态
    console.log($scope.all_check);
    $scope.allCheck = function (status) { //父选项
        all_check_service.allCheck(status, $scope.cloudHost);
    };
    $scope.itemCheck = function () { //子选项
        all_check_service.itemCheck($scope, $scope.cloudHost);
    };


}]);

