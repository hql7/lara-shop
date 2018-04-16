if (getobjS('user')) {
    $('#user_name').html(getobjS('user').name)
} else {
    location.href = 'login.html'
}

var product_id = ''; // 货号盒子
var num = 1; // 数量盒子
var cartCheck = getobjS('cartCheck') ? getobjS('cartCheck') : {}; // 购物车选中状态盒子
myCart(); // 购物车请求
myFootprint(); // 我的足迹请求

//-------------------购物车请求--------------------

// 购物车
function myCart() {
    $.ajax({
        url: getApi('web/carts'),
        type: 'post',
        data: {
            user_id: getobjS('user').id,
            token: getobjS('user').token,
            product_id: product_id,
            num: num
        },
        dataType: 'jsonp',
        success: function (res) {
            loginOverdue(res.code);
            if (res.code === 0) {
                if (res.list) {
                    // 全部数量
                    $('#_c_all_num').html('（' + res.nums + '）');
                    var str = '';
                    for (var i = 0, len = res.list.length; i < len; i++) {
                        // 如果有存在会话里的选中状态 没有会话声明为false
                        if (getobjS('cartCheck')) {
                            for (var key in getobjS('cartCheck')) {
                                if (key == res.list[i].product_id) {
                                    res.list[i].checked = getobjS('cartCheck')[key]
                                }
                            }
                        } else {
                            cartCheck[res.list[i].product_id] = false;
                            res.list[i].checked = false;
                        }
                        var str2 = '';
                        for (var j in res.list[i].spec) {
                            str2 += '<p><label>' + j + '</label>: <span>' + res.list[i].spec[j] + '</span></p>'
                        }
                        str += '<li data-pid="' + res.list[i].product_id + '" data-id="' + res.list[i].good_id + '" data-act="' + res.list[i].checked + '" data-kc="' + res.list[i].store + '">' +
                            '<div class="_tab_check"><input class="cart_check" onchange="goodCheck(this)" type="checkbox" ' + (res.list[i].checked === true ? "checked" : "") + '></div>' +
                            '<div class="_tab_img"><a href="goods.html?id=' + res.list[i].good_id + '"><img src="' + res.list[i].img + '" alt="good"></a></div>' +
                            '<div class="_tab_name"><h3><a href="goods.html?id=' + res.list[i].good_id + '">' + res.list[i].good_name + '</a></h3></div>' +
                            '<div class="_tab_spec">' + str2 + '</div><div class="_tab_dj">￥' + res.list[i].sell_price + '</div>' +
                            '<div class="_tab_num"><p><b class="_c_minus" onclick="goodMinus(this)">-</b><input oninput="goodNum(this)" class="_c_num" type="text" value="' + res.list[i].num + '">' +
                            '<b class="_c_plus" onclick="goodPlus(this)">+</b></p><p><strong>' + (res.list[i].store > 0 ? "有货" : "无货") + '</strong></p></div>' +
                            '<div class="_tab_xj">￥<span>' + res.list[i].total + '</span></div><div class="_tab_cz">' +
                            // '<p onclick="del_in_cart(' + res.list[i].product_id + ',0)">删除</p><p onclick="addFavorite(' + res.list[i].product_id + ')">加入我的收藏</p>' +
                            // '<p onclick="del_in_cart(' + res.list[i].product_id + ',1,' + res.list[i].good_id + ')">移入我的收藏</p></div></li>'
                            '<p onclick="del_in_cart(' + res.list[i].product_id + ',0)">删除</p>' +
                            '<p onclick="del_in_cart(' + res.list[i].product_id + ',1,' + res.list[i].good_id + ')">移入我的收藏</p></div></li>'
                    }
                    // 加入dom并处理样式
                    $('.c_t_c_box ul').html(str).children('li').last().css('border', 'none');
                    /*  // 购物车数量加减
                      $('._c_minus').click(function () {
                          product_id = $(this).closest('li').attr('data-pid');
                          num = Number($(this).next('input').val());
                          if (num > 1) {
                              num--;
                              $(this).next('input').val(num);
                              myCart()
                          }
                          // 计算总价
                          computeTotal()
                      });
                      // 购物车数量加
                      $('._c_plus').click(function () {
                          product_id = $(this).closest('li').attr('data-pid');
                          num = Number($(this).prev('input').val());
                          num++;
                          $(this).prev('input').val(num);
                          myCart();
                          // 计算总价
                          computeTotal()
                      });
                      // 购物车数量更改
                      $('._c_num').blur(function () {
                          var rsg = /^[1-9][0-9]*$/.test(Number($(this).val()));
                          if (rsg) {
                              product_id = $(this).closest('li').attr('data-pid');
                              num = Number($(this).val());
                              myCart()
                          } else {
                              _msg({msg: '数量只能为数字并且第一位不能为0'})
                          }
                          // 计算总价
                          computeTotal()
                      }); */
                    // check选中处理
                    /* $('.cart_check').change(function () {
                        var self = $(this);
                        var pid = $(this).closest('li').attr('data-pid');
                        if (self.is(':checked')) {
                            self.closest('li').attr('data-act', true);
                            isCheckAll(); // 监视是否全部选中
                            cartCheck[pid] = true;
                            setobjS('cartCheck', cartCheck)
                        } else {
                            self.closest('li').attr('data-act', false);
                            isCheckAll(); // 监视是否全部选中
                            cartCheck[pid] = false;
                            setobjS('cartCheck', cartCheck)
                        }
                        // 计算总价
                        computeTotal()
                    }); */
                    // 是否全部选中
                    isCheckAll();
                } else {
                    $('#_c_all_num').html(0);
                    $('.c_table_con').css('display', 'none').next('div').css('display', 'block')
                }
                // 计算总价
                computeTotal();
            } else {
                _msg({msg: res.msg})
            }
        },
        error: function (err) {
        }
    })
}

