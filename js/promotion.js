var page = {
    cid: 0, // 分类id
    index: 1, // 索引页
    size: 10,
    total: 1 // 总页
}; // 数据信息

getClassify();
getBuyList();
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

// 请求促销列表
function getBuyList() {
    $.ajax({
        url: getApi('web/prom_goods'),
        type: 'post',
        data: {
            index: page.index,
            category_id: page.cid
        },
        dataType: 'jsonp',
        success: function (res) {
            loginOverdue(res.code);
            if (res.code === 0) {
                if (res.list.length > 0) {
                    page.total = res.fy_count;
                    page.size = res.fy_pgSize;
                    if (res.fy_pgCur === 1) {
                        layuiPage();
                    }
                    $('#_gf_box').html(groupFlashHtml(res.list));
                } else {
                    $('#_gf_box').html('<p class="no_box">暂无相关商品</p>')
                }
            }
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
    getBuyList();
});

// 团购或抢购列表html
function groupFlashHtml(data) {
    var html = '';
    for (var i = 0, len = data.length; i < len; i++) {
        html += '<div><div class="_l"><a href="goods.html?id=' + data[i].id + '"><img src="' + data[i].img + '" alt="good" height="140px" width="140px"><a/></div>' +
            '<div class="_r"><h3><a href="goods.html?id=' + data[i].id + '">' + data[i].title + '</a></h3>' +
            '<p><em>￥' + data[i].sale_price + '</em><s>￥' + data[i].sell_price + '</s></p>' +
            '<h4>已购：' + data[i].sell_num + '<span class="u-right">剩余：' + data[i].store_nums + '</span></h4>' +
            '<button  class="_buy" onclick="toPanicBuy(' + data[i].id + ')">立即抢购</button></div></div>'
    }
    return html
}

// 立即抢购
function toPanicBuy(id) {
    location.href = 'goods.html?id=' + id + '';
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
                    getBuyList();
                    // 定位到顶部
                    $(document).scrollTop(0)
                }
            }
        });
    });
}