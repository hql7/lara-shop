var page = {
    cid: 0, // 分类id
    index: 1, // 索引页
    size: 10,
    total: 1 // 总页
}; // 数据信息

getClassify();
getCoupons();
//----------------------------领券中心 请求-----------------------------

// 请秋分类
function getClassify() {
    $.ajax({
        url: getApi('web/category'),
        type: 'post',
        data: {type: 1, num: ''},
        dataType: 'jsonp',
        success: function (res) {
            if (res.code === 0) {
                $('#_cp_option_box').html(classifyHtml(res.list));
            }
        }
    })
}

// 请求优惠券
function getCoupons() {
    $.ajax({
        url: getApi('web/coupon_center'),
        type: 'post',
        data: {
            user_id: getobjS('user') ? getobjS('user').id : '',
            token: getobjS('user') ? getobjS('user').token : '',
            index: page.index,
            cate_id: page.cid
        },
        dataType: 'jsonp',
        success: function (res) {
            loginOverdue(res.code);
            if (res.code === 0) {
                page.total = res.fy_count;
                page.size = res.fy_pgSize;
                if (res.fy_pgCur === 1) {
                    layuiPage();
                }
                $('#_cp_list').html(couponsHtml(res.list));
            } else {
                _msg({msg: res.msg})
            }
        }
    })
}

// 领取优惠券
function receiveCoupons(qid) {
    $.ajax({
        url: getApi('web/receive_coupon'),
        type: 'post',
        data: {
            user_id: getobjS('user') ? getobjS('user').id : '',
            token: getobjS('user') ? getobjS('user').token : '',
            temp_id: qid
        },
        dataType: 'jsonp',
        success: function (res) {
            loginOverdue(res.code);
            _msg({msg: res.msg});
            if (res.code === 0) {
                getCoupons()
            }
        },
        error: function (err) {
            _msg({msg: '请重试'})
        }
    })
}

//----------------------------领券中心 功能-----------------------------

// 选择分类html
function classifyHtml(data) {
    var html = '<li class="act" data-id="0">全部</li>';
    for (var i = 0, len = data.length; i < len; i++) {
        html += '<li data-id="' + data[i].id + '">' + data[i].phone_name + '</li>'
    }
    return html
}

// 选则分类
$('#_cp_option_box').on('click', 'li', function () {
    $(this).addClass('act').siblings('li').removeClass('act');
    page.cid = $(this).attr('data-id');
    getCoupons();
});

// 优惠券html
function couponsHtml(data) {
    var html = '';
    for (var i = 0, len = data.length; i < len; i++) {
        html += '<div><div class="_l_t"><div><sup>￥</sup><em id="_cp_ed">' + data[i].value + '</em></div>';
        html += '<div><h3>券</h3><p>满 <span id="_cp_med">' + data[i].money + '</span>元可用</p></div></div>';
        html += '<div class="_l_b"><h3 id="_cp_ms">' + data[i].description + '(' + data[i].condition + ')</h3>';
        html += '<p id="_cp_sj">' + data[i].start_time + '-' + data[i].end_time + ' ';
        html += '<strong class="u-right">剩余 <span id="_cp_sy">' + data[i].store_num + '</span>张</strong></p>';
        html += '</div>' + isReceive(data[i].store_num, data[i].is_receive, data[i].id) + '</div>';
    }
    return html
}

// 是否已有
function isReceive(num, val, id) {
    var btn = '';
    if (val === 0) {
        btn = num === 0 ? '<button class="nums-none" disabled>已抢完</button>' : '<button onclick="receiveCoupons(' + id + ')">立即领取</button>'
    } else {
        btn = '<i class="iconfont icon-yilingqu"></i><button onclick="useCoupons(' + id + ')">立即使用</button>'
    }
    return btn
}

// 使用优惠券
function useCoupons(id) {
    location.href = 'search.html?qid=' + id + '';
}

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
                    getCoupons();
                    // 定位到顶部
                    $(document).scrollTop(0)
                }
            }
        });
    });
}