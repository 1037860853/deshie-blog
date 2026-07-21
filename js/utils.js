/* ============================================
   utils.js — 工具函数
   ============================================ */

var AppUtils = (function() {
  'use strict';

  /**
   * HTML 转义
   */
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * 时间格式化 mm:ss
   */
  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) { return '00:00'; }
    var m = Math.floor(seconds / 60);
    var s = Math.floor(seconds % 60);
    return (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
  }

  /**
   * 数字补零
   */
  function pad(n) {
    return n < 10 ? '0' + n : '' + n;
  }

  /**
   * 获取当前时间字符串
   */
  function nowTimeString() {
    var now = new Date();
    return now.getFullYear() + '-' +
      pad(now.getMonth() + 1) + '-' +
      pad(now.getDate()) + ' ' +
      pad(now.getHours()) + ':' +
      pad(now.getMinutes());
  }

  /**
   * 获取设备信息
   */
  function getDeviceInfo() {
    var ua = navigator.userAgent;
    var os = 'Unknown';
    var browser = 'Unknown';

    /* 操作系统 */
    if (ua.indexOf('Windows') !== -1)        { os = 'Windows'; }
    else if (ua.indexOf('Mac') !== -1)       { os = 'macOS'; }
    else if (ua.indexOf('Linux') !== -1)     { os = 'Linux'; }
    else if (ua.indexOf('Android') !== -1)   { os = 'Android'; }
    else if (ua.indexOf('iPhone') !== -1 ||
             ua.indexOf('iPad') !== -1)      { os = 'iOS'; }

    /* 浏览器 */
    if (ua.indexOf('Edg/') !== -1)           { browser = 'Edge'; }
    else if (ua.indexOf('Chrome') !== -1)    { browser = 'Chrome'; }
    else if (ua.indexOf('Safari') !== -1)    { browser = 'Safari'; }
    else if (ua.indexOf('Firefox') !== -1)   { browser = 'Firefox'; }
    else if (ua.indexOf('WeChat') !== -1)    { browser = 'WeChat'; }
    else if (ua.indexOf('QQ/') !== -1)       { browser = 'QQ'; }

    return os + ' / ' + browser;
  }

  /**
   * 检查元素是否存在于 DOM
   */
  function el(id) {
    return document.getElementById(id);
  }

  /**
   * 防抖
   */
  function debounce(fn, delay) {
    var timer = null;
    return function() {
      var ctx = this;
      var args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function() { fn.apply(ctx, args); }, delay);
    };
  }

  return {
    escapeHtml: escapeHtml,
    formatTime: formatTime,
    pad: pad,
    nowTimeString: nowTimeString,
    getDeviceInfo: getDeviceInfo,
    el: el,
    debounce: debounce,
  };

})();
