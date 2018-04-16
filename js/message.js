var page = {
    index: 1,
    total: 1,
    size: 10,
    type: 0
}; // 分页

getMessage();

//----------------------------消息中心 请求-------------------------------

// 消息请求
function getMessage() {
    $.ajax({
        url: getApi('web/messages'),
        type: 'post',
        data: {
            index: page.index,
            type: page.type,
            user_id: getobjS('user').id,
            token: getobjS('user').token
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
                $('#_mas_con').html(messageHtml(res.list));
            } else {
                _msg({msg: res.msg})
            }
        }
    })
}

// 删除消息
function delMessage(id) {
    $.ajax({
        url: getApi('web/msg_del'),
        type: 'post',
        data: {
            user_id: getobjS('user').id,
            token: getobjS('user').token,
            msg_id: id
        },
        dataType: 'jsonp',
        success: function (res) {
            if (res.code === 0) {
                getMessage();
            } else {
                _msg({msg: res.msg})
            }
        },
        error: function (err) {
            _msg({msg: '请重试'})
        }
    })
}

//----------------------------消息中心 功能-------------------------------

// 左侧消息菜单
$('#_mas_menu li').click(function () {
    $(this).addClass('menu_act').siblings('li').removeClass('menu_act');
}).eq(0).click();

// 消息内容展开闭合
function messageLook(th) {
    $(th).children('i').toggle();
    if ($(th).hasClass('op')) {
        $(th).removeClass('op').siblings('div').animate({height: '60px'}, 400);
    } else {
        $(th).addClass('op').siblings('div').animate({height: '100%'}, 'normal');
    }
}

// 消息html
function messageHtml(data) {
    var html = '';
    for (var i = 0, len = data.length; i < len; i++) {
        html += '<li><h3 class="_m_tit"><strong>' + data[i].title + '</strong>' +
            '<span class="u-right">' + data[i].time + '</span></h3>' +
            '<div class="_m_con">' + utf8to16(base64decode(data[i].content)) + '</div>' +
            '<a href="javascript:void(0)" class="_m_see" onclick="messageLook(this)">查看详情' +
            '<i class="iconfont icon-xia"></i><i class="iconfont icon-shang1 _s"></i></a>' +
            '<b onclick="delMessage(' + data[i].id + ')"><i class="iconfont icon-cha"></i></b></li>'
    }
    return html;
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
                page.index = obj.curr;
                if (!first) { // 首次不执行
                    // console.log(obj.curr); //得到当前页，以便向服务端请求对应页的数据。
                    // console.log(obj.limit); //得到每页显示的条数
                    // 翻页调用数据请求
                    getMessage();
                    // 定位到顶部
                    $(document).scrollTop(0)
                }
            }
        });
    });
}