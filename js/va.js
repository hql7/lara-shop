// 表单验证
jQuery.validator.addMethod("account", function (value, element) {
    var reg = /^[a-zA-Z0-9_-]{3,16}$/;
    return this.optional(element) || (reg.test(value));
}, "用户名为3到16位字母数字下划线的组合");

jQuery.validator.addMethod("password", function (value, element) {
    var reg = /^\S{6,18}$/;
    return this.optional(element) || (reg.test(value));
}, "密码为6到18位非空字符");

jQuery.validator.addMethod("phone", function (value, element) {
    var reg = /^1[3-9][\d]{9}$/;
    return this.optional(element) || (reg.test(value));
}, "请输入合法手机号");