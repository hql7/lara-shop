var ssx = {
    province_id: '' // 省id
}; // 省市县信息
var repeat = 0; // 防抖

addressList();

//-----------------------收货地址 请求-------------------------

// 收货地址列表
function addressList() {
    $.ajax({
        url: getApi('web/address_list'),
        type: 'post',
        data: {
            user_id: getobjS('user').id,
            token: getobjS('user').token
        },
        dataType: 'jsonp',
        success: function (res) {
            loginOverdue(res.code);
            if (res.code === 0) {
                // 数量信息
                $('#_adr_y').html(res.now_num);
                $('#_adr_n').html(res.can_num);
                // 列表
                $('#_adr_list').html(addressHtml(res.list))
            } else {
                _msg({msg: res.msg})
            }
        }
    })
}

// 编辑地址
function editAddress(th, ne) {
    $(th).attr('disabled', true);
    $.ajax({
        url: getApi('web/address_edit'),
        type: 'post',
        data: {
            user_id: getobjS('user').id,
            token: getobjS('user').token,
            address_id: ne === 'new' ? '' : $(th).parent('td').attr('data-id')
        },
        dataType: 'jsonp',
        success: function (res) {
            loginOverdue(res.code);
            if (res.code === 0) {
                // 地址信息
                $('#consignee').val(res.info.accept_name);
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
                $('#street').val(res.info.addr);
                $('#mobile').val(res.info.mobile);
                $('#phone').val(res.info.phone);
                $('#zip').val(res.info.zip);
                // 弹出
                layui.use('layer', function () {
                    var layer = layui.layer;
                    layer.open({
                        type: 1,
                        title: '编辑收货地址',
                        area: ['760px'],
                        btn: ['确定', '取消'],
                        content: $('#pop_edit_add'),
                        yes: function (index, layero) {
                            if (vaEditAddr().form() && repeat === 0) {
                                // $('#edit_add_form').submit();
                                repeat++;
                                saveAddr(layer, index, th, ne);
                            }
                        }
                    });
                });
                $(th).attr('disabled', false);
                getRegion(0, 0);
            } else {
                _msg({msg: res.msg})
            }
        },
        error: function (err) {
            _msg({msg: '请重试'})
        }
    })
}

// 保存地址验证
function vaEditAddr() {
    return $('#edit_add_form').validate({
        rules: {
            consignee: {
                required: true,
                rangelength: [2, 8]
            },
            province: {
                required: true
            },
            city: {
                required: true
            },
            county: {
                required: true
            },
            street: {
                required: true,
                rangelength: [4, 20]
            },
            mobile: {
                required: true,
                phone: true
            }
        },
        // 报错信息显示位置
        errorPlacement: function (error, element) {
            error.appendTo(element.parent());
        },
        errorElement: "em"
    });
}

// 保存地址
function saveAddr(lay, ind, th, ne) {
    $.ajax({
        url: getApi('web/address_save'),
        type: 'post',
        data: {
            user_id: getobjS('user').id,
            token: getobjS('user').token,
            id: ne === 'nem' ? '' : $(th).parent('td').attr('data-id'),
            accept_name: $('#consignee').val(),
            province: $('#province').val(),
            city: $('#city').val(),
            county: $('#county').val(),
            addr: $('#street').val(),
            mobile: $('#mobile').val(),
            phone: $('#phone').val(),
            zip: $('#zip').val()
        },
        dataType: 'jsonp',
        success: function (res) {
            loginOverdue(res.code);
            if (res.code === 0) {
                lay.msg(res.msg);
                lay.close(ind);
                // 重新请求
                addressList();
            } else {
                lay.msg(res.msg);
            }
        },
        error: function (err) {
            lay.msg('请重试');
        }
    }).done(function () {
        repeat = 0
    })
}

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

// 设为默认地址
function setDefaultAddress(th) {
    $.ajax({
        url: getApi('web/address_default'),
        type: 'post',
        data: {
            user_id: getobjS('user').id,
            token: getobjS('user').token,
            address_id: $(th).parent('td').attr('data-id')
        },
        dataType: 'jsonp',
        success: function (res) {
            loginOverdue(res.code);
            if (res.code === 0) {
                _msg({msg: res.msg});
                addressList();
            } else {
                _msg({msg: res.msg})
            }
        },
        error: function (err) {
            _msg({msg: '请重试'})
        }
    })
}

// 删除地址
function delAddress(th) {
    $(th).attr('disabled', true);
    layui.use('layer', function () {
        var layer = layui.layer;
        layer.open({
            title: '删除收货地址'
            , content: '确认删除收货地址？'
            , btn: ['确认', '取消']
            , yes: function (index, layero) {
                if (repeat === 0) {
                    repeat++;
                    $.ajax({
                        url: getApi('web/address_del'),
                        type: 'post',
                        data: {
                            user_id: getobjS('user').id,
                            token: getobjS('user').token,
                            address_id: $(th).parent('td').attr('data-id')
                        },
                        dataType: 'jsonp',
                        success: function (res) {
                            loginOverdue(res.code);
                            if (res.code === 0) {
                                layer.close(index);
                                _msg({msg: res.msg});
                                addressList();
                            } else {
                                _msg({msg: res.msg})
                            }
                        },
                        error: function (err) {
                            _msg({msg: '请重试'})
                        }
                    }).done(function () {
                        repeat = 0;
                    })
                }
            }
            , btn2: function (index, layero) {
                repeat = 0;
                $(th).attr('disabled', false);
            }
            , cancel: function () {
                repeat = 0;
                $(th).attr('disabled', false);
            }
        });
    });
}

//------------------------收货地址 功能----------------------------

//地址列表html
function addressHtml(data) {
    var html = '';
    for (var i = 0, len = data.length; i < len; i++) {
        handel();
        html += '<tr><td>' + data[i].accept_name + '</td>' +
            '<td>' + data[i].location + '</td>' +
            '<td>' + data[i].addr + '</td>' +
            '<td>' + data[i].mobile + '</td>' +
            '<td data-id="' + data[i].id + '">' + handel(data[i].is_default) + '</td></tr>'
    }
    return html
}

// 可做操作
function handel(def) {
    var arr = '';
    if (def === 1) {
        arr = '<em>默认地址</em><button onclick="editAddress(this)">修改</button>' +
            '<button onclick="delAddress(this)">删除</button>'
    } else {
        arr = '<span onclick="setDefaultAddress(this)">设为默认地址</span>' +
            '<button onclick="editAddress(this)">修改</button>' +
            '<button onclick="delAddress(this)">删除</button>'
    }
    return arr
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
            $('#county').val('');
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