// 我的足迹
function myFootprint() {
    $.ajax({
        url: getApi('web/visit_list'),
        type: 'post',
        data: {
            index: 1,
            user_id: getobjS('user').id,
            token: getobjS('user').token,
            category: 0
        },
        dataType: 'jsonp',
        success: function (res) {
            loginOverdue(res.code);
            if (res.code === 0) {
                var str = '';
                // 只取前五个展示
                res.list.length = res.list.length > 5 ? 5 : res.list.length;
                for (var i = 0, len = res.list.length; i < len; i++) {
                    str += '<div><a href="goods.html?id=' + res.list[i].id + '">' +
                        '<img src="' + res.list[i].img + '" alt="good">' +
                        '<h3>' + res.list[i].name + '</h3><p><em>' + res.list[i].real_price + '</em></p></a></div>'
                }
                $('._c_footprint').html(str)
            } else {
                _msg({msg: res.msg})
            }
        },
        error: function (err) {
        }
    })
}

// 去结算
function toSettlement() {
    var param = []; // 收集选中项信息
    var li = $('.c_t_c_box li');
    for (var i = 0, len = li.length; i < len; i++) {
        if (li.eq(i).attr('data-act') === 'true') {
            param.push({
                good_id: li.eq(i).attr('data-id'),
                product_id: li.eq(i).attr('data-pid'),
                num: li.eq(i).find('._c_num').val()
            })
        }
    }
    var data = dafa({ // 处理数据格式
        user_id: getobjS('user').id,
        token: getobjS('user').token,
        param: param
    });
    if (param.length > 0) {
        $.ajax({ //生成订单请求
            url: getApi('web/order_ready'),
            type: 'post',
            data: data,
            dataType: 'jsonp',
            success: function (res) {
                loginOverdue(res.code);
                if (res.code === 0) {
                    location.href = 'confirm-order.html'
                } else {
                    _msg({msg: res.msg})
                }
            },
            error: function (err) {
                _msg({msg: '请稍后再试'})
            }
        })
    } else {
        _msg({msg: '请选择要购买的商品'})
    }
}

//-------------------购物车功能---------------------

// 购物车页搜索
function cartSearch() {
    // 这里可以做默认关键词操作提高指定商品曝光率
    var k = $('#k').val() || '手机';
    location.href = 'search.html?k=' + k + ''
}

// 购物车删除||移入收藏
function del_in_cart(pid, type, id) {
    var arr_del = [], arr_move = [], li = $('.c_t_c_box li');
    if (pid === 'all') {
        for (var i = 0, len = li.length; i < len; i++) {
            if (li.eq(i).attr('data-act') === 'true') {
                arr_del.push(li.eq(i).attr('data-pid'));
                arr_move.push(li.eq(i).attr('data-id'))
            }
        }
    } else {
        arr_del.push(pid);
        arr_move.push(id)
    }
    var data = dafa({
        user_id: getobjS('user').id,
        token: getobjS('user').token,
        act_type: type,
        id_list: arr_del,
        goods_id: type === 1 ? arr_move : []
    });
    $.ajax({
        url: getApi('web/del_cart'),
        type: 'post',
        data: data,
        dataType: 'jsonp',
        success: function (res) {
            loginOverdue(res.code);
            if (res.code === 0) {
                _msg({title: '成功', msg: res.msg});
                myCart();
            } else {
                _msg({title: '失败', msg: res.msg})
            }
        },
        error: function (err) {
            _msg({msg: '请稍后再试'})
        }
    })
}

