var info = {
    sex: 2 // 性别   0=男 1=女 2=保密
    , head: '' // 头像
};

var ssx = {
    province_id: '' // 省id
}; // 省市县信息

getUserInfo();

//--------------------------个人信息 请求------------------------------

// 个人信息请求
function getUserInfo() {
    $.ajax({
        url: getApi('web/basic_info'),
        type: 'post',
        data: {
            user_id: getobjS('user').id,
            token: getobjS('user').token
        },
        dataType: 'jsonp',
        success: function (res) {
            if (res.code === 0) {
                info.head = res.info.head_pic;
                info.sex = res.info.sex;
                if (res.info.head_pic) {
                    $('#photo').attr('src', res.info.head_pic);
                }
                $('#name').html(res.info.username);
                $('#nick').val(res.info.nickname);
                $('#lv').html(res.info.vip);
                sexMonitor(res.info.sex);
                $('#birth').val(res.info.birthday);
                $('#email').html(res.info.email);
                $('#real_name').val(res.info.realname);
                $('#street').val(res.info.addr);
                if (res.info.province_id) {
                    $('#province').html('<option value="' + res.info.province_id + '">' + res.info.province_name + '</option>');
                    ssx.province_id = res.info.province_id
                }
                if (res.info.city_id) {
                    $('#city').html('<option value="' + res.info.city_id + '">' + res.info.city_name + '</option>');
                }
                if (res.info.county_id) {
                    $('#county').html('<option value="' + res.info.county_id + '">' + res.info.county_name + '</option>');
                }

                getRegion(0, 0);//先发起省请求
            }
        }
    })
}

// 个人信息保存
function saveUserInfo(th) {
    $(th).attr('disabled', true);
    $.ajax({
        url: getApi('web/info_save'),
        type: 'post',
        data: {
            user_id: getobjS('user').id,
            token: getobjS('user').token,
            head_pic: info.head,
            nickname: $('#nick').val(),
            sex: info.sex,
            birthday: $('#birth').val(),
            real_name: $("#real_name").val(),
            province_id: $("#province").val(),
            city_id: $("#city").val(),
            county_id: $("#county").val(),
            addr: $("#street").val(),
        },
        dataType: 'jsonp',
        success: function (res) {
            if (res.code === 0) {
                _msg({msg: res.msg});
                // getUserInfo();
                setInterval(function () {
                    location.href = "user-info.html"
                }, 1000);
            } else {
                _msg({msg: res.msg})
            }
        },
        error: function (err) {
            _msg({msg: '请重试'});
            $(th).attr('disabled', false);
        }
    }).done(function () {
        $(th).attr('disabled', false);
    })
}

//--------------------------个人信息 功能------------------------------

// 性别监测
function sexMonitor(val) {
    switch (val) {
        case 0:
            $('#men').attr('checked', true);
            break;
        case 1:
            $('#women').attr('checked', true);
            break;
        case 2:
            $('#gay').attr('checked', true);
            break;
    }
}

// 性别调整
function sexChange(val) {
    info.sex = val;
}

// 上传头像
var p = new MyPromise(qiniuSetUp);
p.then(function (data) {
    layui.use('upload', function () {
        var upload = layui.upload;
        //执行实例
        var uploadInst = upload.render({
            elem: '#photo' //绑定元素
            , url: data.http //上传接口
            , data: data.data // 可选项。额外的参数，如：{id: 123, abc: 'xxx'}
            , choose: function (obj) {
                //将每次选择的文件追加到文件队列
                var files = obj.pushFile();
                //预读本地文件，如果是多文件，则会遍历。(不支持ie8/9)
                obj.preview(function (index, file, result) {
                    // console.log(index); //得到文件索引
                    // console.log(file); //得到文件对象
                    // console.log(result); //得到文件base64编码，比如图片
                    //这里还可以做一些 append 文件列表 DOM 的操作
                    //obj.upload(index, file); //对上传失败的单个文件重新上传，一般在某个事件中使用
                    //delete files[index]; //删除列表中对应的文件，一般在某个事件中使用
                });
            }
            , before: function (obj) { //obj参数包含的信息，跟 choose回调完全一致，可参见上文。
                layer.load(); //上传loading
                //将每次选择的文件追加到文件队列
                var files = obj.pushFile();
                //预读本地文件，如果是多文件，则会遍历。(不支持ie8/9)
                obj.preview(function (index, file, result) {
                    // console.log(index); //得到文件索引
                    // console.log(file); //得到文件对象
                    // console.log(result); //得到文件base64编码，比如图片
                    $('#photo').attr('src', result);
                    //这里还可以做一些 append 文件列表 DOM 的操作
                    //obj.upload(index, file); //对上传失败的单个文件重新上传，一般在某个事件中使用
                    //delete files[index]; //删除列表中对应的文件，一般在某个事件中使用
                });
            }
            , done: function (res, index, upload) {
                //上传完毕回调
                layer.closeAll('loading'); //关闭loading
                if (res.key) {
                    info.head = res.key;
                } else {
                    layer.msg(res.msg || '上传失败，请刷新重试');
                }
            }
            , error: function () {
                //请求异常回调
                layer.closeAll('loading'); //关闭loading
                layer.msg('请重试')
            }
        });
    });
});

//===============================省市县===============================//
// 请求省市县
function getRegion(val, id) {
    $.ajax({
        url: getApi('coms/get_area'),
        type: 'post',
        data: {
            web: true,
            id: id
        },
        dataType: 'jsonp',
        success: function (res) {
            if (res.code === 0) {
                disposeRegion(val, res.list)
            } else {
                var html = '<option value="">请选择地址</option>';
                $('#city').html(html);
                $('#county').html(html);
            }
        }
    })
}

// 省市县dom处理
function disposeRegion(val, data) {
    var html = '<option value="">请选择地址</option>';
    for (var i = 0, len = data.length; i < len; i++) {
        html += '<option value="' + data[i].id + '" ' + (data[i].id === ssx.province_id ? "selected" : "") + '>' + data[i].name + '</option>'
    }
    switch (val) {
        case 0:
            $('#province').html(html);
            break;
        case 1:
            $('#city').html(html);
            $('#county').html('');
            break;
        case 2:
            $('#county').html(html);
            break;
    }
}

// 选择省请求市
$('#province').change(function () {
    getRegion(1, $(this).val())
});

// 选择市请求区
$('#city').change(function () {
    getRegion(2, $(this).val())
});
