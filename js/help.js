getHelpMenu(getSearch().aid);

// 处理一些进入页面就发起的操作
(function () {
    // 区分文章中心类型
    if (getSearch().h) {
        getSearch().h == 0 ? $('#ait_type').text('公告中心') : $('#ait_type').text('帮助中心')
    }

    // 如果是点击具体公告进来的直接聚焦
    if (getSearch().aid) {
        getHelpCon(getSearch().aid);
    }

}());

//商城LOGO
systemLogo();

//---------------------------帮助中心 请求--------------------------

// 帮助中心菜单请求
function getHelpMenu(id) {
    $.ajax({
        url: getApi('web/article_center'),
        type: 'post',
        data: {
            type: getSearch().h ? getSearch().h : 1
        },
        dataType: 'jsonp',
        success: function (res) {
            if (res.code === 0) {
                $('#_h_nav_box').html(helpMenuHtml(res.list, id));
                // 进入页面寻找展开的菜单
                $('#_h_nav_box').find('.act').parent('ul').slideToggle("fast")
            }
        }
    })
}

// 文章中心内容请求
function getHelpCon(id, th) {
    titleAct(th);
    $.ajax({
        url: getApi('web/article_detail'),
        type: 'post',
        data: {article_id: id},
        dataType: 'jsonp',
        success: function (res) {
            if (res.code === 0) {
                var sql_plus_trouble = res.content.replace(/[\s]/g, '+');
                $('#_help_con').html(utf8to16(base64decode(sql_plus_trouble)));
            } else {
                _msg({msg: res.msg})
            }
        },
        error: function (err) {
            _msg({msg: '请重试'})
        }
    })
}

//---------------------------帮助中心 功能--------------------------

// 帮助列表菜单html
function helpMenuHtml(data, id) {
    var html = '';
    for (var i = 0, len = data.length; i < len; i++) {
        var list = '';
        for (var j = 0, len2 = data[i].articles.length; j < len2; j++) {
            list += '<li class="' + (id == data[i].articles[j].id ? "act" : "") + '" onclick="getHelpCon(' + data[i].articles[j].id + ',this)">' + data[i].articles[j].title + '</li>'
        }
        html += '<h3 onclick="opdon(this)">' + data[i].category_name + ' <i class="iconfont icon-xiala u-right"></i></h3><ul>' + list + '</ul>'
    }
    return html
}

// 菜单展开关闭
function opdon(th) {
    $(th).next('ul').slideToggle("fast")
}

// 菜单选中效果
function titleAct(th) {
    $(th).addClass('act').siblings('li').removeClass('act').parent('ul').siblings('ul').children('li').removeClass('act')
}

// 帮助页搜索
function cartSearch() {
    // 这里可以做默认关键词操作提高指定商品曝光率
    var k = $('#k').val() || '电脑';
    location.href = 'search.html?k=' + k + ''
}

