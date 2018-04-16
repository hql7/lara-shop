if (getobjS('user')) {
    getUser()
} else {
    location.href = 'login.html'
}

var order = {
    id: null,
    no: ''
}; // 订单信息
var back = 0; // 退款方式  0=账户余额 1=支付宝
var repeat = 0; // 防抖

//-------------------------个人中心 请求---------------------------

// 个人中心请求
function getUser() {
    $.ajax({
        url: getApi('web/user_center'),
        type: 'post',
        data: {
            user_id: getobjS('user').id,
            token: getobjS('user').token
        },
        dataType: 'jsonp',
        success: function (res) {
            loginOverdue(res.code);
            if (res.code === 0) {
                order.id = res.info.order.order_id;
                order.no = res.info.order.order_no;
                // 用户中心 上部
                // 头像区
                if (res.info.head_pic) {
                    $('._u_c_top ._t-h-box img').attr('src', res.info.head_pic);
                }
                $('._u_c_top ._t-header h3').html(res.info.username);
                $('._u_c_top ._t-header h4').html(res.info.vip);
                $('._u_c_top ._t-header span').html(safeLv(res.info.safe));
                // 订单区
                $('._o_s0-data').html(res.info.unpaid_num);
                $('._o_s1-data').html(res.info.delivery_num);
                $('._o_s2-data').html(res.info.review_num);
                // 资产区
                $('._u_c_top ._t-assets span').html(res.info.balance);
                $('._u_c_top ._t-assets em').html(res.info.point);
                // 优惠券区
                $('._u_c_top ._t-cou-num').html(res.info.voucher_num);
                // 用户中心 中部 订单区
                if (res.info.order.length !== 0) {
                    $('._u-o-time').html(res.info.order.create_time);
                    $('._u-o-no em').html(res.info.order.order_no);
                    $('._u-o-seller em').html(res.info.order.shop_name);
                    $('.name_').html(res.info.order.accept_name);
                    $('.money_ h4 em').html(res.info.order.order_amount);
                    $('.money_ p em').html(res.info.order.real_freight);
                    // 检测当前订单状态
                    var odrSta = orderStatus(res.info.order.status, res.info.order.comment, res.info.order.refund);
                    $('.status_ em ').html(odrSta.explain);
                    // 检测当前订单可执行操作
                    var had = '';
                    for (var n = 0, len4 = odrSta.handle.length; n < len4; n++) {
                        had += '<button onclick="' + odrSta.handle[n].fn + '">' + odrSta.handle[n].name + '</button>'
                    }
                    $('.operate_').html(had);
                    var str = '', goods = res.info.order.order_goods;
                    for (var i = 0, len = goods.length; i < len; i++) {
                        str += '<div><a href="goods.html?id=' + goods[i].id + '">' +
                            '<img src="' + goods[i].img + '" alt="goods">' +
                            '<h3>' + goods[i].name + '</h3><p><span style="float: left;">' + goods[i].spec_str + '</span>x' + goods[i].goods_nums + '</p></a></div>'
                    }
                    $('.img_').html(str);
                } else {
                    $('._u-order-box').html('暂无相关订单')
                }

                // 用户中心 下部
                // 我的收藏区
                var str_s = '';
                for (var j = 0, len1 = res.info.attention.length; j < len1; j++) {
                    str_s += '<div><a href="goods.html?id=' + res.info.attention[j].id + '">' +
                        '<img src="' + res.info.attention[j].img + '" alt="good"><p>￥' + res.info.attention[j].sell_price + '</p></a></div>'
                }
                $('.s_c_box').html(str_s);
                // 我的优惠券
                var str_q = '';
                for (var k = 0, len2 = res.info.vouchers.length; k < len2; k++) {
                    str_q += '<div><img src="../imgs/_y_h_q.png" alt="q_b_j"><div><h4>￥<em>' + res.info.vouchers[k].value + '</em>券</h4>' +
                        '<h5>满' + res.info.vouchers[k].money + '可用</h5><p>' + res.info.vouchers[k].start_time + '-' + res.info.vouchers[k].end_time + '</p>' +
                        '<p>' + res.info.vouchers[k].condition;
                    if (res.info.vouchers[k].status == 0) {
                        str_q += '</p><h6><a href="search.html?qid=' + res.info.vouchers[k].id + '">立即使用</a></h6></div></div>';
                    } else if (res.info.vouchers[k].status == 1) {
                        str_q += '</p><h6><a href="###">已使用</a></h6></div></div>';
                    } else if (res.info.vouchers[k].status == 2) {
                        str_q += '</p><h6><a href="###">已过期</a></h6></div></div>';
                    }
                }
                $('.y_h_q_box').html(str_q);

                // 底部 调用猜你喜欢
                userYouLick();
            } else {
                _msg({msg: res.msg})
            }
        }
    })
}