// 加入收藏
function addFavorite(pid) {
    // console.log(pid);
}

// 计算总价
function computeTotal() {
    var li = $('.c_t_c_box li');
    var ZJ = 0, ZS = 0;
    for (var i = 0, len = li.length; i < len; i++) {
        if (li.eq(i).attr('data-act') === 'true') {
            ZJ += parseFloat(li.eq(i).find('._tab_xj').children('span').html());
            ZS += parseFloat(li.eq(i).find('._c_num').val());
        }
    }
    $('._c_zj').html('￥' + ZJ.toFixed(2));
    $('._c_zs').html(ZS);
}

// 单条商品数量减
function goodMinus(th) {
    product_id = $(th).closest('li').attr('data-pid');
    num = Number($(th).next('input').val());
    if (num > 1) {
        num--;
        $(th).next('input').val(num);
        myCart()
    }
    // 计算总价
    computeTotal()
}

// 单条商品数量加
function goodPlus(th) {
    product_id = $(th).closest('li').attr('data-pid');
    num = parseInt($(th).prev('input').val());
    var store = parseInt($(th).closest('li').attr('data-kc'));
    if (num < store) {
        num++;
        $(th).prev('input').val(num);
        myCart();
        // 计算总价
        computeTotal()
    }
}

// 单条商品选中操作
function goodCheck(th) {
    var self = $(th);
    var pid = $(th).closest('li').attr('data-pid');
    if (self.is(':checked')) {
        self.closest('li').attr('data-act', true);
        cartCheck[pid] = true;
        setobjS('cartCheck', cartCheck)
    } else {
        self.closest('li').attr('data-act', false);
        cartCheck[pid] = false;
        setobjS('cartCheck', cartCheck)
    }
    // 监视是否全部选中
    isCheckAll();
    // 计算总价
    computeTotal()
}

// 单条商品数量input
function goodNum(th) {
    var rsg = /^[1-9][0-9]*$/.test(parseInt($(th).val()));
    var store = parseInt($(th).closest('li').attr('data-kc'));
    if (!rsg) {
        $(th).val(1)
    } else if (parseInt($(th).val()) > store) {
        $(th).val(store)
    }
    product_id = $(th).closest('li').attr('data-pid');
    num = parseInt($(th).val());
    myCart();

    // 计算总价
    computeTotal()
}

// 是否全部选中
function isCheckAll() {
    var allCheck = $('#_c_checkAll');
    var allCheckjs = document.getElementById('_c_checkAll');
    var li = $('.c_t_c_box li');
    var ckal = 0;
    for (var i = 0, len = li.length; i < len; i++) {
        if (li.eq(i).attr('data-act') !== 'true') {
            ckal++
        }
    }
    if (ckal === 0) {
        allCheckjs.checked = true;
        allCheck.attr("checked", "checked");
    } else {
        allCheckjs.checked = false;
        allCheck.attr("checked", false);
    }

    /*   for (var j = 0; j < allCheck.length; j++) {
           if (ckal == 0) {
               allCheck[j].checked = true;
               allCheck.eq(j).attr("checked", "checked");
           } else {
               allCheck[j].checked = false;
               allCheck.eq(j).attr("checked", false);
           }
       }*/
    /*  if (ckal === 0) {
          for (var j = 0; j < allCheck.length; j++) {
              allCheck[j].checked = true;
              allCheck.eq(j).attr("checked", "checked");
          }
      } else {
          for (var k = 0; k < allCheck.length; k++) {
              allCheck[k].checked = false;
              allCheck.eq(k).attr("checked", false);
          }
      } */
}

// 全选
$('._c_checkAll').click(function () {
    var oneCheck = $('.cart_check');
    if ($(this).is(':checked')) {
        for (var i = 0; i < oneCheck.length; i++) {
            $('.c_t_c_box li').eq(i).attr('data-act', true);
            oneCheck[i].checked = true;
            oneCheck.eq(i).attr("checked", "checked");
        }
    } else {
        for (var j = 0; j < oneCheck.length; j++) {
            $('.c_t_c_box li').eq(j).attr('data-act', false);
            oneCheck[j].checked = false;
            oneCheck.eq(j).attr("checked", false);
        }
    }
    computeTotal();
});
