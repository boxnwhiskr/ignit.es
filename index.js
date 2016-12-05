var DEFAULT_LONLAT = [126.9746921, 37.5728438];

var map;

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

  getCurrentPosition(function (lonlat) {
    map.getView().setCenter(ol.proj.fromLonLat(lonlat));
  });
}


function getCurrentPosition(callback) {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(function (position) {
      callback([position.coords.longitude, position.coords.latitude]);
    });
  } else {
    callback([126.9746921, 37.5728438]);
  }
}


main();
