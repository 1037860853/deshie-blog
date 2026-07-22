/* ============================================
   guestbook.js — 留言板模块
   服务端存储 /api/guestbook.php
   emoji 表情选择器 + 管理员删除
   ============================================ */

var Guestbook = (function() {
  'use strict';

  var U = AppUtils;
  var API_URL = '/api/guestbook.php';
  var messages = [];
  var listeners = [];
  var adminMode = false;
  var ADMIN_PASS = 'YOUR_ADMIN_PASSWORD'; /* 上线后改为实际密码 */

  var $container, $input, $nickname, $submit, $badge, $errorMsg,
      $emojiBtn, $emojiPicker, $adminBtn;

  /* ---- 初始化 ---- */
  function init() {
    $container = document.getElementById('guestbookMessages');
    $input     = document.getElementById('guestbookInput');
    $nickname  = document.getElementById('guestbookNickname');
    $submit    = document.getElementById('guestbookSubmit');
    $badge     = document.getElementById('guestbookBadge');
    $errorMsg  = document.getElementById('guestbookError');

    /* 管理员按钮 */
    $adminBtn = document.getElementById('guestbookAdminBtn');
    if ($adminBtn) {
      $adminBtn.addEventListener('click', toggleAdmin);
    }

    /* 事件绑定 */
    $submit.addEventListener('click', handleSubmit);
    $input.addEventListener('keydown', onInputKeydown);
    $nickname.addEventListener('input', clearError);
    $input.addEventListener('input', clearError);

    /* emoji 选择器 */
    $emojiBtn    = document.getElementById('emojiBtn');
    $emojiPicker = document.getElementById('emojiPicker');
    if ($emojiBtn && $emojiPicker) {
      buildEmojiPicker();
      $emojiBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        $emojiPicker.classList.toggle('emoji-picker--open');
      });
      document.addEventListener('click', function(e) {
        if (!$emojiPicker.contains(e.target) && e.target !== $emojiBtn) {
          $emojiPicker.classList.remove('emoji-picker--open');
        }
      });
    }

    /* 从服务器加载 */
    loadFromServer();
  }

  /* ---- 服务端加载 ---- */
  function loadFromServer() {
    fetch(API_URL)
    .then(function(r) { return r.json(); })
    .then(function(data) {
      messages = Array.isArray(data) ? data : [];
      render();
      notifyListeners();
    })
    .catch(function(err) {
      console.error('[留言板] 加载失败:', err);
      render();
    });
  }

  /* ---- 表单校验 ---- */
  function validate() {
    $nickname.classList.remove('error');
    $input.classList.remove('error');
    $errorMsg.classList.remove('guestbook-card__error-msg--visible');

    if (!$nickname.value.trim()) {
      $nickname.classList.add('error');
      $errorMsg.textContent = '请输入昵称';
      $errorMsg.classList.add('guestbook-card__error-msg--visible');
      $nickname.focus();
      return false;
    }
    if (!$input.value.trim()) {
      $input.classList.add('error');
      $errorMsg.textContent = '请输入留言内容';
      $errorMsg.classList.add('guestbook-card__error-msg--visible');
      $input.focus();
      return false;
    }
    if ($nickname.value.trim().length > 20) {
      $nickname.classList.add('error');
      $errorMsg.textContent = '昵称不能超过 20 个字';
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

  /* ---- 提交 ---- */
  function handleSubmit() {
    if (!validate()) return;

    var payload = {
      author: $nickname.value.trim(),
      text:   $input.value.trim(),
      device: U.getDeviceInfo(),
    };

    $submit.disabled = true;
    $submit.textContent = '发送中...';

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    .then(function(r) { return r.json(); })
    .then(function(msg) {
      if (msg.error) { alert(msg.error); return; }
      messages.push(msg);
      $input.value = '';
      $nickname.value = '';
      render();
      notifyListeners();
    })
    .catch(function(err) {
      console.error('[留言板] 发送失败:', err);
      alert('发送失败，请稍后重试');
    })
    .finally(function() {
      $submit.disabled = false;
      $submit.innerHTML = '<span class="icon-placeholder" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;"></span>发送';
    });
  }

  /* ---- 管理员 ---- */
  function toggleAdmin() {
    if (adminMode) {
      adminMode = false;
      $adminBtn.textContent = '🔑 管理';
      render();
      return;
    }
    var pass = prompt('请输入管理员密码：');
    if (pass === ADMIN_PASS) {
      adminMode = true;
      $adminBtn.textContent = '🔒 退出管理';
      render();
    } else if (pass !== null) {
      alert('密码错误');
    }
  }

  function deleteMessage(id) {
    if (!confirm('确定删除这条留言？')) return;
    fetch(API_URL + '?id=' + encodeURIComponent(id), {
      method: 'DELETE',
      headers: { 'X-Admin-Token': ADMIN_PASS },
    })
    .then(function(r) { return r.json(); })
    .then(function(res) {
      if (res.success) {
        messages = messages.filter(function(m) { return m.id !== id; });
        render();
        notifyListeners();
      } else {
        alert(res.error || '删除失败');
      }
    })
    .catch(function() { alert('删除失败'); });
  }

  /* ---- 渲染 ---- */
  function render() {
    if (!$container) return;
    if (messages.length === 0) {
      $container.innerHTML = '<div style="color:var(--text-light);text-align:center;padding:20px;">暂无留言，来说点什么吧~</div>';
      $badge.textContent = '0 条留言';
      return;
    }
    var html = '';
    for (var i = messages.length - 1; i >= 0; i--) {
      var m = messages[i];
      var time = m.time || '';
      var device = m.device || '';
      html += '<div class="guestbook-msg">'
        + '<span class="guestbook-msg__author">' + U.escapeHtml(m.author) + '</span>'
        + '<span class="guestbook-msg__meta">'
        +   U.escapeHtml(time)
        +   '<span class="guestbook-msg__device" title="来自 ' + U.escapeHtml(device) + '">'
        +     U.escapeHtml(device)
        +   '</span>';
      if (adminMode) {
        html += '<button class="guestbook-msg__delete" data-id="' + m.id + '" title="删除此留言">🗑</button>';
      }
      html += '</span>'
        + '<br>' + U.escapeHtml(m.text)
        + '</div>';
    }
    $container.innerHTML = html;
    $badge.textContent = messages.length + ' 条留言';

    /* 绑定删除按钮 */
    if (adminMode) {
      var dels = $container.querySelectorAll('.guestbook-msg__delete');
      for (var d = 0; d < dels.length; d++) {
        dels[d].addEventListener('click', function() {
          deleteMessage(this.getAttribute('data-id'));
        });
      }
    }
  }

  /* ---- Emoji 选择器 ---- */
  var EMOJI_LIST = [
    '😀','😃','😄','😁','😅','😂','🤣','😊','😇','😍','🤩','😘','😗','😚','😋','😜','🤪','😝','🫡','🤗',
    '🤔','🤨','😐','😑','😶','😏','😒','🙄','😬','😮','😯','😲','😳','🥺','😢','😭','😤','😡','🤬','😈',
    '👍','👎','👏','🙌','💪','🤝','🙏','❤️','🧡','💛','💚','💙','💜','🖤','🤍','💔','💯','✨','🔥','💩',
    '🎉','🎊','🎈','🎀','🎵','🎶','🌈','⭐','🌙','☀️','🌸','🌺','🍀','🎄','🎃','🐱','🐶','🐼','🍰','☕',
  ];

  function buildEmojiPicker() {
    var html = '<div class="emoji-picker__grid">';
    for (var i = 0; i < EMOJI_LIST.length; i++) {
      html += '<button class="emoji-picker__item" data-emoji="' + EMOJI_LIST[i] + '">' + EMOJI_LIST[i] + '</button>';
    }
    html += '</div>';
    $emojiPicker.innerHTML = html;

    $emojiPicker.addEventListener('click', function(e) {
      var btn = e.target.closest('.emoji-picker__item');
      if (!btn) return;
      var emoji = btn.getAttribute('data-emoji');
      insertEmoji(emoji);
      $emojiPicker.classList.remove('emoji-picker--open');
    });
  }

  function insertEmoji(emoji) {
    if (!$input) return;
    var start = $input.selectionStart || 0;
    var end   = $input.selectionEnd || 0;
    var before = $input.value.substring(0, start);
    var after  = $input.value.substring(end);
    $input.value = before + emoji + after;
    var pos = start + emoji.length;
    $input.setSelectionRange(pos, pos);
    $input.focus();
  }

  function onInputKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  /* ---- 数据变更通知（供弹幕模块）---- */
  function onChange(fn) { listeners.push(fn); }
  function notifyListeners() {
    for (var i = 0; i < listeners.length; i++) { listeners[i](messages); }
  }
  function getMessages() { return messages; }

  return {
    init: init,
    getMessages: getMessages,
    onChange: onChange,
    render: render,
  };

})();
