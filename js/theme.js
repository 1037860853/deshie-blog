/* ============================================
   theme.js — 深色模式切换
   ============================================ */

var Theme = (function() {
  'use strict';

  var STORAGE_KEY = 'deshie-theme';
  var $btn;

  function init() {
    /* 创建切换按钮 */
    $btn = document.createElement('button');
    $btn.className = 'theme-toggle';
    $btn.title = '切换深色/浅色模式';
    document.body.appendChild($btn);

    /* 读取存储 */
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      $btn.textContent = '☀️';
    } else {
      document.documentElement.removeAttribute('data-theme');
      $btn.textContent = '🌙';
    }

    $btn.addEventListener('click', toggle);
  }

  function toggle() {
    var current = document.documentElement.getAttribute('data-theme');
    if (current === 'dark') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem(STORAGE_KEY, 'light');
      $btn.textContent = '🌙';
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem(STORAGE_KEY, 'dark');
      $btn.textContent = '☀️';
    }
  }

  return { init: init, toggle: toggle };

})();