// 猜你喜欢
function userYouLick() {
    // 猜你喜欢
    $.ajax({
        url: getApi('web/guess_you_like'),
        type: 'post',
        data: {
            type: 0,
            num: 20,
            id: getobjS('user') ? getobjS('user').id : '',
            token: getobjS('user') ? getobjS('user').token : ''
        },
        dataType: 'jsonp',
        success: function (res) {
            if (res.code === 0) {
                res.list = res.list || [];
                var str = '';
                for (var i = 0, len = res.list.length; i < len; i++) {
                    str += '<div><a href="goods.html?id=' + res.list[i].id + '"><img src="' + res.list[i].img + '" alt="good">' +
                        '<h3>' + res.list[i].name + '</h3>' +
                        '<p><i class="c-red">￥' + res.list[i].sell_price + '</i><span class="u-right">评价' + res.list[i].reviews_num + '</span></p></a></div>'
                }
                $('#u-more-box').html(str)
            }
        },
        error: function (err) {
        }
    });
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
                            loginOverdue(res.code);
                            if (res.code === 0) {
                                _msg({msg: res.msg});
                                layer.close(index);
                                getUser();
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
/*function applyRefund() {
    layui.use('layer', function () {
        var layer = layui.layer;
        layer.open({
            title: '申请退款'
            , content: '未发货状态可以申请退款，确认申请？'
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
                            order_id: order.id
                        },
                        dataType: 'jsonp',
                        success: function (res) {
                            loginOverdue(res.code);
                            if (res.code === 0) {
                                _msg({msg: res.msg});
                                getUser();
                                layer.close(index)
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
}*/
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
                var payee_account = $('#payee_account');
                var payee_real_name = $('#payee_real_name');
                var _back_yy = $('#_back_yy');

                if (back === 1) {   //支付宝
                    if (payee_account.val() === '') {
                        payee_account.focus();
                        return false
                    }
                    if (payee_real_name.val() === '') {
                        payee_real_name.focus();
                        return false
                    }
                }
                if (_back_yy.val() === '') {
                    _back_yy.focus();
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
                            order_id: order.id,
                            type: back,
                            reason: _back_yy.val(),
                            payee_account: payee_account.val(),
                            payee_real_name: payee_real_name.val()
                        },
                        dataType: 'jsonp',
                        success: function (res) {
                            repeat = 0;
                            _msg({msg: res.msg});
                            if (res.code === 0) {
                                layer.close(index);
                                getUser();
                            }
                        },
                        error: function (err) {
                            repeat = 0;
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
                            loginOverdue(res.code);
                            if (res.code === 0) {
                                _msg({msg: res.msg});
                                getUser();
                                layer.close(index)
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
                            loginOverdue(res.code);
                            if (res.code === 0) {
                                _msg({msg: res.msg});
                                getUser();
                                layer.close(index)
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

//-------------------------个人中心 功能---------------------------

/**
 * 订单状态分析
 * @param sta status: 0->待付款，1->待发货，2->待收货，3->已完成
 * @param com comment: 0->未评价,1->已评价
 * @param ref refund: 0=正常订单 1=申请退款 2=申请被拒绝 3=退款成功
 * @returns {{explain: string, handle: Array, afterSale: string}}
 */
function orderStatus(sta, com, ref) {
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

// --------------------------账户安全 功能------------------------

// 安全级别
function safeLv(lv) {
    var html = '';
    switch (lv) {
        case 1:
            html = '较弱';
            break;
        case 2:
            html = '一般';
            break;
        case 3:
            html = '较高';
            break;
        case 4:
            html = '极高';
            break;
    }
    return html
}

// 个人中心首页订单详情跳转
function userOrderDetail() {
    location.href = 'order-details.html?oid=' + order.id + ''
}

// 退回方式
function backStyle(val) {
    back = val;
    if (val === 1) {
        $('.ref_ali').css('display', 'block')
    } else {
        $('.ref_ali').css('display', 'none')
    }
}