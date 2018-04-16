var form = {
    type: 0 // 0=退货退款 1=换货 2=维修
    , num: 1 // 数量
    , total: 1 // 可申请数量
    , is_take: null // 是否已收到货 0=已收到货 1=未收到货
    , invoice: null // 申请凭据  0=有发票  1=无发票
    , back: null // 退款方式  0=退款到账户余额 1=按支付方式原路返回
    , payee_account: null // 收款方账户
    , payee_real_name: null // 收款方真实姓名
    , imgs: []
}; // 售后申请表单信息

$(".ref_ali").css('display', 'none');
afterSaleApply();

//-----------------------申请售后 请求------------------------------

// 售后申请
function afterSaleApply() {
    $.ajax({
        url: getApi('web/after_page'),
        type: 'post',
        data: {
            user_id: getobjS('user').id,
            token: getobjS('user').token,
            og_id: getSearch().gid
        },
        dataType: 'jsonp',
        success: function (res) {
            loginOverdue(res.code);
            if (res.code === 0) {
                // 商品信息
                $('#_apl_gimg').attr('src', res.goods_info.img);
                $('#_apl_gname').html(res.goods_info.name);
                $('#_apl_gprice').html(res.goods_info.price);
                $('#_apl_gnum').html(res.goods_info.goods_nums);
                // 表单信息
                $('#_apl_num').html(res.goods_info.after_nums);
                form.total = res.goods_info.after_nums;
                $('#_apl_adr').html(res.user_info.location);
                $('#_apl_name').val(res.user_info.accept_name);
                $('#_apl_phone').val(res.user_info.mobile);
                $('#_apl_ph').val(res.user_info.phone);
                // 图片上传
                updateImg();
            } else {
                _msg({msg: res.msg})
            }
        }
    })
}

// 申请售后保存
function applySave(th) {
    // 处理提交数据
    var data = dafa({
        user_id: getobjS('user').id,
        token: getobjS('user').token,
        og_id: getSearch().gid,
        num: form.num,
        type: form.type,
        refund_type: form.back,
        payee_account: $('#payee_account').val(),
        payee_real_name: $('#payee_real_name').val(),
        reason: $('#_apl_reason').val(),
        description: $('#_apl_desc').val(),
        invoice: form.invoice,
        is_take: form.is_take,
        accept_name: $('#_apl_name').val(),
        mobile: $('#_apl_phone').val(),
        phone: $('#_apl_ph').val(),
        imgs: form.imgs
    });
    // 禁用按钮
    $(th).attr('disabled', true);
    // 发送请求
    $.ajax({
        url: getApi('web/after_save'),
        type: 'post',
        data: data,
        dataType: 'jsonp',
        success: function (res) {
            loginOverdue(res.code);
            $(th).attr('disabled', false);
            if (res.code === 0) {
                _msg({msg: res.msg});
                location.href = 'after-sale.html'
            } else {
                _msg({msg: res.msg})
            }
        },
        error: function (err) {
            $(th).attr('disabled', false);
            _msg({msg: '请重试'})
        }
    })
}

//-----------------------申请售后 功能------------------------------

// 服务类型选择
$('#_fwlx_>span').click(function () {
    // 样式
    $(this).addClass('fw_act').siblings('span').removeClass('fw_act');
    // 类型监控
    form.type = $(this).index();
    // 操作监控
    if ($(this).index() === 0) {
        $('#_back').css('display', '')
    } else {
        $('#_back').css('display', 'none')
    }
}).eq(0).click();

// 申请数量
function applyNum(th) {
    var val = $(th).val();
    if (/^[1-9][0-9]*/.test(val)) {
        form.num = val;
        if (val >= form.total) {
            $(th).val(form.total);
            form.num = form.total;
        } else if (val <= 1) {
            $(th).val(1);
            form.num = 1;
        }
    } else {
        $(th).val(1);
        form.num = 1;
    }
}

// 申请数量加
function applyNumPlus() {
    if (form.num < form.total) {
        form.num++;
        $('#_num').val(form.num)
    }
}

// 申请数量减
function applyNumMinus() {
    if (form.num > 1) {
        form.num--;
        $('#_num').val(form.num)
    }
}

// 货物状态
function cargoStatus(val) {
    form.is_take = val;
}

// 申请凭据
function applyProof(val) {
    form.invoice = val;
}

// 退款方式
function refundMethod(val) {
    form.back = val;
    if (val === 1) {
        $(".ref_ali").css('display', '')
    } else {
        $(".ref_ali").css('display', 'none')
    }
}

// 表单验证
function vada(th) {
    var rules;
    if (form.back === 1) {  //退款至支付宝
        rules = {
            reason: {
                required: true
            },
            description: {
                required: true
            },
            name: {
                required: true
            },
            phone: {
                required: true,
                phone: true
            },
            payee_account: {
                required: true
            },
            payee_real_name: {
                required: true
            }
        }
    } else {
        rules = {
            reason: {
                required: true
            },
            description: {
                required: true
            },
            name: {
                required: true
            },
            phone: {
                required: true,
                phone: true
            }
        };
    }

    $('#apply_form').validate({
        rules: rules,
        // 报错信息显示位置
        errorPlacement: function (error, element) {
            error.appendTo(element.closest('li'));
        },
        errorElement: "b",
        submitHandler: function () {
            applySave(th);
        }
    })
}

// 图片上传
function updateImg() {
    var p = new MyPromise(qiniuSetUp);
    p.then(function (data) {
        layui.use('upload', function () {
            var upload = layui.upload;
            //执行实例
            var uploadInst = upload.render({
                elem: '#_apl_upImg' //绑定元素
                , url: data.http //上传接口
                , data: data.data
                , multiple: true
                , before: function (obj) { //obj参数包含的信息，跟 choose回调完全一致，可参见上文。
                    layer.load(); //上传loading
                    //将每次选择的文件追加到文件队列
                    var files = obj.pushFile();
                    //预读本地文件，如果是多文件，则会遍历。(不支持ie8/9)
                    obj.preview(function (index, file, result) {
                        // console.log(index); //得到文件索引
                        // console.log(file); //得到文件对象
                        // console.log(result); //得到文件base64编码，比如图片
                        //这里还可以做一些 append 文件列表 DOM 的操作
                        //obj.upload(index, file); //对上传失败的单个文件重新上传，一般在某个事件中使用
                        // delete files[index]; //删除列表中对应的文件，一般在某个事件中使用
                        $('#_apl_img_box').append('<img src="' + result + '">');
                    });
                }
                , done: function (res, index, upload) {
                    layer.closeAll('loading'); //关闭loading
                    if (res.key) {
                        if ($.inArray(res.key, form.imgs) === -1) {
                            form.imgs.push(res.key);
                        }
                    } else {
                        layer.msg(res.msg || '上传失败，请刷新重试')
                    }
                }
                , error: function (index, upload) {
                    $('#_apl_img_box>img').eq(index).remove();
                    layer.closeAll('loading'); //关闭loading
                    layer.msg('请重试')
                }
            });
        });
    });
}