var page = {
    index: 1,
    size: 10,
    total: 1
};

var category = 0;

getClassify(); // 请求分类选项（一级）

//----------------------------我的足迹 请求------------------------------

// 搜索分类请求
function getClassify() {
    $.ajax({
        url: getApi('web/category'),
        type: 'post',
        data: {
            type: 0,
            num: ''
        },
        dataType: 'jsonp',
        success: function (res) {
            if (res.code === 0) {
                $('#_foo_fl').html('<span data-id="0">全部</span>' + classifyHtml(res.list));
                // 按分类搜索操作
                $('#_foo_fl span').click(function () {
                    category = $(this).attr('data-id');
                    getFootprint();
                    $(this).addClass('fl_act').siblings('span').removeClass('fl_act');
                }).eq(0).click()
            }
        }
    })
}

// 足迹列表请求
function getFootprint() {
    $.ajax({
        url: getApi('web/visit_list'),
        type: 'post',
        data: {
            index: page.index,
            user_id: getobjS('user').id,
            token: getobjS('user').token,
            category: category
        },
        dataType: 'jsonp',
        success: function (res) {
            loginOverdue(res.code);
            if (res.code === 0) {
                res.list = res.list || [];
                page.total = res.fy_count;
                page.size = res.fy_pgSize;
                if (res.list.length > 0) {
                    $('#_fp_list').css('display', '').next('._fp_none').css('display', '');
                    $('#_fp_box').html(footprintHtml(res.list));
                    if (res.fy_pgCur === 1) {
                        layuiPage()
                    }
                } else {
                    $('#_fp_list').css('display', 'none').next('._fp_none').css('display', 'block');
                }
            } else {
                _msg({meg: res.msg})
            }
        }
    })
}

//----------------------------我的足迹 功能------------------------------

// 一级分类 搜索 html
function classifyHtml(data) {
    var html = '';
    for (var i = 0, len = data.length; i < len; i++) {
        html += '<span data-id="' + data[i].id + '">' + data[i].phone_name + '</span>';
    }
    return html
}

// 浏览历史列表html
function footprintHtml(data) {
    var html = '';
    for (var i = 0, len = data.length; i < len; i++) {
        html += '<div><a href="goods.html?id=' + data[i].id + '">' +
            '<img src="' + data[i].img + '" alt="goods">' +
            '<h3>' + data[i].name + '</h3></a>' +
            '<p>￥' + data[i].real_price + '</p>' +
            '<b onclick ="cancleFootprint(' + data[i].id + ')">删除足迹</b></div>'
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
                page.index = obj.curr;
                if (!first) { // 首次不执行
                    // console.log(obj.curr); //得到当前页，以便向服务端请求对应页的数据。
                    // console.log(obj.limit); //得到每页显示的条数

                    // 翻页调用数据请求
                    getFootprint()
                }
            }
        });
    });
}

// 删除足迹
function cancleFootprint(id) {
    $.ajax({
        url: getApi('web/del_visit'),
        type: 'post',
        data: {
            user_id: getobjS('user').id,
            token: getobjS('user').token,
            good_id: id
        },
        dataType: "jsonp",
        success: function (res) {
            loginOverdue(res.code);
            _msg({msg: res.msg});
            if (res.code === 0) {
                getFootprint();
            }
        },
        error: function (err) {
            _msg({msg: ''});
        }
    })
}
