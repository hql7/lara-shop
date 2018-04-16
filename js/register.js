var type = '1'; // 验证方式
//商城logo
systemLogo();

vaMode(type);
registerInfo(); // 注册页信息

// 注册验证码
$('.img-code').click(function () {
    $(this).attr('src', getApi('coms/user-code?k=' + Math.random() + ''))
}).click();

//-----------------------绑定验证码 请求------------------------

// 注册页信息
function registerInfo() {
    $.ajax({
        url: getApi('web/reg_page'),
        type: 'post',
        dataType: 'jsonp',
        success: function (res) {
            if (res.code === 0) {
                type = res.reg_type;
                vaMode(type); // 验证方式
                $('#xy').html('《' + res.title + '》');
                $('#pop_xy_con').html(utf8to16(base64decode(res.content)))
            }
        }
    })
}

// 发送手机验证码
function getPhoneCode(th) {
    $.ajax({
        url: getApi('coms/mobile_code'),
        type: 'post',
        data: {
            mobile: $('#reg_phone').val(),
            img_code: $('#code').val()
        },
        dataType: 'jsonp',
        success: function (res) {
            if (res.code === 0) {
                _msg({msg: res.msg});
                // 别的操作
                // 再次发送定时器
                var timer1, num1 = 120;
                $(th).html(num1 + 's后重新发送');
                timer1 = setInterval(function () {
                    num1--;
                    $(th).html(num1 + 's后重新发送');
                    if (num1 <= 0) {
                        clearInterval(timer1);
                        $(th).attr('disabled', false);
                        $(th).html('发送手机验证码');
                    }
                }, 1000)
            } else {
                _msg({msg: res.msg});
                getYzm();
            }
        },
        error: function (err) {
            _msg({msg: '请重试'});
            getYzm();
        }
    })
}

// 发送邮箱验证码
function getEmailCode(th) {
    $.ajax({
        url: getApi('coms/email_code'),
        type: 'post',
        data: {
            email: $('#reg_email').val(),
            img_code: $('#code').val()
        },
        dataType: 'jsonp',
        success: function (res) {
            if (res.code === 0) {
                _msg({msg: res.msg})
                // 别的操作
                // 再次发送定时器
                var timer, num = 300;
                $(th).html(num + 's后重新发送');
                timer = setInterval(function () {
                    num--;
                    $(th).html(num + 's后重新发送');
                    if (num <= 0) {
                        clearInterval(timer);
                        $(th).attr('disabled', false);
                        $(th).html('发送验证码邮件');
                    }
                }, 1000)
            } else {
                _msg({msg: res.msg});
                getYzm();
            }
        },
        error: function (err) {
            _msg({msg: '请重试'});
            getYzm();
        }
    })
}

// 注册请求
function register() {
    if (vada().form()) {
        antiShakeObj.antiShake(function (resolve, reject) {
            $.ajax({
                url: getApi('web/register'),
                type: 'post',
                data: {
                    reg_type: type,
                    username: $('#reg_name').val(),
                    userpass: $('#reg_pass').val(),
                    account: type === '1' ? $('#reg_phone').val() : $('#reg_email').val(),
                    reg_code: type === '1' ? $('#phone_code').val() : $('#email_code').val()
                },
                dataType: 'jsonp',
                success: function (res) {
                    resolve(res);
                    if (res.code === 0) {
                        setInterval(function () {
                            location.href = 'login.html'
                        }, 2000);
                    } else {
                        $('.yzm-img').click()
                    }
                },
                error: function (err) {
                    reject(err);
                    $('.yzm-img').click()
                }
            })
        })
    }
}

//-----------------------绑定验证码 功能------------------------

// 图片验证码
function getYzm() {
    $('#yzm_img').attr('src', getApi('coms/user-code?k=' + Math.random() + ''))
}

