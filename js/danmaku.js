/* ============================================
   danmaku.js — 弹幕留言模块
   轨道防重叠 · 随机昵称色 · 10条上限 · 右端起始
   ============================================ */

var Danmaku = (function() {
  'use strict';

  var U = AppUtils;
  var $stage, $count;
  var timer = null;
  var messageSource = null;
  var activeLanes = [];       /* 每个轨道的占用状态 */
  var activeMsgIds = {};      /* 当前正在弹幕中的留言 ID，防重复 */
  var LANE_HEIGHT = 34;       /* 每条轨道高度 px */
  var COLOR_POOL = [
    '#e74c3c', '#e67e22', '#f39c12', '#2ecc71', '#1abc9c',
    '#3498db', '#9b59b6', '#e91e63', '#00bcd4', '#ff5722',
    '#4caf50', '#2196f3', '#ff9800', '#795548', '#607d8b',
  ];

  function init() {
    $stage = document.getElementById('danmakuStage');
    $count = document.getElementById('danmakuCount');
    start();
  }

  function setMessageSource(fn) { messageSource = fn; }

  function getMessages() {
    if (messageSource) {
      var msgs = messageSource();
      if (msgs && msgs.length > 0) return msgs;
    }
    return [];
  }

  /* 取前 10 条（最新）*/
  function getTopMessages() {
    var all = getMessages();
    if (all.length <= 10) return all.slice();
    return all.slice(-10);
  }

  /* 随机昵称颜色 */
  function randomAuthorColor() {
    return COLOR_POOL[Math.floor(Math.random() * COLOR_POOL.length)];
  }

  /* 获取空闲轨道 */
  function getFreeLane() {
    var maxLanes = Math.max(1, Math.floor(getStageHeight() / LANE_HEIGHT));
    /* 清理已过期的轨道占用 */
    var now = Date.now();
    for (var i = 0; i < activeLanes.length; i++) {
      if (activeLanes[i] && activeLanes[i] < now) {
        activeLanes[i] = null;
      }
    }
    if (activeLanes.length < maxLanes) {
      /* 扩展轨道数组 */
      for (var j = activeLanes.length; j < maxLanes; j++) {
        activeLanes.push(null);
      }
    }
    /* 找空闲轨道 */
    for (var k = 0; k < maxLanes; k++) {
      if (!activeLanes[k] || activeLanes[k] < now) {
        return k;
      }
    }
    /* 全部占用，返回随机 */
    return Math.floor(Math.random() * maxLanes);
  }

  /* 占用轨道（dur 秒） */
  function occupyLane(lane, durSec) {
    activeLanes[lane] = Date.now() + durSec * 1000 + 500;
  }

  function getStageHeight() {
    return $stage ? $stage.clientHeight : 280;
  }

  /* 发射一条弹幕 */
  function launch(msg) {
    if (!$stage) return;

    /* 标记该留言正在弹幕中 */
    var msgId = msg.id || (msg.author + '|' + msg.text);
    activeMsgIds[msgId] = true;

    var el = document.createElement('div');
    el.className = 'danmaku-msg';

    /* 随机昵称颜色 */
    var authorColor = randomAuthorColor();
    var author = msg.author || '匿名';
    var text = msg.text || '';

    el.innerHTML =
      '<span class="danmaku-msg__author" style="color:' + authorColor + '">'
      + U.escapeHtml(author) + '</span>：'
      + U.escapeHtml(text);

    /* 分配到空闲轨道 */
    var lane = getFreeLane();
    var top = lane * LANE_HEIGHT + 4;
    el.style.top = top + 'px';

    /* 随机速度（6-12 秒） */
    var dur = 7 + Math.random() * 6;
    el.style.animationDuration = dur + 's';

    /* 占用轨道 */
    occupyLane(lane, dur);

    /* 先插入测量宽度 */
    el.style.visibility = 'hidden';
    el.style.animationName = 'none';
    $stage.appendChild(el);
    var elWidth = el.offsetWidth;
    var stageWidth = $stage.clientWidth;
    /* 起始位置 = 容器宽度 + 元素宽度，确保从最右端外侧飞入 */
    var startX = stageWidth + elWidth + 10;

    /* 通过 CSS 变量传给 keyframes */
    el.style.setProperty('--start-x', startX + 'px');
    el.style.animationName = 'danmaku-fly';
    el.style.visibility = 'visible';

    /* 动画结束后移除，释放该留言 ID */
    el.addEventListener('animationend', function() {
      if (el.parentNode) el.parentNode.removeChild(el);
      delete activeMsgIds[msgId];
    });
  }

  /* 启动循环 */
  function start() {
    if (timer) clearTimeout(timer);

    function scheduleNext() {
      var msgs = getTopMessages();
      if ($count) {
        var total = getMessages().length;
        $count.textContent = total + ' 条留言';
      }

      /* 过滤掉正在弹幕中的留言 */
      var available = [];
      for (var i = 0; i < msgs.length; i++) {
        var mid = msgs[i].id || (msgs[i].author + '|' + msgs[i].text);
        if (!activeMsgIds[mid]) {
          available.push(msgs[i]);
        }
      }

      /* 如果全部都在弹幕中，等下一轮再发 */
      if (available.length > 0) {
        var msg = available[Math.floor(Math.random() * available.length)];
        launch(msg);
      }

      /* 间隔 1.8-4.5 秒 */
      var delay = 1800 + Math.random() * 2700;
      timer = setTimeout(scheduleNext, delay);
    }

    scheduleNext();
  }

  function refresh() {
    if (timer) clearTimeout(timer);
    activeMsgIds = {};
    activeLanes = [];
    start();
  }

  return {
    init: init,
    setMessageSource: setMessageSource,
    refresh: refresh,
  };

})();
