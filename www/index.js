var DEFAULT_LONLAT = [126.9746921, 37.5728438];

var map;
var lonlat = DEFAULT_LONLAT;

function main() {
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
        source: new ol.source.OSM({'url': 'http://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'})
    });

    map = new ol.Map({
        target: 'map',
        layers: [tile, heatmap],
        view: new ol.View({
            center: ol.proj.fromLonLat(DEFAULT_LONLAT),
            zoom: 12
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

            var binnedLonlat = getBinnedLonlat(lonlat);
            ga('set', 'dimension1', binnedLonlat[0]);
            ga('set', 'dimension2', binnedLonlat[1]);
            ga('send', 'event', 'data', 'click', 'ignite');
        });
    });
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


function onData(data) {

}

main();
