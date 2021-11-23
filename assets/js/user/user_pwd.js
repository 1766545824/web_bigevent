$(function () {
  var form = layui.form;
  form.verify({
    pwd: [/^[\S]{6,12}$/, '密码必须6到12位，且不能出现空格！'],
    // value 规则给谁就可以获取谁的文本框值
    samePwd: function (value) {
      // $.'[name=oldPwd].val()' 获取名字为 oldPwd 中的值
      if (value === $('[name=oldPwd]').val()) {
        return '新旧密码不能相同！';
      }
    },
    rePwd: function (value) {
      if (value !== $('[name=newPwd]').val()) {
        return '两次新密码不一致！'
      }
    }
  });
  $('.layui-form').on('submit',function (e) {
    e.preventDefault();
    $.ajax({
      method:'POST',
      url:'/my/updatepwd',
      // 快速获取表单数据
      data:$(this).serialize(),
      success:function (res) {
        if (res.status!==0){
          return layui.layer.msg('更新密码失败！')
        }
        layui.layer.msg('更新密码成功！');
        // 通过jQuery获取表单 将其转换为DOM元素
        // 调用 重置表单方法
        $('.layui-form')[0].reset();
      }
    });
  })
});