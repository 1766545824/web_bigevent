$(function () {
  // 点击 "去注册账号"的链接
  $('#link_reg').on("click", function () {
    $('.login-box').hide();
    $('.reg-box').show();
  });

  // 点击 "去登录"的链接
  $('#link_login').on("click", function () {
    $('.login-box').show();
    $('.reg-box').hide();
  });
  // 从 layui 中获取 form对象
  var form = layui.form;
  var layer = layui.layer;
  // 通过 form.verify 来自定义校验规则
  form.verify({
    // 自定义了一个叫做 pwd 校验规则
    pwd: [/^[\S]{6,12}$/, '密码必须6到12位，且不能出现空格'],

    // 校验两次密码是否一致的规则
    // value 获取用户输入的值
    repwd: function (value) {
      // 通过形参拿到确认密码框中的内容
      // 还需要拿到密码框中的内容
      // 然后还需要进行一次是否相等的判断
      // 判断失败则return一个提示消息
      // []属性选择器 查找reg-box的password元素
      var pwd = $('.reg-box [name=password]').val();
      if (pwd !== value) {
        return '两次密码不一致，请重新输入！'
      }
    }
  });

  // 监听注册表单的提交事件 submit
  $('#form_reg').on('submit', function (e) {
    // 阻止默认行为
    e.preventDefault();
    // 2. 发起Ajax的POST请求
    var data = {
      username: $('#form_reg [name=username]').val(),
      password: $('#form_reg [name=password]').val()
    };
    $.post('/api/reguser',
      data, function (res) {
        // res.status ==0 则注册成功
        if (res.status !== 0) {
          return layer.msg(res.message)
        }
        layer.msg('注册成功,请登录！');

        // 注册成功后 模拟人的点击行为 跳转到登录界面
        $('#link_login').click();
      });
  });

  // 监听登录表单的提交事件
  $('#form_login').submit(function (e) {
    // 阻止默认提交行为
    e.preventDefault();
    $.ajax({
      url: '/api/login',
      method: 'POST',
      // 快速获取表单中的数据
      data: $(this).serialize(),
      success: function (res) {
        if (res.status !== 0) {
          return layer.msg('登录失败！')
        }
        layer.msg('登录成功！');
        // console.log(res.token);
        // 将登录成功得到的 token字符串 保存到 localStorage 中
        localStorage.setItem('token',res.token);
        // 跳转到后台主页
        location.href='index.html'
      }
    })
  })

});