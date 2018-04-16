// 进入登陆界面就清空登陆信息
delobjS('user');
// 随机登录广告
// loginAd();
//------------------------------------请求--------------------------------------

// 防止浏览器自动记录密码防护
$('#login_form').attr('name', Math.random());
/*var pass = '';
$('#log_pass').bind('input propertychange', function () {
    pass += $(this).val().replace(/[*]/g, '');
    $(this).val($(this).val().replace(/\S/g, '*'))
});*/
/*function safePass(th) {
    pass += $(th).val().replace(/[*]/g, '');
    $(th).val($(th).val().replace(/\S/g, '*'))
}*/

// 聚焦清除密码
function focusPassClear(th) {
    $(th).val('');
    // pass = '';
}

// 表单验证
function vada() {
    $('#login_form').validate({
        rules: {
            log_name: {
                required: true
                // account: true
            },
            log_pass: {
                required: true,
                password: true
            },
            log_code: {
                required: true,
                rangelength: [5, 5]
            }
        },
        messages: {
            log_name: "请输入您的账号",
            log_code: {
                required: "请输入验证码",
                rangelength: "验证码的长度为5"
            },
            log_pass: {
                required: "请输入您的密码",
                password: "密码格式为6到18位非空字符"
            }
        },
        // 报错信息显示位置
        errorPlacement: function (error, element) {
            /*error.css({
                width: '240px',
                color: '#dd2525',
                paddingLeft: '195px'
            });
            error.appendTo('.err-box');*/
        },
        invalidHandler: function (form, validator) {
            $.each(validator.invalid, function (k, v) {
                $('.err-box').addClass('err-box-show').find('.err-msg').text(v);
                return false;
            });
        },
        errorElement: "em",
        submitHandler: function () {
            $('.err-box').removeClass('err-box-show');
            http_()
        }
    })
}

// 登录请求
function http_() {
    var data = {
        username: $('#log_name').val(),
        userpass: $('#log_pass').val(),
        yzm: $('#log_code').val(),
        type: 0 // pc端登录
    };

    $.ajax({
        url: getApi('web/login'),
        type: 'post',
        data: dafa(data),
        dataType: 'jsonp',
        success: function (res) {
            if (res.code === 0) {
                location.href = 'index.html';
                setobjS('user', res.info)
            } else {
                $('.yzm-img').click();
                _msg({msg: res.msg});
            }
        },
        error: function (err) {
            $('.yzm-img').click();
            _msg({msg: '请重试'});
        }
    })
}

// 游客模式
function touristModel() {
    location.href = 'index.html'
}

//商城logo
getSystemConfig('website');
systemLogo('.site-logo');

// 登录页广告
/*function loginAd() {
    $.ajax({
        url: getApi('web/ad_position'),
        type: 'post',
        data: {type: 8},
        dataType: 'jsonp',
        success: function (res) {
            if (res.code === 0) {
                res.list = res.list || [];
                var i = Math.floor(Math.random() * res.list.length);
                $('#login_ad').attr('href', res.list[i].link).children('img').attr({
                    src: res.list[i].img,
                    title: res.list[i].name,
                    alt: res.list[i].name
                })
            }
        },
        error: function () {

        }
    })
}*/

//----------------------------------功能------------------------------------------

// 登陆验证码
$('.yzm-img').click(function () {
    $(this).attr('src', getApi('coms/user-code?k=' + Math.random() + ''))
}).click();

// 回车事件
$(document).keypress(function (e) {
    var eCode = e.keyCode ? e.keyCode : e.which ? e.which : e.charCode;
    if (eCode == 13) {
        vada()
    }
});

// 激活效果
$('#act_ input').focus(function () {
    $(this).parent('li').addClass('act').siblings('li').removeClass('act');
    $(this).siblings('i').show().parent('li').siblings('li').find('.u-clear').css('display', 'none')
});

// 快捷清理
$('.u-clear').click(function () {
    $(this).prev('input').val('')
});

// 第三方登录 - qq 暂不开启
/*
QC.Login({
    //btnId：插入按钮的节点id，必选
    btnId: "qqLoginBtn",
    //用户需要确认的scope授权项，可选，默认all
    scope: "all",
    //按钮尺寸，可用值[A_XL| A_L| A_M| A_S|  B_M| B_S| C_S]，可选，默认B_S
    size: "C_S"
});*/
