/**
 * Created by chenzhongying on 2018/1/5.
 */
private_cloud.controller('cloudComputerController', ['$scope', '$sce', '$rootScope', '$http', 'all_check_service', '$q', '$timeout', '$window', '$interval', '$location', 'count_service', function ($scope, $sce, $rootScope, $http, all_check_service, $q, $timeout, $window, $interval, $location, count_service) {
    $scope.url = $location.path();
    $scope.warn = false;//警告框
    $scope.warnText = [];//警告文字
    $scope.vm_state = { //云主机状态
        building: '创建中',
        active: '运行中',
        rescued: '灾备运行',
        paused: '暂停',
        suspended: '挂起',
        stopped: '停止',
        soft_deleted: '软删除',
        hard_deleted: '应删除',
        resized: '确认/回退(调整配置)? ',
        error: '错误'
    };
    $scope.task_state = { //任务
        null: '无',
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
        rebuild_spawning: '重建孵化中',
        "powering-off": '正在关闭电源',
        resize_finish:'已经重建'
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

    function resetState(obj, data) { //开关机或新建时重置任务状态
        obj.vm = { //云主机状态
            state: data['OS-EXT-STS:vm_state'],
            text: $scope.vm_state[data['OS-EXT-STS:vm_state']]
        };
        obj.task = { //任务状态
            state: data['OS-EXT-STS:task_state'],
            text: $scope.task_state[data['OS-EXT-STS:task_state']]
        };
        obj.power = { //电源状态
            state: data['OS-EXT-STS:power_state'],
            text: $scope.power_state[data['OS-EXT-STS:power_state']]
        };
    }

    function reachImage(obj, imageId) { //查找镜像名称
        angular.forEach($rootScope.images, function (value, key) {
            if (imageId == value.id) {
                obj.imageName = value.name; //镜像名称
            }
        });
    }

    $rootScope.images_promise.promise.then(function () { //获取镜像之后执行
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
                resetState(item, value); //获取任务状态
                item.diskConfig = value['OS-DCF:diskConfig']; //磁盘分区
                console.log(item);
                reachImage(item, imageId); //查找备份名称

                if (value['OS-EXT-STS:task_state'] == null) {
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
                        alert(response.statusText);
                    });

                }

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
                            resetState($scope.cloudHost[key], data);

                            if (data['OS-EXT-STS:task_state'] == null) {
                                $scope.cloudHost[key].ipData = []; //IP地址初始化
                                $scope.cloudHost[key].vnc = ''; //vnc地址初始化

                                console.log(data.addresses);
                                angular.forEach(data.addresses, function (value) { //获取IP
                                    angular.forEach(value, function (value) {
                                        $scope.cloudHost[key].ipData.push(value);
                                        console.log($scope.cloudHost[key].ipData);
                                    });
                                });
                                console.log($scope.cloudHost[key].ipData);
                                $interval.cancel($scope['intervalInit' + key]);
                                $scope['intervalInit' + key] = null;
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
                                    $scope.cloudHost[key].vnc = response.data.console.url;
                                }, function (response) {
                                    // alert(response.data.error.message);
                                });
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
             alert(response.statusText);
        });

    }, function () {

    });


    $scope.deleteCloud = function (cloudId, name, index) { //删除云主机
        if (confirm('您确定删除' + name + '吗？此操作不可恢复！')) {
            $http({
                url: '/api/list_servers/' + cloudId,
                method: 'DELETE',
                headers: $rootScope.headers
            }).then(function (response) {
                if (response.status == 204) {
                    alert('操作成功');
                    $scope.cloudHost.splice(index, 1);
                }
            }, function () {
                alert('操作失败请重试');
            });
        }

    };
    $scope.restartComputer = function (cloudId, key) { //重启
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
            console.log(response);
            if (response.status == 202) {
                alert($scope.cloudHost[key].name + '重启成功');
                $scope['restartComputer' + key] = $interval(function () {
                    $http({
                        url: '/api/list_servers/' + cloudId,
                        method: 'GET',
                        headers: $rootScope.headers
                    }).then(function (success) {
                        console.log(success);
                        var data = success.data.server;
                        resetState($scope.cloudHost[key], data);
                        if (data['OS-EXT-STS:task_state'] == null) {
                            $interval.cancel($scope['restartComputer' + key]);
                            $scope['restartComputer' + key] = null;
                        }
                    }, function (error) {
                        alert(error.statusText);
                    });
                }, 2000);
            }
        }, function (response) {
            alert(response.statusText);
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

    $scope.changeConfig = function (newConfig) { //进度条
        $scope.coresChangeProgress = newConfig.vcpus - $scope.oldConfig.vcpus;
        $scope.ramChangeProgress = newConfig.ram / 1024 - $scope.oldConfig.ram / 1024;
    };
    $scope.resetConfigInfo = function (config, diskConfig, cloudId, key) { //调整配置弹框
        $scope.newConfig = config;//初始化新云主机类型
        $scope.diskConfig = diskConfig;//当前操作磁盘分区
        $scope.cloudId = cloudId;//当前操作云主机Id
        $scope.oldConfig = config; //旧配置类型
        $scope.key = key;
        console.log($scope.newConfig);
        count_service.getCount();
    };
    $scope.submitConfig = function () { //修改配置提交
        console.log($scope.cloudId);
        console.log($scope.newConfig);
        console.log($scope.diskConfig);
        $http({  //调整配置提交
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
            $('#reset_config').modal('hide');
            $scope.intervalConfig = $interval(function () { //提交调整配置后监听状态
                $http({
                    url: '/api/list_servers/' + $scope.cloudId,
                    method: 'GET',
                    headers: $rootScope.headers
                }).then(function (success) {
                    console.log(success);
                    var data = success.data.server;
                    resetState($scope.cloudHost[$scope.key], data);

                    if (data['OS-EXT-STS:task_state'] == null) {
                        $interval.cancel($scope.intervalConfig);
                        $scope.intervalConfig = null;
                    }
                }, function (error) {
                    alert(error.statusText);
                });
            }, 2000);

        }, function (response) {
            alert(response.statusText);
        });

    };
    $scope.confirmConfig = function (cloudId,key) { //确认迁移
        $http({
            url: '/api/server_action/' + cloudId,
            method: 'POST',
            headers: $rootScope.headers,
            data: {
                "confirmResize": null
            }
        }).then(function (response) {
            console.log(response);
            $window.location.reload();
            /*$scope.intervalConfirmConfig = $interval(function () {
                $http({
                    url: '/api/list_servers/' + cloudId,
                    method: 'GET',
                    headers: $rootScope.headers
                }).then(function (success) {
                    console.log(success);
                    var data = success.data.server;
                    resetState($scope.cloudHost[key], data);
                    angular.forEach($rootScope.flavors, function (flavor) {
                        if (flavor.id == data.flavor.id) {
                            $scope.cloudHost[key].config = flavor; //配置
                        }
                    });

                     if (data['OS-EXT-STS:task_state'] == null) {
                     $interval.cancel($scope.intervalConfirmConfig);
                     $scope.intervalConfirmConfig = null;
                     }
                }, function (error) {
                    alert(error.statusText);
                });
            }, 2000);*/

        }, function (response) {
            alert(response.statusText);
        });
    };

    $scope.returnConfig = function(cloudId){  //回退配置
        $http({
            url: '/api/server_action/' + cloudId,
            method: 'POST',
            headers: $rootScope.headers,
            data: {
                "revertResize" : null
            }
        }).then(function (response) {
            console.log(response);
            $window.location.reload();
        }, function (response) {
            alert(response.statusText);
        });
    };
    $scope.reconstruction = function (cloudId, key) { //重建云主机获取当前操作云主机ID
        $scope.cloudId = cloudId;//当前操作云主机Id
        $scope.key = key;
        console.log($scope.key);
        $scope.selectImage = '';
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
                $('#reset_cloud_computer').modal('hide');
                reachImage($scope.cloudHost[$scope.key], $scope.selectImage);
                $scope.intervalReconstruction = $interval(function () {
                    $http({
                        url: '/api/list_servers/' + $scope.cloudId,
                        method: 'GET',
                        headers: $rootScope.headers
                    }).then(function (success) {
                        console.log(success);
                        var data = success.data.server;
                        resetState($scope.cloudHost[$scope.key], data);

                        if (data['OS-EXT-STS:task_state'] == null) {
                            $interval.cancel($scope.intervalReconstruction);
                            $scope.intervalReconstruction = null;
                        }
                    }, function (error) {
                        alert(error.statusText);
                    });
                }, 2000);
            }
        }, function (response) {
            alert(response.statusText);
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


    $scope.toggleComputer = function (status, cloudId, key, name) {
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
            $scope['intervalToggle' + key] = $interval(function () {
                $http({
                    url: '/api/list_servers/' + cloudId,
                    method: 'GET',
                    headers: $rootScope.headers
                }).then(function (success) {
                    console.log(success);
                    var data = success.data.server;
                    resetState($scope.cloudHost[key], data);
                    if (data['OS-EXT-STS:task_state'] == null) {
                        $interval.cancel($scope['intervalToggle' + key]);
                        $scope['intervalToggle' + key] = null;
                    }
                }, function (error) {
                    alert(error.statusText);
                });
            }, 2000);
        }, function (error) {
            alert(error.statusText);
            /* console.log(error);
             $scope.warn = true;
             $scope.warnText.push('错误' + error.status + ' 云主机：' + name + '操作失败');*/
        });

    };


}]);
