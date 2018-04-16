var page = {
    index: 1,
    size: 10,
    total: 1
};
var stType = {
    c_t: 0, // 收藏类型  0=商品收藏  店铺收藏先不做
    g_t: 0 // 商品类型  0=全部商品  1=活动商品
}; // 不同收藏选择

//------------------------我的收藏页 请求------------------------

// 获取收藏列表
function getMyStore() {
    $.ajax({
        url: getApi('web/my_attention'),
        type: 'post',
        data: {
            index: page.index,
            user_id: getobjS('user').id,
            token: getobjS('user').token,
            collect_type: stType.c_t,
            good_type: stType.g_t,
            good_name: $('#good_name').val()
        },
        dataType: 'jsonp',
        success: function (res) {
            loginOverdue(res.code);
            if (res.code === 0) {
                page.total = res.fy_count;
                page.size = res.fy_pgSize;
                if (res.list.length > 0) {
                    $('#_st_good').css('display', '').siblings('#_st_none').css('display', '');
                    $('#_st_good').html(storeListHtml(res.list));
                    if (res.fy_pgCur === 1) {
                        layuiPage()
                    }
                } else {
                    $('#_st_good').css('display', 'none').siblings('._st_none').css('display', 'block');
                    $('#_st_good').html('');
                }
            } else {
                _msg({msg: res.msg})
            }
        }
    })
}

// 加入购物车
function storeAddCart(id) {
    $.ajax({
        url: getApi('web/add_cart'),
        type: 'post',
        data: {
            user_id: getobjS('user').id,
            token: getobjS('user').token,
            product_id: id,
            num: 1
        }
    })
}

// 取消收藏
function cancelCollection(id, product_id) {
    $.ajax({
        url: getApi('web/del_attention'),
        type: 'post',
        data: {
            user_id: getobjS('user').id,
            token: getobjS('user').token,
            good_id: id,
            product_id: product_id
        },
        dataType: 'jsonp',
        success: function (res) {
            loginOverdue(res.code);
            if (res.code === 0) {
                _msg({msg: res.msg});
                // 请求新数据
                getMyStore();
            } else {
                _msg({msg: res.msg});
            }
        },
        error: function (err) {
            _msg({msg: '请重试'});
        }
    })
}

//------------------------我的收藏页 功能------------------------

// 定位当前收藏类型
$('#_st_chose li').click(function () {
    stType.c_t = $(this).index();
    $(this).addClass('g_or_s').siblings('li').removeClass('g_or_s');
    getMyStore()
}).eq(0).click();

$('#_st_btn span').click(function () {
    stType.g_t = $(this).index();
    $(this).addClass('act_btn').siblings('span').removeClass('act_btn');
    getMyStore()
});

// 收藏列表html
function storeListHtml(data) {
    var html = '';
    for (var i = 0, len = data.length; i < len; i++) {
        html += '<div><a href="goods.html?id=' + data[i].id + '">' +
            '<img src="' + data[i].img + '" alt="good">' +
            '<h3>' + data[i].name + '</h3></a>' +
            '<p>￥<em>' + data[i].real_price + '</em></p>' +
            // '<button onclick="storeAddCart(data[i].id)"><i class="iconfont icon-tianjiagouwuche"></i>加入购物车</button>' +
            '<b onclick="cancelCollection(' + data[i].id + ',' + data[i].product_id + ')">取消关注</b></div>'
    }
    return html
}

// 激活分页插件
function layuiPage() {
    layui.use('laypage', function () {
        var laypage = layui.laypage;
        //执行一个laypage实例
        laypage.render({
            elem: 'page' //注意，这里的 page 是 ID，不用加 # 号
            , count: page.total //数据总数，从服务端得到
            , limit: page.size // 单页条数
            , theme: '#1E9FFF'
            , jump: function (obj, first) {

                if (!first) { // 首次不执行
                    // console.log(obj.curr); //得到当前页，以便向服务端请求对应页的数据。
                    // console.log(obj.limit); //得到每页显示的条
                    // 翻页调用数据请求
                    page.index = obj.curr;
                    getMyStore()
                }
            }
        });
    });
}
