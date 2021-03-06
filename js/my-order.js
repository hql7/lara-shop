var page = {
    index: 1, // 当前页 layui默认每页十条
    total: 0, // 总数
    size: 10,
}; // 分页
var back = 0; // 退款方式  0=账户余额 1=支付宝
var repeat = 0; //防抖

// 默认全部订单请求
getOrder();
$('.ref_ali').css('display', 'none');
//-------------------------我的订单请求----------------------------
// 请求订单数据
function getOrder() {
    $.ajax({
        url: getApi('web/my_orders'),
        type: 'post',
        data: {
            index: page.index,
            user_id: getobjS('user').id,
            token: getobjS('user').token,
            type: getSearch().s,
            order_no: $('#or_no_').val(),
            order_time: $('#or_date_search').val()
        },
        dataType: 'jsonp',
        success: function (res) {
            loginOverdue(res.code);
            if (res.code === 0) {
                // 分页信息
                page.total = res.fy_count;
                page.size = res.fy_pgSize;
                if (res.fy_pgCur === 1) {
                    layuiPage()
                }

                // 订单数量信息
                $('#_or_st0').html(res.count.all);
                $('#_or_st1').html(res.count.no_pay);
                $('#_or_st2').html(res.count.no_send);
                $('#_or_st3').html(res.count.no_receive);
                $('#_or_st4').html(res.count.no_review);
                // 订单视图处理
                $('#_or_tbe').html(orderBoxHtml(res.list));
            } else {
                _msg({msg: res.msg})
            }
        }
    })
}

