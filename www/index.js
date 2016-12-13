var DEFAULT_LONLAT = [126.9746921, 37.5728438];

var map;
var heatmap;
var lonlat = DEFAULT_LONLAT;

var ignitedUntil = 0;
var oldCount;
var curCount;


function main() {
  // Initialize candle counter
  fetchCounter();
  updateCounter();

  // Initialize map
  heatmap = new ol.layer.Heatmap({
    source: new ol.source.Vector({
      url: 'data/today.kml',
      format: new ol.format.KML({
        extractStyles: false
      })
    }),
    blur: 20,
    radius: 10,
    gradient: ['#000088', '#FF0000', '#FFFF00', '#FFFFFF']
  });
  heatmap.getSource().on('addfeature', function (event) {
    // Assign magnitude
    var name = event.feature.get('name');
    var magnitude = parseFloat(name);
    event.feature.set('weight', magnitude);

    // Jitter
    var geometry = event.feature.get('geometry');
    var coordinate = geometry.getCoordinates();
    geometry.setCoordinates(jitter(coordinate, 1000.0));
    event.feature.set('geometry', geometry);
  });
  var tile = new ol.layer.Tile({
    source: new ol.source.OSM({
      'url': '//cartodb-basemaps-{a-c}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png'
    })
  });

  map = new ol.Map({
    target: 'map',
    layers: [tile, heatmap],
    view: new ol.View({
      center: ol.proj.fromLonLat(DEFAULT_LONLAT),
      zoom: 12,
      minZoom: 2,
      maxZoom: 12
    }),
    interactions: ol.interaction.defaults({
      altShiftDragRotate: false,
      pinchRotate: false
    })
  });

  getCurrentPosition(function (newLonlat) {
    map.getView().setCenter(ol.proj.fromLonLat(newLonlat));
    lonlat = newLonlat;

    var igniteEl = document.getElementById('ignite');
    igniteEl.addEventListener('click', function (e) {
      e.preventDefault();
      onIgniteClick();
    });
  });

  var data = JSON.parse(getCookie('ignited') || '{}');
  if (data.expDate) {
    document.getElementById('ignite').setAttribute('class', 'ignited');
    ignitedUntil = data.expDate;
    ignite(data.lonlat, 1);
  }

  updateTimer();
}

function ignite(lonlat, count) {
  var point = new ol.geom.Point(ol.proj.fromLonLat(lonlat));
  var feature = new ol.Feature({
    'name': '' + count,
    'geometry': point
  });
  heatmap.getSource().addFeature(feature);
}

function getBinnedLonlat(lonlat) {
  var bin = 50;
  var center = (1 / bin / 2);
  return [
    ((lonlat[0] * bin) | 0) / bin + center,
    ((lonlat[1] * bin) | 0) / bin + center
  ];
}

function getCurrentPosition(callback) {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(function (position) {
      callback([position.coords.longitude, position.coords.latitude]);
    }, function () {
      document.body.setAttribute('class', 'nogeo');
      callback(DEFAULT_LONLAT);
    });
  } else {
    document.body.setAttribute('class', 'nogeo');
    callback(DEFAULT_LONLAT);
  }
}

function onIgniteClick() {
  var ignited = getCookie('ignited') !== null;
  if (ignited) return;

  var binnedLonlat = getBinnedLonlat(lonlat);
  ga('set', 'dimension1', binnedLonlat[0]);
  ga('set', 'dimension2', binnedLonlat[1]);
  ga('send', 'event', 'data', 'click', 'ignite');
  new Image().src = 'ignited?z=' + ((Math.random() * 1000000) | 0);

  var expInSec = 60 * 60;
  var expDate = new Date(Date.now() + expInSec * 1000);

  var data = {
    'lonlat': binnedLonlat,
    'expDate': expDate.getTime()
  };
  setCookie('ignited', JSON.stringify(data), expInSec);
  document.getElementById('ignite').setAttribute('class', 'ignited');
  ignitedUntil = expDate.getTime();

  ignite(binnedLonlat, 1);
}

function getCookie(name) {
  var pairs = document.cookie.split('; ');
  for (var i = 0; i < pairs.length; i++) {
    var kv = pairs[i].split('=');
    if (kv[0] === name) return decodeURIComponent(kv[1]);
  }
  return null;
}

function setCookie(name, value, expiresInSec, path, domain, secure) {
  var cookieStr = name + "=" + encodeURIComponent(value) + "; ";

  if (expiresInSec) {
    var expDate = new Date(Date.now() + expiresInSec * 1000);
    cookieStr += "expires=" + expDate.toUTCString() + "; ";
  }
  if (path) {
    cookieStr += "path=" + path + "; ";
  }
  if (domain) {
    cookieStr += "domain=" + domain + "; ";
  }
  if (secure) {
    cookieStr += "secure; ";
  }
  document.cookie = cookieStr;
}

function updateTimer() {
  var minute = 60;
  var second = 0;
  var now = Date.now();
  if (now > ignitedUntil) {
    document.querySelector('#ignite').setAttribute('class', '');
  } else {
    var totalSec = ((ignitedUntil - now) / 1000) | 0;
    second = totalSec % 60;
    minute = (totalSec / 60) | 0;
  }

  var minuteStr = '0' + minute;
  var secondStr = '0' + second;

  var untilEl = document.querySelector('#ignite .until');
  untilEl.innerHTML = (
    minuteStr.substr(minuteStr.length - 2) + ':' +
    secondStr.substr(secondStr.length - 2)
  );

  window.setTimeout(updateTimer, 100);
}

function fetchCounter() {
  var queue = d3.queue();
  queue
    .defer(d3.json, 'data/old_count.json')
    .defer(d3.json, 'data/cur_count.json')
    .awaitAll(function (err, data) {
      oldCount = data[0];
      curCount = data[1];
    });

  window.setTimeout(fetchCounter, 1000 * 29);
}

function updateCounter() {
  if (curCount) {
    var percent = new Date().getSeconds() / 60;
    var noise = Math.random() * 0.2 - 0.1;
    var estimate = oldCount.hour + (curCount.hour - oldCount.hour) * (percent + noise);
    if (ignitedUntil) {
      estimate += 1;
    }
    document.querySelector('.counter .current').innerHTML = Math.round(estimate);
  }

  var nextUpdate = estimate ? 1000 + (1 - Math.min(10000, estimate) / 10000) * 30000 : 1000;
  window.setTimeout(updateCounter, nextUpdate);
}

/**
 * Add small and deterministic noise to given coordinate
 */
function jitter(coordinate, scale) {
  var seed = coordinate[0] ^ coordinate[1];
  var noisex = ((seed + coordinate[0]) % 29) / 29 - 0.5;
  var noisey = ((seed + coordinate[1]) % 31) / 31 - 0.5;
  return [coordinate[0] + noisex * scale, coordinate[1] + noisey * scale];
}

main();
