/* ============================================
   weather.js — 天气组件（白色卡片）
   数据源：UAPI (uapis.cn) — /api/v1/misc/weather
   每次打开自动定位，不记住手动设置的城市
   ============================================ */

var Weather = (function() {
  'use strict';

  var U = AppUtils;
  var apiConfig = AppConfig.UAPI;

  var $temp, $desc, $location, $details, $icon;
  var currentCity = '';

  /* ---- 初始化 ---- */
  function init() {
    $temp     = document.getElementById('weatherTemp');
    $desc     = document.getElementById('weatherDesc');
    $location = document.getElementById('weatherLocation');
    $details  = document.getElementById('weatherDetails');
    $icon     = document.querySelector('.weather-widget__icon');

    createCityModal();

    if ($location) {
      $location.addEventListener('click', function() {
        var txt = $location.textContent;
        if (txt === '📍点此定位' || txt === '点击定位' || txt === '定位中...') {
          geoAndDetect(function(city) {
            currentCity = city;
            $location.textContent = city;
            $location.setAttribute('title', '点击切换城市');
            fetchWeather(city);
          });
          return;
        }
        openCityModal();
      });
    }

    /* 启动自动定位 */
    geoAndDetect(function(city) {
      currentCity = city;
      if ($location) {
        $location.textContent = city;
        $location.setAttribute('title', '点击切换城市');
      }
      fetchWeather(city);
    });
  }

  /* ============================================
     定位策略：GPS → 逆地理 → IP → 默认
     ============================================ */
  function geoAndDetect(callback) {
    if (!navigator.geolocation) {
      detectByIP(callback);
      return;
    }

    if ($location) { $location.textContent = '定位中...'; }

    var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    /* iOS 先探权限，未授权不浪费 GPS 时间 */
    if (navigator.permissions && isIOS) {
      navigator.permissions.query({ name: 'geolocation' }).then(function(s) {
        if (s.state === 'granted') { doGPS(); }
        else { if ($location) $location.textContent = '📍点此定位'; detectByIP(callback); }
      }).catch(function() { doGPS(); });
    } else {
      doGPS();
    }

    function doGPS() {
      navigator.geolocation.getCurrentPosition(
        function(pos) {
          tryReverseGeocode(pos.coords.latitude, pos.coords.longitude, 0, function(city) {
            if (city) { callback(city); }
            else { detectByIP(callback); }
          });
        },
        function(err) {
          if (err.code === 1 && $location) { $location.textContent = '点击定位'; }
          detectByIP(callback);
        },
        { timeout: 10000, enableHighAccuracy: false, maximumAge: 300000 }
      );
    }
  }

  /* ---- 多服务逆地理（依次尝试，每个 3s 超时）---- */
  var GEO_SERVICES = [
    {
      name: 'Nominatim',
      /* zoom=8 确保返回城市级 */
      buildUrl: function(lat, lon) {
        return 'https://nominatim.openstreetmap.org/reverse'
          + '?format=json&lat=' + lat + '&lon=' + lon
          + '&accept-language=zh&zoom=8';
      },
      parse: function(data) {
        var a = data.address || {};
        return a.city || a.state_district || a.county || a.state || '';
      },
    },
    {
      name: 'BigDataCloud',
      buildUrl: function(lat, lon) {
        return 'https://api.bigdatacloud.net/data/reverse-geocode-client'
          + '?latitude=' + lat + '&longitude=' + lon
          + '&localityLanguage=zh';
      },
      parse: function(data) {
        return data.city || data.principalSubdivision || '';
      },
    },
  ];

  function tryReverseGeocode(lat, lon, index, callback) {
    if (index >= GEO_SERVICES.length) { return callback(null); }

    var svc = GEO_SERVICES[index];
    var ctrl = new AbortController();
    var timer = setTimeout(function() { ctrl.abort(); }, 3000);

    fetch(svc.buildUrl(lat, lon), {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: ctrl.signal,
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      clearTimeout(timer);
      var raw = svc.parse(data);
      if (raw) { raw = raw.replace(/[省市县区州]$/, '').trim(); }
      /* 过滤明显的区/街道名 */
      if (raw && raw.length <= 1) { raw = ''; }
      if (raw) { callback(raw); }
      else { tryReverseGeocode(lat, lon, index + 1, callback); }
    })
    .catch(function() {
      clearTimeout(timer);
      tryReverseGeocode(lat, lon, index + 1, callback);
    });
  }

  /* ---- IP 自动检测（UAPI 无 city 参数）---- */
  function detectByIP(callback) {
    var headers = {};
    var isProxy = apiConfig.baseUrl.indexOf('http') !== 0;
    if (!isProxy) { headers['Authorization'] = 'Bearer ' + apiConfig.apiKey; }

    fetch(apiConfig.baseUrl + '?extended=true', {
      method: 'GET', headers: headers,
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      /* 只用 data.city，不用 district（太细 UAPI 不认识）*/
      var city = (data.city || '').replace(/[省市县区州]$/, '').trim();
      callback(city || AppConfig.WEATHER_CITY || '南昌');
    })
    .catch(function() {
      callback(AppConfig.WEATHER_CITY || '南昌');
    });
  }

  /* ============================================
     自定义城市选择弹窗
     ============================================ */
  var $modal, $modalInput;

  function createCityModal() {
    $modal = document.createElement('div');
    $modal.className = 'city-modal';
    $modal.innerHTML =
      '<div class="city-modal__backdrop"></div>'
      + '<div class="city-modal__dialog">'
      +   '<div class="city-modal__title">切换城市</div>'
      +   '<div class="city-modal__hint">支持中/英文 · 刷新后恢复自动定位</div>'
      +   '<input type="text" class="city-modal__input" placeholder="北京、上海、Tokyo..." maxlength="30">'
      +   '<div class="city-modal__actions">'
      +     '<button class="city-modal__btn city-modal__btn--cancel">取消</button>'
      +     '<button class="city-modal__btn city-modal__btn--confirm">确认</button>'
      +   '</div>'
      + '</div>';
    document.body.appendChild($modal);

    $modalInput = $modal.querySelector('.city-modal__input');
    var $confirm  = $modal.querySelector('.city-modal__btn--confirm');
    var $cancel   = $modal.querySelector('.city-modal__btn--cancel');
    var $backdrop = $modal.querySelector('.city-modal__backdrop');

    function close() { $modal.classList.remove('city-modal--open'); }
    $cancel.addEventListener('click', close);
    $backdrop.addEventListener('click', close);

    $confirm.addEventListener('click', function() {
      var c = $modalInput.value.trim();
      if (c) {
        currentCity = c;
        if ($location) { $location.textContent = c; }
        fetchWeather(c);
        close();
      }
    });
    $modalInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') { $confirm.click(); }
      if (e.key === 'Escape') { close(); }
    });
  }

  function openCityModal() {
    $modalInput.value = currentCity || '';
    $modal.classList.add('city-modal--open');
    setTimeout(function() { $modalInput.focus(); }, 150);
  }

  /* ============================================
     API & UI
     ============================================ */
  function fetchWeather(city) {
    showLoading();

    var url = apiConfig.baseUrl
      + '?city=' + encodeURIComponent(city)
      + '&extended=true';

    var headers = {};
    var isProxy = apiConfig.baseUrl.indexOf('http') !== 0;
    if (!isProxy) { headers['Authorization'] = 'Bearer ' + apiConfig.apiKey; }

    fetch(url, { method: 'GET', headers: headers })
    .then(function(r) {
      if (!r.ok) {
        return r.json().then(function(e) {
          throw new Error(e.message || 'HTTP ' + r.status);
        });
      }
      return r.json();
    })
    .then(function(data) { update(data); })
    .catch(function(err) {
      console.error('[天气] 获取失败:', err.message);
      showError(err.message);
    });
  }

  function update(data) {
    if ($temp) {
      $temp.textContent = (data.temperature != null ? data.temperature : '--') + '°';
    }
    if ($desc) {
      $desc.textContent = data.weather || '—';
    }
    if ($icon && data.weather_icon) {
      $icon.setAttribute('data-weather-code', data.weather_icon);
    }
    if (data.city && $location) {
      currentCity = data.city.replace(/[省市县区州]$/, '');
      $location.textContent = currentCity;
    }
    if ($details) {
      var h = data.humidity != null ? data.humidity + '%' : '--';
      var w = data.wind_direction
        ? data.wind_direction + ' ' + (data.wind_power || '')
        : '--';
      var f = data.feels_like != null ? data.feels_like + '°' : '--';
      var html =
        '<span>💧 湿度 ' + U.escapeHtml(h) + '</span>'
        + '<span>💨 ' + U.escapeHtml(w) + '</span>'
        + '<span>🌡 体感 ' + U.escapeHtml(f) + '</span>';
      if (data.aqi != null) {
        html += ' <span>🍃 AQI ' + data.aqi + ' ' + U.escapeHtml(data.aqi_category || '') + '</span>';
      }
      $details.innerHTML = html;
    }
    console.log('[天气] 更新成功:', data.city, data.weather, data.temperature + '°C');
  }

  function showLoading() {
    if ($temp) { $temp.textContent = '--°'; }
    if ($desc) { $desc.textContent = '加载中...'; }
  }

  function showError(msg) {
    if ($temp) { $temp.textContent = '--°'; }
    if ($desc) { $desc.textContent = '获取失败'; }
    if ($details) {
      $details.innerHTML = '<span style="color:#e74c3c;">⚠ ' + U.escapeHtml(msg) + '</span>';
    }
  }

  return { init: init, update: update, fetchWeather: fetchWeather };

})();
