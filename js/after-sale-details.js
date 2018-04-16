var ex = {
    id: null,
    no: ''
}; // 货运单信息
var data = {
    user_id: getobjS('user').id,
    token: getobjS('user').token,
    return_id: getSearch().rid
}; // 请求data数据

getASdetail();

//-----------------------------售后详情页 请求--------------------------------

// 获取售后详情
function getASdetail() {
    $.ajax({
        url: getApi('web/after_detail') ,
        type: 'post',
        data: data,
        dataType: 'jsonp',
        success: function (res) {
            loginOverdue(res.code);
            if (res.code === 0) {
                // 售后详情信息
                $('#_asd_img').attr('src', res.info.good_img);
                $('#_asd_r_no').html(res.info.return_no);
                $('#_asd_g_name').html("<a href='goods.html?id='" + res.info.good_id + ">" + res.info.good_name + "</a>");
                $('#_asd_g_num').html('x' + res.info.apply_num);
                $('#_asd_type').html(detailAfterType(res.info.after_type));
                $('#_asd_time').html(res.info.apply_time);
                // 售后进度时间线
                $('#_asd_timeline').html(ASDTimeLine(res.info.after_process));
                // 退货货运单信息
                if (res.info.status === 1) {
                    $('#_asd_back').css('display', 'block');
                    $('#_ab_name').html(res.info.seller_info.seller_name);
                    $('#_ab_phone').html(res.info.seller_info.seller_mobile || res.info.seller_info.seller_phone);
                    $('#_ad_addr').html(res.info.seller_info.location);
                    // 快递公司列表
                    getExpress();
                }
                // 服务单信息
                $('#_asd_i_sta').html(ASDStatus(res.info.status));
                $('#_asd_i_tp').html(detailAfterType(res.info.after_type));
                if (res.info.after_type === 0) {
                    var rt = res.info.refund_type === 0 ? '退款至账户余额' : '退款至支付宝';
                    $('.refund_type').css('display', '');
                    $('.refund_amount').css('display', '');
                    $('#_asd_i_tk').html(rt);
                    $('#_asd_i_am').html(res.info.amount);
                    if (res.info.refund_type === 0) {
                        $('.ali_info').css('display', 'none')
                    } else {
                        $('.ali_info').css('display', '');
                        $('#_asd_i_zh').html(res.info.payee_account);
                        $('#_asd_i_xm').html(res.info.payee_real_name)
                    }
                } else {
                    $('.refund_type').css('display', 'none');
                    $('.refund_amount').css('display', 'none');
                    $('.ali_info').css('display', 'none')
                }
                $('#_asd_i_wl').html(res.info.express_info.com);
                $('#_asd_i_dh').html(res.info.express_info.nu);
                $('#_asd_i_mx').html(res.info.description);
                $('#__seller_adr').html(res.info.seller_info.location);
                $('#__seller_consignee').html(res.info.seller_info.seller_name);
                $('#__seller_zip').html(res.info.seller_info.seller_zip);
                $('#__seller_phone').html(res.info.seller_info.seller_mobile || res.info.seller_info.seller_phone);
                $('#_asd_i_linkman').html(res.info.accept_name);
                $('#_asd_i_linkphone').html(res.info.mobile || res.info.phone);
            } else {
                _msg({msg: res.msg})
            }
        }
    })
}

// 取消服务单
function cancelAfterSale() {
    layui.use('layer', function () {
        var layer = layui.layer;
        layer.open({
            title: '取消服务单'
            , content: '确定要取消服务单吗？'
            , btn: ['确认', '取消']
            , yes: function (index, layero) {
                $.ajax({
                    url: getApi('web/after_cancel'),
                    type: 'post',
                    data: data,
                    dataType: 'jsonp',
                    success: function (res) {
                        layer.close(index);
                        if (res.code === 0) {
                            _msg({msg: res.msg});
                            // 更新详情内容
                            getASdetail();
                        } else {
                            _msg({msg: res.msg});
                        }
                    },
                    error: function (err) {
                        _msg({msg: '请重试'});
                    }
                })
            }
        });
    });


}

// 获取物流公司
function getExpress() {
    $.ajax({
        url: getApi('root/auth/express_company_list'),
        type: 'post',
        dataType: 'jsonp',
        success: function (res) {
            if (res.code === 0) {
                $('#_asd_express').html(expressHtml(res.list))
            }
        }
    })
}

// 提交退货物流信息
function submitExpress(th) {
    var no = $('#_asd_no');
    if (ex.id) {
        $('#_asd_express').removeClass('err');
        if (no.val()) {
            no.removeClass('err');
            $(th).attr('disabled', true);
            $.ajax({
                url: getApi('web/after_send'),
                type: 'post',
                data: {
                    user_id: getobjS('user').id,
                    token: getobjS('user').token,
                    return_id: getSearch().rid,
                    express_company_id: ex.id,
                    express_no: no.val()
                },
                dataType: 'jsonp',
                success: function (res) {
                    $(th).attr('disabled', false);
                    if (res.code === 0) {
                        _msg({msg: res.msg});
                        getASdetail();
                    } else {
                        _msg({msg: res.msg})
                    }
                },
                error: function (err) {
                    $(th).attr('disabled', false);
                    _msg({msg: '请重试'})
                }
            })
        } else {
            no.addClass('err');
        }
    } else {
        $('#_asd_express').addClass('err')
    }
}

//-----------------------------售后详情页 功能--------------------------------

// 售后类型校验
function detailAfterType(sta) {
    var tp = '';
    switch (sta) {
        case 0:
            tp = '退货退款';
            break;
        case 1:
            tp = '换货';
            break;
        case 2:
            tp = '维修';
            break;
    }
    return tp
}

// 售后进度时间线html
function ASDTimeLine(data) {
    var html = '';
    for (var i = 0, len = data.length; i < len; i++) {
        html += '<li class="layui-timeline-item">' +
            '<i class="layui-icon layui-timeline-axis">&#xe63f;</i>' +
            '<div class="layui-timeline-content layui-text">' +
            '<h3>' + data[i].time + '</h3>' +
            '<p><label>操作信息：</label>' + data[i].act_intro + '</p>' +
            '<p><label>操作人：</label><span>' + data[i].act_user + '</span>' +
            '<label>备注：</label><span>' + data[i].remark + '</span></p></div></li>'
    }
    return html
}

// 服务单状态
function ASDStatus(data) {
    var html = '';
    switch (data) {
        case 0:
            html = '待审核';
            break;
        case 1:
            html = '审核通过';
            break;
        case 2:
            html = '审核失败';
            break;
        case 3:
            html = '已发货';
            break;
        case 4:
            html = '已完成';
            break;
        case 5:
            html = '已取消';
            break;
        case 6:
            html = '已收货';
            break;
        case 7:
            html = '已拒签';
            break;
    }
    return html
}

// 物流公司html
function expressHtml(data) {
    var html = '<option value="">请选择</option>';
    for (var i = 0, len = data.length; i < len; i++) {
        html += '<option value="' + data[i].id + '">' + data[i].name + '</option>'
    }
    return html
}

// 选择物流公司
function changeExpress(th) {
    ex.id = $(th).val();
}