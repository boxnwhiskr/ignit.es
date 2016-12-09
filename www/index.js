var DEFAULT_LONLAT = [126.9746921, 37.5728438];

var map;
var lonlat = DEFAULT_LONLAT;
var ignitedUntil = 0;

function main() {
    if(isFacebookApp()) {
        document.body.setAttribute('fb');
        return;
    }

    var heatmap = new ol.layer.Heatmap({
        source: new ol.source.Vector({
            url: 'today.kml',
            format: new ol.format.KML({
                extractStyles: false
            })
        }),
        blur: 20,
        radius: 10
    });
    heatmap.getSource().on('addfeature', function (event) {
        var name = event.feature.get('name');
        var magnitude = parseFloat(name);
        event.feature.set('weight', magnitude);
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
            minZoom: 3,
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

    var expInSec = getCookie('ignited');
    if (expInSec !== null) {
        document.getElementById('ignite').setAttribute('class', 'ignited');
        ignitedUntil = +expInSec;
    }

    update();
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
        });
    } else {
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
    new Image().src='ignited';

    var expInSec = 60 * 60;
    var expDate = new Date(Date.now() + expInSec * 1000);

    setCookie('ignited', expDate.getTime(), expInSec);
    document.getElementById('ignite').setAttribute('class', 'ignited');
    ignitedUntil = expDate.getTime();
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


function update() {
    var minute = 60;
    var second = 0;
    var now = Date.now();
    if(now > ignitedUntil) {
        document.querySelector('#ignite').setAttribute('class', '');
    } else {
        var totalSec = ((ignitedUntil - now) / 1000)|0;
        second = totalSec % 60;
        minute = (totalSec / 60)|0;
    }

    var minuteStr = '0' + minute;
    var secondStr = '0' + second;

    var untilEl = document.querySelector('#ignite .until');
    untilEl.innerHTML = (
        minuteStr.substr(minuteStr.length - 2) + ':' +
        secondStr.substr(secondStr.length - 2)
    );

    window.setTimeout(update, 100);
}


function isFacebookApp() {
    var ua = navigator.userAgent || navigator.vendor || window.opera;
    return (ua.indexOf("FBAN") > -1) || (ua.indexOf("FBAV") > -1);
}


main();
