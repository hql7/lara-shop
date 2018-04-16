var seaCri = {
    no: '' // 订单编号
    , time: '' // 申请时间段
    , status: '' // 服务单状态
    , type: 0 // 0-> 可售后订单搜索 1->服务单列表搜索
}; // 搜索条件

var page = {
    index1: 1 // 可申请列表当前页
    , size1: 10
    , total1: null // 可申请列表总数
    , index2: 1 // 申请记录列表当前页
    , size2: 10
    , total2: null // 申请记录列表总数
    , index3: 1 // 退款记录列表当前页
    , size3: 10
    , total3: null // 退款记录列表总数
}; // 分页

//-------------------------售后服务页 请求--------------------------

// 可申请售后列表
function mayApplyAfterSale() {
    $.ajax({
        url: getApi('web/after_goods'),
        type: 'post',
        data: {
            user_id: getobjS('user').id,
            token: getobjS('user').token,
            order_no: $('#as_or_id').val(),
            index: page.index1
        },
        dataType: 'jsonp',
        success: function (res) {
            loginOverdue(res.code);
            if (res.code === 0) {
                page.total1 = res.fy_count;
                page.size1 = res.fy_pgSize;
                if (res.fy_pgCur === 1) {
                    layuiPage(1)
                }
                $('#_as_may_apply').html(mayApplyAfterSaleHtml(res.list))
            } else {
                _msg({msg: res.msg})
            }
        }
    })
}

// 退换货记录列表
function afterSalesRecord() {
    $.ajax({
        url: getApi('web/after_list'),
        type: 'post',
        data: {
            user_id: getobjS('user').id,
            token: getobjS('user').token,
            order_no: $('#as_or_id').val(),
            apply_time: $('#apply_time').val(),
            status: $('#aft_sal_sta').val(),
            index: page.index2
        },
        dataType: 'jsonp',
        success: function (res) {
            loginOverdue(res.code);
            if (res.code === 0) {
                if (res.fy_pgCur === 1) {
                    layuiPage(2)
                }
                page.total2 = res.fy_count
                page.size2 = res.fy_pgSize
                $('#_as_apply_log').html(afterSaleLogHtml(res.list))
            } else {
                _msg({msg: res.msg})
            }
        }
    })
}

// 退款记录列表
function afterSalesRefund() {
    $.ajax({
        url: getApi('web/refund_list'),
        type: 'post',
        data: {
            user_id: getobjS('user').id,
            token: getobjS('user').token,
            order_no: $('#as_or_id').val(),
            apply_time: $('#apply_refund_time').val(),
            status: $('#aft_ref_sta').val(),
            index: page.index3
        },
        dataType: 'jsonp',
        success: function (res) {
            loginOverdue(res.code);
            if (res.code === 0) {
                if (res.fy_pgCur === 1) {
                    layuiPage(3)
                }
                page.total3 = res.fy_count
                page.size3 = res.fy_pgSize
                $('#_as_apply_refund').html(afterSaleRefundHtml(res.list))
            } else {
                _msg({msg: res.msg})
            }
        }
    })
}

// 查看商品内已售后列表
function seeOrderAS(id) {
    // 激活弹出
    layui.use('layer', function () {
        var layer = layui.layer
        layer.open({
            type: 1,
            title: '选择商品内服务单',
            area: ['900px', '400px'],
            content: $('#pop_see_as_good')
        })
    })
    var data = {
        user_id: getobjS('user').id,
        token: getobjS('user').token,
        og_id: id
    }
    $.ajax({
        url: getApi('web/after_og_list'),
        type: 'post',
        data: data,
        dataType: 'jsonp',
        success: function (res) {
            if (res.code === 0) {
                // 填充视图
                $('#p_s_a_g_L').html(afterSaleLogHtml(res.list))
            } else {
                layer.msg(res.msg)
            }
        },
        error: function (err) {
            layer.msg('请重试')
        }
    })
}

//-------------------------售后服务页 功能--------------------------

// 售后服务页选项卡
$('#_as_mt li').click(function () {

    // 样式
    $(this).addClass('as_act').siblings('li').removeClass('as_act')
    // 视图
    $('#_as_list>div').eq($(this).index())
        .show()
        .siblings('div')
        .hide()
    // 请求不同数据
    if ($(this).index() === 0) {
        seaCri.type = 0
        mayApplyAfterSale()
    } else if ($(this).index() === 1) {
        seaCri.type = 1
        afterSalesRecord()
    } else {
        seaCri.type = 2
        afterSalesRefund()
    }
}).eq(0).click()

// 可售后列表html
function mayApplyAfterSaleHtml(data) {
    var html = ''
    for (var i = 0, len = data.length; i < len; i++) {
        var good = ''
        for (var j = 0, len2 = data[i].order_goods.length; j < len2; j++) {
            var apply = '', look = ''
            apply = data[i].order_goods[j].can_apply === 0 ? '<button onclick="applyOrderAS(' + data[i].order_goods[j].og_id + ')">申请</button>' : ''
            look = data[i].order_goods[j].status === 1 ? '<button onclick="seeOrderAS(' + data[i].order_goods[j].og_id + ')">查看</button>' : ''
            good += '<div><img src="' + data[i].order_goods[j].good_img + '" alt="good">' + apply + '' + look + '</div>'
        }
        html += '<tr><td><a href="order-details.html?oid=' + data[i].order_id + '">' + data[i].order_no + '</a></td>' +
            '<td class="_b_go">' + good + '</td>' +
            '<td>' + data[i].create_time + '</td></tr>'
    }
    return html
}

