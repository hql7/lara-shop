var type = 1; // 验证方式 0=手机找回  1=邮箱找回

vaMode(1); // 验证方式
systemLogo('.site-logo');

//-----------------------绑定验证码 请求------------------------

// 修改密码
function changePassWord(th) {

    if (type === 0) {   //手机
        code = $('#ph_code').val();
        emailOrPhone = $('#new_phone').val();
    } else { //邮箱
        code = $('#em_code').val();
        emailOrPhone = $('#new_email').val();
    }

    if (vada().form()) {
        // 禁用按钮
        $(th).attr('disabled', true);
        // 请求发送
        $.ajax({
            url: getApi('web/find_pass'),
            type: 'post',
            data: {
                username: $('#account').val(),
                emailOrPhone: emailOrPhone,
                find_type: type,
                // code: $('#code').val(),
                code: code,
                pass_type: 0, //0 登录密码
                newpass: $('#new_pass').val()
            },
            dataType: 'jsonp',
            success: function (res) {
                $(th).attr('disabled', false);
                if (res.code === 0) {
                    _msg({msg: res.msg});
                    setTimeout(function () {
                        location.href = 'login.html'
                    }, 1000)
                } else {
                    _msg({msg: res.msg});
                    getYzm();
                }
            },
            error: function (err) {
                $(th).attr('disabled', false);
                _msg({msg: '请重试'});
                getYzm();
            }
        })
    } else {
        getYzm()
    }
}

// 发送手机验证码
function getPhoneCode() {
    $.ajax({
        url: getApi('coms/mobile_code'),
        type: 'post',
        data: {
            mobile: $('#new_phone').val(),
            img_code: $('#code').val()
        },
        dataType: 'jsonp',
        success: function (res) {
            if (res.code === 0) {
                _msg({msg: res.msg})
                // 别的操作
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
function getEmailCode() {
    $.ajax({
        url: getApi('coms/email_code'),
        type: 'post',
        data: {
            email: $('#new_email').val(),
            img_code: $('#code').val()
        },
        dataType: 'jsonp',
        success: function (res) {
            if (res.code === 0) {
                _msg({msg: res.msg})
                // 别的操作
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

//-----------------------绑定验证码 功能------------------------

// 图片验证码
function getYzm() {
    $('#yzm_img').attr('src', getApi('coms/user-code?k=' + Math.random() + ''))
}

// 发送码验证
function sendCode(th, vl) {
    // var form = $('#pass_form');
    if (vl === 1) {
        if (vP()) {
            // 禁用按钮
            $(th).attr('disabled', true);
            // 请求发送
            getPhoneCode();
            // 再次发送定时器
            var timer1, num1 = 120;
            $(th).html(num1 + 's后重新发送');
            timer = setInterval(function () {
                num1--;
                $(th).html(num1 + 's后重新发送');
                if (num1 <= 0) {
                    clearInterval(timer1);
                    $(th).attr('disabled', false);
                    $(th).html('发送手机验证码');
                }
            }, 1000)
        } else {
            getYzm();
        }
    } else {
        if (vE()) {
            // 禁用按钮
            $(th).attr('disabled', true);
            // 请求发送
            getEmailCode();
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
            getYzm();
        }
    }
    // 验证没通过刷新验证码
    /* if (!form.valid()) {
         getYzm();
     }*/
}

// 提交验证
function vada() {
    return $('#pass_form').validate({
        rules: {
            account: {
                required: true,
                account: true
            },
            code: {
                required: true,
                rangelength: [5, 5]
            },
            em_code: {
                required: true,
                rangelength: [6, 6]
            },
            ph_code: {
                required: true,
                rangelength: [6, 6]
            },
            new_pass: {
                required: true,
                password: true
            },
            qr_pass: {
                required: true,
                equalTo: '#new_pass'
            }
        },
        messages: {
            code: "请输入长度为5的数字",
            em_code: "请输入长度为6的数字"
        },
        // 报错信息显示位置
        errorPlacement: function (error, element) {
            error.appendTo(element.parent());
        },
        errorElement: "em"
    })
}

// 选择验证方式
function vaMode(val) {
    getYzm();
    type = val;
    if (val === 1) { //邮箱找回
        $('._ph').css('display', 'none');
        $('._em').css('display', '');
        $('#va_mode span').eq(1).addClass('c-red')
            .siblings('span').removeClass('c-red');
    } else {  //手机找回
        $('._ph').css('display', '');
        $('._em').css('display', 'none');
        $('#va_mode span').eq(0).addClass('c-red')
            .siblings('span').removeClass('c-red');
    }
}

// 邮箱验证
function vE(form) {
    var em = $('#new_email');
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
    var ph = $('#new_phone');
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
