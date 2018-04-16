var order = {
    id: null,
    no: '',
    back: 0 // 退款方式  0=账户余额 1=按支付方式原路返回
}; // 订单信息
var repeat = 0; //防抖

getOrderDetails();

//-------------------------订单详情页 请求---------------------------

// 订单详情
function getOrderDetails() {
    $.ajax({
        url: getApi('web/order_detail'),
        type: 'post',
        data: {
            user_id: getobjS('user').id,
            token: getobjS('user').token,
            order_id: getSearch().oid
        },
        dataType: 'jsonp',
        success: function (res) {
            loginOverdue(res.code);
            if (res.code === 0) {
                order.id = res.order_info.order_id;
                order.no = res.order_info.order_no;
                // 上部订单信息
                $('#_or_no').html(res.order_info.order_no);
                // 检测订单状态
                var sta = orderStatus(res.order_info.status, res.order_info.refund, res.order_info.comment);
                $('#_or_status').html(sta.explain);
                // 检测当前订单可执行操作
                var had = '';
                for (var j = 0, len2 = sta.handle.length; j < len2; j++) {
                    had += '<a onclick="' + sta.handle[j].fn + '">' + sta.handle[j].name + '</a>'
                }
                $('#or_handle,#or_had').html(had);
                // 订单物流信息
                $('#or_adr').html(res.order_info.accept_addr);
                $('#or_msg').html(res.order_info.user_remark);
                $('#or_shop').html(res.order_info.shop_name);
                $('#or_expr').html(res.order_info.express_info.com);
                $('#or_exp_no').html(res.order_info.express_info.nu);
                // 物流时间线
                $('#wl_timeline').html(timeLineHtml(res.order_info.express_info.data));
                // 订单商品信息
                $('#_de_good_box').html(orderGoodsHtml(res.order_info.order_goods));
                // 订单付款信息
                $('#goods_price').html(res.order_info.goods_price);
                $('#real_freight').html(res.order_info.real_freight);
                $('#voucher_value').html(res.order_info.voucher_value);
                $('#point').html(res.order_info.point);
                $('#send_point').html(res.order_info.send_point);
                $('#taxes').html(res.order_info.taxes);
                $('#discount_amount').html(res.order_info.discount_amount);
                $('#order_amount').html(res.order_info.order_amount);
            } else {
                _msg({msg: res.msg})
            }
        }
    })
}

// 取消订单
function cancellationOrder() {
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
                            order_id: order.id
                        },
                        dataType: 'jsonp',
                        success: function (res) {
                            if (res.code === 0) {
                                layer.close(index);
                                _msg({msg: res.msg});
                                getOrderDetails();
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
function toPay() {
    location.href = 'pay.html?oid=' + order.id + '&no=' + order.no + ''
}

// 申请退款
function applyRefund() {
    layui.use('layer', function () {
        var layer = layui.layer;
        layer.open({
            type: 1
            , title: '申请退款'
            , content: $('#pop_back')
            , area: '500px'
            , btn: ['确认', '取消']
            , yes: function (index, layero) {
                if (repeat === 0) {
                    repeat++;
                    $.ajax({
                        url: getApi('web/order_refund'),
                        type: 'post',
                        data: {
                            user_id: getobjS('user').id,
                            token: getobjS('user').token,
                            order_id: order.id,
                            type: order.back,
                            reason: $('#_back_yy').val()
                        },
                        dataType: 'jsonp',
                        success: function (res) {
                            if (res.code === 0) {
                                layer.close(index);
                                _msg({msg: res.msg});
                                getOrderDetails();
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
function confirmReceipt() {
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
                            order_id: order.id
                        },
                        dataType: 'jsonp',
                        success: function (res) {
                            if (res.code === 0) {
                                layer.close(index);
                                _msg({msg: res.msg});
                                getOrderDetails();
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
function toEvaluate() {
    location.href = 'evaluate.html?oid=' + order.id + '';
}

// 删除订单
function delOrder() {
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
                            order_id: order.id
                        },
                        dataType: 'jsonp',
                        success: function (res) {
                            if (res.code === 0) {
                                layer.close(index);
                                _msg({msg: res.msg});
                                setInterval(function () {
                                    location.href = 'my-order.html?s=0'
                                }, 2000)
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


//-------------------------订单详情页 功能---------------------------

// 订单状态分析
// return: 0->正常单，1->申请退款，2->申请退货，3->申请换货维修，4->售后已完成，5->售后申请被拒绝(废弃)
// status: 0->待付款，1->待发货，2->待收货，3->已完成
// comment: 0->未评价,1->已评价
function orderStatus(sta, ref, com) {
    var status = {
        explain: '',
        handle: [],
        afterSale: ''
    };
    switch (sta) {
        case 0:
            status.explain = '待付款';
            status.handle = [
                {name: '取消订单', fn: 'cancellationOrder()'},
                {name: '立即支付', fn: 'toPay()'}
            ];
            break;
        case 1:
            status.explain = '待发货';
            if (ref === 0 || ref === 2) {
                status.handle = [
                    {name: '申请退款', fn: 'applyRefund()'}
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
                {name: '确认收货', fn: 'confirmReceipt()'}
            ];
            break;
        case 3:
            if (com === 0) {
                status.explain = '待评价';
                status.handle = [{name: '去评价', fn: 'toEvaluate()'}];
            } else {
                status.explain = '已评价';
                status.handle = [{name: '删除', fn: 'delOrder()'}];
            }
            break;
        case 4:
            status.explain = '已取消';
            status.handle = [{name: '删除', fn: 'delOrder()'}];
            break;
        case 5:
            status.explain = '已作废';
            status.handle = [{name: '删除', fn: 'delOrder()'}];
            break;
    }
    return status
}

// 时间线html
function timeLineHtml(data) {
    var html = '';
    for (var i = 0, len = data.length; i < len; i++) {
        html += '<li class="layui-timeline-item"> <i class="layui-icon layui-timeline-axis">&#xe63f;</i>' +
            '<div class="layui-timeline-content layui-text"><h3 class="layui-timeline-title">' + data[i].time + '</h3>' +
            '<p>' + (data[i].location === null ? '' : data[i].location) + '</p><p>' + data[i].context + '</p></div></li>'
    }
    return html;
}

// 订单商品html
function orderGoodsHtml(data) {
    var html = '';
    for (var i = 0, len = data.length; i < len; i++) {
        html += '<tr><td class="_good">' +
            '<a href="goods.html?id=' + data[i].good_id + '&pid=' + data[i].product_id + '" >' +
            '<div class="_img"><img src="' + data[i].img + '" alt="good"></div>' +
            '<div class="_title"><h3>' + data[i].good_name + '</h3></div></a></td>' +
            '<td>' + data[i].spec_str + '</td>' +
            '<td>￥' + data[i].good_price + '</td>' +
            '<td>x' + data[i].goods_nums + '</td>' +
            '<td>' + (data[i].status === 1 ? "售后详情" : "") + '</td></tr>'
    }
    return html
}

// 退回方式
function backStyle(val) {
    order.back = val;
}