// 表单提交
function vada() {
    return $('#register_form').validate({
        rules: {
            reg_name: {
                account: true
            },
            reg_pass: {
                required: true,
                password: true
            },
            qr_reg_pass: {
                required: true,
                equalTo: '#reg_pass'
            },
            reg_phone: {
                required: true,
                phone: true
            },
            reg_email: {
                required: true,
                email: true
            },
            email_code: {
                required: true,
                rangelength: [6, 6]
            },
            phone_code: {
                required: true,
                rangelength: [6, 6]
            },
            agree: {
                required: true
            }
        },
        messages: {
            reg_name: {
                required: '请输入账号'
            },
            reg_pass: {
                required: '请输入密码'
            },
            qr_reg_pass: {
                required: '请确认密码',
                equalTo: '两次输入不一致'
            },
            reg_phone: {
                required: '请输入手机号'
            },
            reg_email: {
                required: '请输入邮箱号'
            },
            email_code: {
                required: '请输入邮箱验证码',
                rangelength: '验证码长度为6'
            },
            phone_code: {
                required: '请输入手机验证码',
                rangelength: '验证码长度为6'
            },
            agree: '请阅读并同意用户协议'
        },
        // 报错信息显示位置
        errorPlacement: function (error, element) {
            error.css({
                color: '#f40000',
                marginLeft: '10px'
            });
            error.appendTo(element.parent());
        },
        errorElement: "em"
    })
}

// 发送码验证
function sendCode(th, vl) {
    // var form = $('#pass_form');
    if (vl === 1) {
        if (vP()) {
            // 禁用按钮
            $(th).attr('disabled', true);
            // 请求发送
            getPhoneCode(th);
        } else {
            getYzm();
        }
    } else {
        if (vE()) {
            // 禁用按钮
            $(th).attr('disabled', true);
            // 请求发送
            getEmailCode(th);
        } else {
            getYzm();
        }
    }
    // 验证没通过刷新验证码
}

// 选择验证方式
function vaMode(val) {
    getYzm();
    type = val;
    if (val === '1') { //手机注册
        $('._ph').css('display', '');
        $('._em').css('display', 'none');
        // $('#va_mode span').eq(0).addClass('c-red')
        //     .siblings('span').removeClass('c-red');
    } else { //邮箱注册
        $('._ph').css('display', 'none');
        $('._em').css('display', '');
        // $('#va_mode span').eq(1).addClass('c-red')
        //     .siblings('span').removeClass('c-red');
    }
}

// 邮箱验证
function vE(form) {
    var em = $('#reg_email');
    var cd = $('#code');
    var vali = false;
    var reg_em = /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/.test(em.val());
    var reg_cd = /^[\d]{5}$/.test(cd.val());
    if (reg_em) {
        if (reg_cd) {
            vali = true;
        } else {
            vali = false;
            _msg({msg: '请5位数字验证码'})
        }
    } else {
        vali = false;
        _msg({msg: '请输入正确邮箱号'})
    }
    return vali;
    /*return form.validate({
        rules: {
            new_email: {
                required: true,
                email: true
            },
            code: {
                required: true,
                rangelength: [5, 5]
            }
        },
        messages: {
            code: "请输入长度为5的数字"
        },
        // 报错信息显示位置
        errorPlacement: function (error, element) {
            error.appendTo(element.parent());
        },
        errorElement: "em"
    });*/
}

// 手机验证
function vP(form) {
    var ph = $('#reg_phone');
    var cd = $('#code');
    var vali = false;
    var reg_ph = /^1[3|4|5|7|8][\d]{9}$/.test(ph.val());
    var reg_cd = /^[\d]{5}$/.test(cd.val());
    if (reg_ph) {
        if (reg_cd) {
            vali = true;
        } else {
            vali = false;
            _msg({msg: '请5位数字验证码'})
        }
    } else {
        vali = false;
        _msg({msg: '请输入正确手机号'})
    }
    return vali;
    /* return form.validate({
         rules: {
             new_phone: {
                 required: true,
                 phone: true
             },
             code: {
                 required: true,
                 rangelength: [5, 5]
             }
         },
         messages: {
             code: "请输入长度为5的数字"
         },
         // 报错信息显示位置
         errorPlacement: function (error, element) {
             error.appendTo(element.parent());
         },
         errorElement: "em"
     });*/
}

// 查看协议
function seeAgreement() {
    $('#pop_xy').css('display', 'block');
    $('.mask').css('display', 'block');
}

// 关闭协议
function closeAgreement() {
    $('#pop_xy').css('display', '');
    $('.mask').css('display', '');
}

// 点击遮罩层关闭
$('.mask').click(function () {
    closeAgreement();
});

//商城logo
function systemLogo() {
    getSystemConfig('website');
    if (getobjS('website')) {
        $('.site-logo').html('<img src="' + getobjS('website').logo + '" alt="LOGO" width="140" height="40">');
    }
}