// 取消订单
function cancellationOrder(id) {
    layui.use('layer', function () {
        var layer = layui.layer;
        layer.open({
            title: '取消订单'
            , content: '确定要取消订单吗？'
            , btn: ['确认', '取消']
            , yes: function (index, layero) {
                if (repeat === 0) {
                    repeat++;
                    $.ajax({
                        url: getApi('web/order_cancel'),
                        type: 'post',
                        data: {
                            user_id: getobjS('user').id,
                            token: getobjS('user').token,
                            order_id: id
                        },
                        dataType: 'jsonp',
                        success: function (res) {
                            if (res.code === 0) {
                                layer.close(index);
                                _msg({msg: res.msg});
                                getOrder();
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
            }
            , cancel: function () {
                repeat = 0;
            }
        });
    });
}

// 立即支付
function toPay(id, no) {
    location.href = 'pay.html?oid=' + id + '&no=' + no + ''
}

// 申请退款
function applyRefund(id) {
    layui.use('layer', function () {
        var layer = layui.layer;
        layer.open({
            type: 1
            , title: '申请退款'
            , content: $('#pop_back')
            , area: '500px'
            , btn: ['确认', '取消']
            , yes: function (index, layero) {
                if (back === 1) {   //支付宝
                    if ($('#payee_account').val() === '') {
                        $('#payee_account').focus();
                        return false
                    }
                    if ($('#payee_real_name').val() === '') {
                        $('#payee_real_name').focus();
                        return false
                    }
                }
                if ($('#_back_yy').val() === '') {
                    $('#_back_yy').focus();
                    return false
                }

                if (repeat === 0) {
                    repeat++;
                    $.ajax({
                        url: getApi('web/order_refund'),
                        type: 'post',
                        data: {
                            user_id: getobjS('user').id,
                            token: getobjS('user').token,
                            order_id: id,
                            type: back,
                            reason: $('#_back_yy').val(),
                            payee_account: $('#payee_account').val(),
                            payee_real_name: $('#payee_real_name').val()
                        },
                        dataType: 'jsonp',
                        success: function (res) {
                            if (res.code === 0) {
                                layer.close(index);
                                _msg({msg: res.msg});
                                getOrder();
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
            }
            , cancel: function () {
                repeat = 0;
            }
        });
    });
}

// 确认收货
function confirmReceipt(id) {
    layui.use('layer', function () {
        var layer = layui.layer;
        layer.open({
            title: '确认收货'
            , content: '确认收货之前请确认您已收到货物'
            , btn: ['确认', '取消']
            , yes: function (index, layero) {
                if (repeat === 0) {
                    repeat++;
                    $.ajax({
                        url: getApi('web/order_receipt'),
                        type: 'post',
                        data: {
                            user_id: getobjS('user').id,
                            token: getobjS('user').token,
                            order_id: id
                        },
                        dataType: 'jsonp',
                        success: function (res) {
                            if (res.code === 0) {
                                layer.close(index);
                                _msg({msg: res.msg});
                                getOrder();
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
            }
            , cancel: function () {
                repeat = 0;
            }
        });
    });
}

// 去评价
function toEvaluate(id) {
    location.href = 'evaluate.html?oid=' + id + '';
}

// 删除订单
function delOrder(id) {
    layui.use('layer', function () {
        var layer = layui.layer;
        layer.open({
            title: '删除订单'
            , content: '确认要将此订单删除吗'
            , btn: ['确认', '取消']
            , yes: function (index, layero) {
                if (repeat === 0) {
                    repeat++;
                    $.ajax({
                        url: getApi('web/order_del'),
                        type: 'post',
                        data: {
                            user_id: getobjS('user').id,
                            token: getobjS('user').token,
                            order_id: id
                        },
                        dataType: 'jsonp',
                        success: function (res) {
                            if (res.code === 0) {
                                layer.close(index);
                                _msg({msg: res.msg});
                                getOrder();
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
            }
            , cancel: function () {
                repeat = 0;
            }
        });
    });
}

//--------------------------我的订单功能----------------------------
// 订单流HTML
function orderBoxHtml(data) {
    var html = '';
    for (var i = 0, len = data.length; i < len; i++) {
        // 检测当前订单状态
        var ordSta = orderStatus(data[i].status, data[i].comment, data[i].refund, data[i].order_id, data[i].order_no);
        // 检测当前订单可执行操作
        var had = '';
        for (var j = 0, len2 = ordSta.handle.length; j < len2; j++) {
            had += '<button onclick="' + ordSta.handle[j].fn + '">' + ordSta.handle[j].name + '</button>'
        }
        // 当前订单多个商品处理
        var good = '';
        for (var k = 0, len3 = data[i].order_goods.length; k < len3; k++) {
            good += '<div><a href="goods.html?id=' + data[i].order_goods[k].good_id + '">' +
                '<img src="' + data[i].order_goods[k].img + '" alt="good">' +
                '<h3>' + data[i].order_goods[k].good_name + '</h3>' +
                '<p><span style="float: left;">' + data[i].order_goods[k].spec_str + '</span>x' + data[i].order_goods[k].goods_nums + '</p></a></div>'
        }
        // 生成html
        html += '<table data-id="' + data[i].order_id + '" data-sid="' + data[i].shop_id + '"><tr><th colspan="5">';
        html += '<span>' + data[i].create_time + '</span><span>订单编号：' + data[i].order_no + '</span>';
        html += '<span>卖家：' + data[i].shop_name + '</span></th></tr><tr><td class="img_">' + good + '</td>';
        html += '<td class="name_">' + data[i].accept_name + '</td>';
        html += '<td class="money_"><h4>金额￥<em>' + data[i].order_amount + '</em></h4>';
        html += '<p>快递费：<em>' + data[i].real_freight + '</em></p></td>';
        html += '<td class="status_"><p><em>' + ordSta.explain + '</em></p>';
        html += '<p><a href="order-details.html?oid=' + data[i].order_id + '">订单详情</a></p></td>';
        html += '<td class="operate_">' + had + '</td></tr></table>'
    }
    return html
}

// 订单状态分析
// status: 0->待付款，1->待发货，2->待收货，3->已完成
// comment: 0->未评价,1->已评价
// refund: 0=正常订单 1=申请退款 2=申请被拒绝 3=退款成功
// oid: -> 订单id
function orderStatus(sta, com, ref, oid, no) {
    var status = {
        explain: '',
        handle: [],
        afterSale: ''
    };
    switch (sta) {
        case 0:
            status.explain = '待付款';
            status.handle = [
                {name: '取消订单', fn: 'cancellationOrder(' + oid + ')'},
                {name: '立即支付', fn: "toPay(" + oid + ",'" + no + "')"}
            ];
            break;
        case 1:
            status.explain = '待发货';
            if (ref === 0 || ref === 2) {
                status.handle = [
                    {name: '申请退款', fn: 'applyRefund(' + oid + ')'}
                ];
            } else if (ref === 1) {
                status.handle = [
                    {name: '退款申请中', fn: ''}
                ];
            } else if (ref === 3) {
                status.handle = [
                    {name: '退款成功', fn: ''}
                ];
            }

            break;
        case 2:
            status.explain = '待收货';
            status.handle = [
                {name: '确认收货', fn: 'confirmReceipt(' + oid + ')'}
            ];
            break;
        case 3:
            if (com === 0) {
                status.explain = '待评价';
                status.handle = [{name: '去评价', fn: 'toEvaluate(' + oid + ')'}];
            } else {
                status.explain = '已评价';
                status.handle = [{name: '删除', fn: 'delOrder(' + oid + ')'}];
            }
            break;
        case 4:
            status.explain = '已取消';
            status.handle = [{name: '删除', fn: 'delOrder(' + oid + ')'}];
            break;
        case 5:
            status.explain = '已作废';
            status.handle = [{name: '删除', fn: 'delOrder(' + oid + ')'}];
            break;
    }
    return status
}

// 选择时间段搜索订单
$('#or_date_search').change(function () {
    getOrder()
});

// 输入订单号搜索订单
$('#or_no_search').click(function () {
    getOrder()
});

// 当前订单类型位置
$('#or_sta li').eq(getSearch().s).addClass('or_act').siblings('li').removeClass('or_act');

// 激活分页插件
function layuiPage() {
    layui.use('laypage', function () {
        var laypage = layui.laypage;
        //执行一个laypage实例
        laypage.render({
            elem: 'page' //注意，这里的 page 是 ID，不用加 # 号
            , count: page.total //数据总数，从服务端得到
            , theme: '#1E9FFF'
            , limit: page.size
            , jump: function (obj, first) {
                if (!first) { // 首次不执行
                    // console.log(obj.curr); //得到当前页，以便向服务端请求对应页的数据。
                    // console.log(obj.limit); //得到每页显示的条数
                    page.index = obj.curr;
                    // 翻页调用数据请求
                    getOrder();
                    // 定位到顶部
                    $(document).scrollTop(0)
                }
            }
        });
    });
}

// 退回方式
function backStyle(val) {
    back = val;
    if (val === 1) {
        $('.ref_ali').css('display', '')
    } else {
        $('.ref_ali').css('display', 'none')
    }
}