// 售后退换货记录表html
function afterSaleLogHtml(data) {
    var html = ''
    for (var i = 0, len = data.length; i < len; i++) {
        html += '<tr><td><a href="after-sale-details.html?rid=' + data[i].return_id + '">' + data[i].return_no + '</a></td>' +
            '<td><a href="order-details.html?oid=' + data[i].order_id + '" >' + data[i].order_no + '</a></td>' +
            '<td><a href="goods.html?id=' + data[i].good_id + '">' + data[i].good_name + '</a></td>' +
            '<td>' + data[i].apply_time + '</td>' +
            '<td>' + serviceOrderType(data[i].after_type) + '</td>' +
            '<td>' + serviceOrderSatus(data[i].status) + '</td>' +
            '<td><button onclick="seeASdetial(' + data[i].return_id + ')">查看</button></td></tr>'
    }
    return html
}

// 售后退款记录表html
function afterSaleRefundHtml(data) {
    var html = ''
    for (var i = 0, len = data.length; i < len; i++) {
        html += '<tr><td><a href="order-details.html?oid=' + data[i].order_id + '" >' + data[i].order_no + '</a></td>' +
            '<td>' + data[i].amount + '</td>' +
            '<td>' + data[i].channel + '</td>' +
            '<td>' + data[i].apply_time + '</td>' +
            '<td>' + refundStatus(data[i].status) + '</td>' +
            '<td>' + data[i].handling_idea + '</td>' +
            '<td>' + data[i].handling_time + '</td></tr>'
    }
    return html
}

// 服务单状态
function serviceOrderSatus(sta) {
    var STATUS = ''
    switch (sta) {
        case 0:
            STATUS = '待审核'
            break
        case 1:
            STATUS = '审核通过'
            break
        case 2:
            STATUS = '审核失败'
            break
        case 3:
            STATUS = '已发货'
            break
        case 4:
            STATUS = '已完成'
            break
        case 5:
            STATUS = '已取消'
            break
        case 6:
            STATUS = '已收货'
            break
        case 7:
            STATUS = '已拒签'
            break
    }
    return STATUS
}

// 服务单类型
function serviceOrderType(sta) {
    var STATUS = ''
    switch (sta) {
        case 0:
            STATUS = '退货退款'
            break
        case 1:
            STATUS = '换货'
            break
        case 2:
            STATUS = '维修'
            break
    }
    return STATUS
}

// 退款单状态
function refundStatus(sta) {
    var STATUS = ''
    switch (sta) {
        case 0:
            STATUS = '待审核'
            break
        case 1:
            STATUS = '审核失败'
            break
        case 2:
            STATUS = '退款成功'
            break
    }
    return STATUS
}

// 不同条件搜索
function afterSaleSearch() {
    if (seaCri.type === 0) {
        mayApplyAfterSale()
    } else if (seaCri.type === 1) {
        afterSalesRecord()
    } else {
        afterSalesRefund()
    }
}

// 激活分页插件
function layuiPage(val) {
    layui.use('laypage', function () {
        var laypage = layui.laypage
        //执行一个laypage实例
        if (val === 1) {
            laypage.render({
                elem: 'page1' //注意，这里的 page 是 ID，不用加 # 号
                , limit: page.size1
                , count: page.total1 //数据总数，从服务端得到
                , theme: '#1E9FFF'
                , jump: function (obj, first) {
                    if (!first) { // 首次不执行
                        // console.log(obj.curr); //得到当前页，以便向服务端请求对应页的数据。
                        // console.log(obj.limit); //得到每页显示的条数
                        page.index1 = obj.curr
                        // 翻页调用数据请求
                        mayApplyAfterSale()
                    }
                }
            })
        } else if (val === 2) {
            laypage.render({
                elem: 'page2' //注意，这里的 page 是 ID，不用加 # 号
                , count: page.total2 //数据总数，从服务端得到
                , limit: page.size2
                , theme: '#1E9FFF'
                , jump: function (obj, first) {
                    if (!first) { // 首次不执行
                        // console.log(obj.curr); //得到当前页，以便向服务端请求对应页的数据。
                        // console.log(obj.limit); //得到每页显示的条数
                        page.index2 = obj.curr
                        // 翻页调用数据请求
                        afterSalesRecord()
                    }
                }
            })
        } else {
            laypage.render({
                elem: 'page3' //注意，这里的 page 是 ID，不用加 # 号
                , count: page.total3 //数据总数，从服务端得到
                , limit: page.size3
                , theme: '#1E9FFF'
                , jump: function (obj, first) {
                    if (!first) { // 首次不执行
                        // console.log(obj.curr); //得到当前页，以便向服务端请求对应页的数据。
                        // console.log(obj.limit); //得到每页显示的条数
                        page.index3 = obj.curr
                        // 翻页调用数据请求
                        afterSalesRefund()
                    }
                }
            })
        }
    })
}

// 查看售后单详情
function seeASdetial(id) {
    location.href = 'after-sale-details.html?rid=' + id + ''
}

// 申请售后
function applyOrderAS(id) {
    location.href = 'after-sale-apply.html?gid=' + id + ''
}

//商城logo
function systemLogo() {
    if (getobjS('website')) {
        $('.site-logo').html('<a href="index.html"><img src="' + getobjS('website').logo + '"alt="LOGO"><span>' + getobjS('website').name + '</span></a>');
    }
}
