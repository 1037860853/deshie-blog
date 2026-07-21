/* ============================================
   guestbook.js — 留言板模块
   要求：必须填写昵称才能留言，记录留言设备
   ============================================ */

var Guestbook = (function() {
  'use strict';

  var U = AppUtils;
  var messages = [];
  var listeners = []; /* 数据变更监听器 */

  /* DOM */
  var $input, $nickname, $submit, $container, $badge, $errorMsg;

  function init() {
    $input     = U.el('guestbookInput');
    $nickname  = U.el('guestbookNickname');
    $submit    = U.el('guestbookSubmit');
    $container = U.el('guestbookMessages');
    $badge     = U.el('guestbookBadge');
    $errorMsg  = U.el('guestbookError');

    /* 加载预置留言 */
    var preset = AppConfig.PRESET_MESSAGES || [];
    for (var i = 0; i < preset.length; i++) {
      messages.push(preset[i]);
    }
    render();

    /* 事件绑定 */
    $submit.addEventListener('click', handleSubmit);
    $input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') { handleSubmit(); }
    });
    $nickname.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') { $input.focus(); }
    });

    /* 清除输入框错误状态 */
    $nickname.addEventListener('input', clearError);
    $input.addEventListener('input', clearError);
  }

  /* ---- 表单校验 ---- */
  function validate() {
    var nicknameVal = $nickname.value.trim();
    var inputVal = $input.value.trim();
    var hasError = false;

    /* 重置 */
    $nickname.classList.remove('error');
    $input.classList.remove('error');
    $errorMsg.classList.remove('guestbook-card__error-msg--visible');

    if (!nicknameVal) {
      $nickname.classList.add('error');
      $errorMsg.textContent = '请输入昵称后再留言';
      $errorMsg.classList.add('guestbook-card__error-msg--visible');
      $nickname.focus();
      return false;
    }

    if (!inputVal) {
      $input.classList.add('error');
      $errorMsg.textContent = '请输入留言内容';
      $errorMsg.classList.add('guestbook-card__error-msg--visible');
      $input.focus();
      return false;
    }

    if (nicknameVal.length > 20) {
      $nickname.classList.add('error');
      $errorMsg.textContent = '昵称不能超过 20 个字符';
      $errorMsg.classList.add('guestbook-card__error-msg--visible');
      return false;
    }

    if (inputVal.length > 500) {
      $input.classList.add('error');
      $errorMsg.textContent = '留言内容不能超过 500 个字符';
      $errorMsg.classList.add('guestbook-card__error-msg--visible');
      return false;
    }

    return true;
  }

  function clearError() {
    $nickname.classList.remove('error');
    $input.classList.remove('error');
    $errorMsg.classList.remove('guestbook-card__error-msg--visible');
  }

  /* ---- 提交留言 ---- */
  function handleSubmit() {
    if (!validate()) { return; }

    var nicknameVal = $nickname.value.trim();
    var inputVal = $input.value.trim();
    var device = U.getDeviceInfo();
    var time = U.nowTimeString();

    messages.push({
      author: nicknameVal,
      text: inputVal,
      device: device,
      time: time,
    });

    /* 清空输入 */
    $input.value = '';
    $nickname.value = '';

    render();
    notifyListeners();

    /* 接口：POST 到后端
       fetch('/api/guestbook', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           author: nicknameVal,
           text: inputVal,
           device: device,
         }),
       });
    */
  }

  /* ---- 渲染留言列表 ---- */
  function render() {
    var html = '';
    for (var i = messages.length - 1; i >= 0; i--) {
      var m = messages[i];
      html += '<div class="guestbook-msg">'
        + '<span class="guestbook-msg__author">' + U.escapeHtml(m.author) + '</span>'
        + '<span class="guestbook-msg__meta">'
        +   U.escapeHtml(m.time || '')
        +   '<span class="guestbook-msg__device" title="留言设备">'
        +     U.escapeHtml(m.device || '')
        +   '</span>'
        + '</span>'
        + '<br>' + U.escapeHtml(m.text)
        + '</div>';
    }

    if (!html) {
      html = '<div style="color:var(--text-light);text-align:center;padding:20px;">'
        + '暂无留言，来说点什么吧~</div>';
    }

    $container.innerHTML = html;
    $badge.textContent = messages.length + ' 条留言';
  }

  /* ---- 数据变更通知 ---- */
  function onChange(fn) { listeners.push(fn); }
  function notifyListeners() {
    for (var i = 0; i < listeners.length; i++) { listeners[i](messages); }
  }

  /* 供弹幕模块获取数据 */
  function getMessages() { return messages; }

  return {
    init: init,
    getMessages: getMessages,
    onChange: onChange,
    render: render,
  };

})();
