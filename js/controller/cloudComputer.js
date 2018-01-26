/**
 * Created by chenzhongying on 2018/1/5.
 */
private_cloud.controller('cloudComputerController', ['$scope', '$sce', '$rootScope', '$http', 'all_check_service', '$q', '$timeout', '$window', '$interval', '$location', function ($scope, $sce, $rootScope, $http, all_check_service, $q, $timeout, $window, $interval, $location) {
    $scope.url = $location.path();
    $scope.warn = false;//警告框
    $scope.warnText = [];//警告文字
    $scope.vm_state = { //云主机状态
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
        building: '孵化',
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
        rebuilding: '正在重建',
        powering_on: '打开电源',
        powering_off: '关闭电源',
        resizing: '调整配置',
        resize_confirming: '配置调整确认',
        scheduling: '调度',
        block_device_mapping: '块设备映射',
        networking: '网络映射',
        spawning: '正在生成',
        reboot_started_hard: '正在重启',
        rebuild_spawning: '重建完成',
        "powering-off": '正在关闭电源'
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


    $rootScope.network_promise.promise.then(function () {
        $http({
            url: "/api/list_servers/detail", //获取云主机列表
            method: 'GET',
            headers: $rootScope.headers
        }).then(function (response) {
            var data = response.data.servers;
            console.log(data);
            angular.forEach(data, function (value, key) {
                var item = {};
                item.ipData = [];
                console.log(value.addresses);
                angular.forEach(value.addresses, function (value, key) { //获取IP
                    angular.forEach(value, function (value, key) {
                        console.log(value);
                        item.ipData.push(value);
                    });
                });
                // item.flavorId = value.flavor.id; //配置ID
                angular.forEach($rootScope.flavors, function (flavor) {
                    if (flavor.id == value.flavor.id) {
                        item.config = flavor; //配置
                    }
                });
                item.name = value.name; //云主机名称
                item.id = value.id; //云主机id
                var imageId = value.image.id; //镜像ID
                item.vm = { //云主机状态
                    state:value['OS-EXT-STS:vm_state'],
                    text:$scope.vm_state[value['OS-EXT-STS:vm_state']]
                };
                item.task = { //任务状态
                    state:value['OS-EXT-STS:task_state'],
                    text:$scope.task_state[value['OS-EXT-STS:task_state']]
                };
                item.power = { //电源状态
                    state:value['OS-EXT-STS:power_state'],
                    text:$scope.power_state[value['OS-EXT-STS:power_state']]
                };
              
                item.diskConfig = value['OS-DCF:diskConfig']; //磁盘分区
                console.log(item);
                angular.forEach($rootScope.images, function (value, key) {
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
                    item.vnc = response.data.console.url;
                }, function (response) {
                    // alert(response.data.error.message);
                });

                $scope.cloudHost.push(item);
                if (value['OS-EXT-STS:task_state'] != null) { //如果有任务正在执行那就要监听这个任务状态
                    $scope['intervalInit' + key] = $interval(function () {
                        $http({
                            url: '/api/list_servers/' + item.id,
                            method: 'GET',
                            headers: $rootScope.headers
                        }).then(function (success) {
                            console.log(success);
                            var data = success.data.server;
                            $scope.cloudHost[key].vm = { //云主机状态
                                state:data['OS-EXT-STS:vm_state'],
                                text:$scope.vm_state[data['OS-EXT-STS:vm_state']]
                            };
                            $scope.cloudHost[key].task = { //任务状态
                                state:data['OS-EXT-STS:task_state'],
                                text:$scope.task_state[data['OS-EXT-STS:task_state']]
                            };
                            $scope.cloudHost[key].power = { //电源状态
                                state:data['OS-EXT-STS:power_state'],
                                text:$scope.power_state[data['OS-EXT-STS:power_state']]
                            };

                            if (data['OS-EXT-STS:task_state'] == null) {
                                $scope.cloudHost[key].ipData=[];
                                angular.forEach(data.addresses, function (value, key) { //获取IP
                                    angular.forEach(value, function (value, key) {
                                        $scope.cloudHost[key].ipData.push(value);
                                    });
                                });
                                $interval.cancel($scope['intervalInit' + key]);
                                $scope['intervalInit' + key] = null;
                            }
                        }, function (error) {

                        });
                    }, 2000);
                }
                $scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
                    //you also get the actual event object
                    //do stuff, execute functions -- whatever...
                    $('#config' + key).popover({
                        html: true,
                        content: '<table class="table table-bordered table-striped table-condensed">' +
                        '<tbody>' +
                        '<tr>' +
                        '<td width="100px">VCPUs</td>' +
                        '<td width="100px">' + item.config.vcpus +
                        '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td>内存</td>' +
                        '<td>' + item.config.ram / 1024 + '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td>大小</td>' +
                        '<td>' + item.config.disk + '</td>' +
                        '</tr>' +
                        '</tbody>' +
                        '</table>'
                    });
                });
            });
        }, function (response) {
            // alert(response.data.error.message);
        });
    });

    $scope.deleteCloud = function (cloudId, name,index) { //删除云主机
        if (confirm('您确定删除' + name + '吗？此操作不可恢复！')) {
            $http({
                url: '/api/list_servers/' + cloudId,
                method: 'DELETE',
                headers: $rootScope.headers
            }).then(function (response) {
                if (response.status == 204) {
                    alert('操作成功');
                    $scope.cloudHost.splice(index,1);
                    // $window.location.reload();
                }
            }, function () {
                alert('操作失败请重试');
            });
        }

    };
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
        }).then(function (response) {
            if (response.status == 202) {
                $window.location.reload();
            }
        }, function (response) {
            // alert(response.data.error.message);
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
    $scope.resetConfigInfo = function (config, diskConfig, cloudId) { //调整配置弹框
        $scope.newConfig = config;//初始化新云主机类型
        $scope.diskConfig = diskConfig;//当前操作磁盘分区
        $scope.cloudId = cloudId;//当前操作云主机Id
        $scope.oldConfig = config; //旧配置类型
        console.log($scope.newConfig);
        $http({   //计算和防火墙
            url: '/api/nova_limits',
            method: 'GET',
            headers: $rootScope.headers
        }).then(function (response) {
            console.log(response.data.limits.absolute);
            var countData = response.data.limits.absolute;
            $scope.count = {
                instances: {
                    title: '云主机',
                    used: countData.totalInstancesUsed,
                    total: countData.maxTotalInstances,
                    unit: '个'

                },
                cores: {
                    title: 'VCPUs',
                    used: countData.totalCoresUsed,
                    total: countData.maxTotalCores,
                    unit: '个'
                },
                ram: {
                    title: '内存',
                    used: countData.totalRAMUsed / 1024,
                    total: countData.maxTotalRAMSize / 1024,
                    unit: 'GB'
                }
            };

        }, function (response) {
            console.log(response);
            // alert(response.data.error.message);
        });

    };
    $scope.changeConfig = function (newConfig) { //进度条
        $scope.coresChangeProgress = newConfig.vcpus - $scope.oldConfig.vcpus;
        $scope.ramChangeProgress = newConfig.ram / 1024 - $scope.oldConfig.ram / 1024;
    };

    $scope.submitConfig = function () { //修改配置提交
        console.log($scope.cloudId);
        console.log($scope.newConfig);
        console.log($scope.diskConfig);
        $http({
            url: '/api/server_action/' + $scope.cloudId,
            method: 'POST',
            headers: $rootScope.headers,
            data: {
                "resize": {
                    "flavorRef": $scope.newConfig.id,
                    "OS-DCF:diskConfig": $scope.diskConfig
                }
            }

        }).then(function (response) {
            console.log(response);
            if (response.status == 202) {
                $('#myModal').modal('hide');
            }
        }, function (response) {
            console.log(response);
        });
    };

    $scope.reconstruction = function (cloudId) { //重建云主机获取当前操作云主机ID
        $scope.cloudId = cloudId;//当前操作云主机Id
    };

    $scope.submitResetCloudComputer = function () { //重建云主机
        console.log($scope.selectImage);
        $http({
            url: '/api/server_action/' + $scope.cloudId,
            method: 'POST',
            headers: $rootScope.headers,
            data: {
                "rebuild": {
                    "imageRef": $scope.selectImage
                }
            }
        }).then(function (response) {
            console.log(response);
            if (response.status == 202) {
                $window.location.reload();
            }
        }, function () {

        });
    };
    $scope.searchCloud = '';
    $scope.showCloud = function (cloud_name) {
        if ($scope.searchCloud) {
            if (cloud_name.indexOf($scope.searchCloud) != -1) {
                return true;
            } else {
                return false;
            }
        } else {
            return true;
        }
    };

    $scope.globalToggle = function (status) {
        var keystr = "os-" + status;
        var json = {};
        json[keystr] = null;
        angular.forEach($scope.cloudHost, function (value, key) {
            if (value.check_status) {
                console.log(value.id);
                $http({
                    url: '/api/server_action/' + value.id,
                    method: 'POST',
                    headers: $rootScope.headers,
                    data: json
                }).then(function (success) {
                    console.log(success);
                 $scope['intervalToggle'+key]= $interval(function(){
                     $http({
                         url: '/api/list_servers/' + value.id,
                         method: 'GET',
                         headers: $rootScope.headers
                     }).then(function (success) {
                         console.log(success);
                         var data = success.data.server;
                         $scope.cloudHost[key].vmState = $scope.vm_state[data['OS-EXT-STS:vm_state']]; //状态
                         $scope.cloudHost[key].taskState = $scope.task_state[data['OS-EXT-STS:task_state']]; //任务状态
                         $scope.cloudHost[key].powerState = $scope.power_state[data['OS-EXT-STS:power_state']]; //电源状态
                         if (data['OS-EXT-STS:task_state'] == null) {
                             $interval.cancel($scope['intervalToggle'+key]);
                             $scope['intervalToggle'+key] = null;
                         }
                     }, function (error) {

                     });
                    },2000);
                }, function (error) {
                    console.log(error);
                    $scope.warn = true;
                    $scope.warnText.push('错误' + error.status + ' 云主机：' + value.name + '操作失败');
                });
            }
        });
        /*if (angular.isDefined($rootScope.interval)) {
         $interval.cancel($rootScope.interval);
         $rootScope.interval = null;
         }

         $rootScope.interval = $interval(function () {
         if ($scope.url == '/count/computer') {
         $http({
         url: "/api/list_servers/detail", //获取云主机列表
         method: 'GET',
         headers: $rootScope.headers
         }).then(function (response) {
         var data = response.data.servers;
         angular.forEach(data, function (value, key) {
         console.log($scope.cloudHost[key]);

         $scope.cloudHost[key].vmState = $scope.vm_state[value['OS-EXT-STS:vm_state']]; //状态
         $scope.cloudHost[key].taskState = $scope.task_state[value['OS-EXT-STS:task_state']]; //任务状态
         $scope.cloudHost[key].powerState = $scope.power_state[value['OS-EXT-STS:power_state']]; //电源状态
         });
         }, function () {

         });
         }
         $scope.url = $location.path();
         }, 2000);*/


    };
    $scope.toggleComputer = function (status,cloudId,key) {
        var keystr = "os-" + status;
        var json = {};
        json[keystr] = null;
        $http({
            url: '/api/server_action/' + cloudId,
            method: 'POST',
            headers: $rootScope.headers,
            data: json
        }).then(function (success) {
            console.log(success);
            $scope['intervalToggle'+key]= $interval(function(){
                $http({
                    url: '/api/list_servers/' + cloudId,
                    method: 'GET',
                    headers: $rootScope.headers
                }).then(function (success) {
                    console.log(success);
                    var data = success.data.server;
                    $scope.cloudHost[key].vm = { //云主机状态
                        state:data['OS-EXT-STS:vm_state'],
                        text:$scope.vm_state[data['OS-EXT-STS:vm_state']]
                    };
                    $scope.cloudHost[key].task = { //任务状态
                        state:data['OS-EXT-STS:task_state'],
                        text:$scope.task_state[data['OS-EXT-STS:task_state']]
                    };
                    $scope.cloudHost[key].power = { //电源状态
                        state:data['OS-EXT-STS:power_state'],
                        text:$scope.power_state[data['OS-EXT-STS:power_state']]
                    };

                    if (data['OS-EXT-STS:task_state'] == null) {
                        $interval.cancel($scope['intervalToggle'+key]);
                        $scope['intervalToggle'+key] = null;
                    }
                }, function (error) {

                });
            },2000);
        }, function (error) {
            console.log(error);
            $scope.warn = true;
            $scope.warnText.push('错误' + error.status + ' 云主机：' + value.name + '操作失败');
        });


    };

}]);
