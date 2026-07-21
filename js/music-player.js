/* ============================================
   music-player.js — 音乐播放器模块
   ============================================ */

var MusicPlayer = (function() {
  'use strict';

  var U = AppUtils;
  var playlist = AppConfig.PLAYLIST.slice();
  var currentIndex = 0;
  var isPlaying = false;
  var currentTime = 0;
  var duration = playlist[0] ? playlist[0].duration : 0;
  var volume = 0.7;
  var progressTimer = null;

  /* ---- DOM 引用 ---- */
  var $trackName, $trackArtist, $cover, $progressFill, $currentTimeEl,
      $durationEl, $playIcon, $playlistDropdown, $lyricsText,
      $btnPlay, $btnPrev, $btnNext, $playlistToggle, $progressBar, $volumeSlider;

  function init() {
    /* 获取 DOM */
    $trackName       = U.el('trackName');
    $trackArtist     = U.el('trackArtist');
    $cover           = U.el('albumCover');
    $progressFill    = U.el('progressFill');
    $currentTimeEl   = U.el('currentTime');
    $durationEl      = U.el('duration');
    $playIcon        = U.el('playIcon');
    $playlistDropdown = U.el('playlistDropdown');
    $lyricsText      = U.el('lyricsText');
    $btnPlay         = U.el('btnPlay');
    $btnPrev         = U.el('btnPrev');
    $btnNext         = U.el('btnNext');
    $playlistToggle  = U.el('playlistToggle');
    $progressBar     = U.el('progressBar');
    $volumeSlider    = U.el('volumeSlider');

    /* 事件绑定 */
    $btnPlay.addEventListener('click', togglePlay);
    $btnPrev.addEventListener('click', prevTrack);
    $btnNext.addEventListener('click', nextTrack);
    $playlistToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      $playlistDropdown.classList.toggle('music-playlist--open');
    });
    document.addEventListener('click', function() {
      $playlistDropdown.classList.remove('music-playlist--open');
    });
    $playlistDropdown.addEventListener('click', function(e) {
      var item = e.target.closest('.music-playlist__item');
      if (item) {
        loadTrack(parseInt(item.getAttribute('data-index'), 10));
      }
    });
    $progressBar.addEventListener('click', seekByClick);

    /* 初始化 */
    buildPlaylistUI();
    loadTrack(0);
    startProgressSimulation();
  }

  /* ---- 加载歌曲 ---- */
  function loadTrack(index) {
    currentIndex = ((index % playlist.length) + playlist.length) % playlist.length;
    currentTime = 0;
    var track = playlist[currentIndex];
    duration = track.duration || 0;

    /* 接口：加载真实音频
       if (audioElement) {
         audioElement.src = track.src;
         if (isPlaying) audioElement.play();
       }
    */

    updateUI();
    buildPlaylistUI();
    updateLyrics(track);
  }

  /* ---- 播放/暂停 ---- */
  function togglePlay() {
    isPlaying = !isPlaying;

    /* 接口：控制真实音频
       if (isPlaying) { audioElement.play(); }
       else           { audioElement.pause(); }
    */

    updateUI();
  }

  /* ---- 上一首 / 下一首 ---- */
  function prevTrack() { loadTrack(currentIndex - 1); if (isPlaying) isPlaying = true; updateUI(); }
  function nextTrack() { loadTrack(currentIndex + 1); if (isPlaying) isPlaying = true; updateUI(); }

  /* ---- 进度条点击跳转 ---- */
  function seekByClick(e) {
    var rect = $progressBar.getBoundingClientRect();
    var pct = (e.clientX - rect.left) / rect.width;
    currentTime = Math.floor(Math.max(0, Math.min(1, pct)) * duration);
    /* 接口：audioElement.currentTime = currentTime; */
    updateUI();
  }

  /* ---- 更新 UI ---- */
  function updateUI() {
    var track = playlist[currentIndex];
    if (track) {
      $trackName.textContent = track.name;
      $trackArtist.textContent = track.artist || '—';
      $durationEl.textContent = U.formatTime(duration);
    }
    $currentTimeEl.textContent = U.formatTime(currentTime);
    var pct = duration > 0 ? (currentTime / duration) * 100 : 0;
    $progressFill.style.width = Math.min(pct, 100) + '%';
    $playIcon.textContent = isPlaying ? '⏸' : '▶';
  }

  /* ---- 更新歌词条 ---- */
  function updateLyrics(track) {
    if ($lyricsText && track) {
      $lyricsText.textContent = '♪ ' + track.name + ' — ' + (track.artist || '未知') + ' ♪';
    }
  }

  /* ---- 构建歌单 UI ---- */
  function buildPlaylistUI() {
    var html = '';
    for (var i = 0; i < playlist.length; i++) {
      var t = playlist[i];
      var cls = i === currentIndex ? ' music-playlist__item--active' : '';
      html += '<div class="music-playlist__item' + cls + '" data-index="' + i + '">'
        + U.escapeHtml(t.name) + ' — ' + U.escapeHtml(t.artist || '')
        + '</div>';
    }
    $playlistDropdown.innerHTML = html;
  }

  /* ---- 进度模拟（无真实音频时的演示）---- */
  function startProgressSimulation() {
    if (progressTimer) { clearInterval(progressTimer); }
    progressTimer = setInterval(function() {
      if (isPlaying) {
        currentTime += 1;
        if (currentTime >= duration) {
          currentTime = 0;
          nextTrack();
          return;
        }
        updateUI();
      }
    }, 1000);
  }

  return { init: init };

})();
