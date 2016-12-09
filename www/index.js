var DEFAULT_LONLAT = [126.9746921, 37.5728438];

var map;
var lonlat = DEFAULT_LONLAT;

function main() {
    map = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat(DEFAULT_LONLAT),
            zoom: 16
        })
    });

    getCurrentPosition(function (newLonlat) {
        map.getView().setCenter(ol.proj.fromLonLat(newLonlat));
        lonlat = newLonlat;

        var igniteEl = document.getElementById('ignite');
        igniteEl.addEventListener('click', function (e) {
            e.preventDefault();

            var binnedLonlat = getBinnedLonlat(lonlat);
            ga('set', 'dimension1', binnedLonlat[0]);
            ga('set', 'dimension2', binnedLonlat[1]);
            ga('send', 'event', 'data', 'click', 'ignite');
        });
    });
}


function getBinnedLonlat(lonlat) {
    var bin = 50;
    return [((lonlat[0] * bin)|0) / bin, ((lonlat[1] * bin)|0) / bin]
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


main();
