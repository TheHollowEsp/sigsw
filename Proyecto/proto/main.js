var map;
var centro;
var markerActual = null;

// Inits de WMS
var WMS_URL = 'http://www.ign.es/wms-inspire/ign-base?';
var WMS_layer1 = 'EL.ContourLine';
var WMS_layer2 = 'caminos';
var WMS_layer3 = 'PS.ProtectedSite';
var WMS_layer4 = 'GN.GeographicalNames';

function initMap() {
    centro = new google.maps.LatLng(43.370840, -5.842143);
    var misOpciones = {
        center: centro, // Obligatorio, objeto LatLng (grados decimales)
        zoom: 14, // Obligatorio, de 0/1 a 20
        mapTypeId: google.maps.MapTypeId.TERRAIN, // Opcional, ROADMAP, SATELLITE, HYBRID o TERRAIN
        streetViewControl: false,
        fullscreenControl: false,
        mapTypeControl: false
    };
    map = new google.maps.Map(document.getElementById("map_frame"), misOpciones);

    google.maps.event.addListener(map, 'click', function (event) {
        if (markerActual) markerActual.setMap(null);
        markerActual = situarMarcador(event.latLng);
    });

    var kmlLayer = new google.maps.KmlLayer({
        url: 'https://www.google.com/maps/d/kml?mid=1WO-FP4tIazhob0X4DMuNwCR6DIs&forcekml=1',
        suppressInfoWindows: false, // Permite mostrar nuestros iconos (fotos incluidas)
        map: map
    });

    var overlayOptions = {
        getTileUrl: TileWMS, // Invoca a la funcion que pide la capa WMS
        tileSize: new google.maps.Size(256, 256)
    };
    var overlayWMS = new google.maps.ImageMapType(overlayOptions); // Creamos el overlay
    map.overlayMapTypes.push(overlayWMS); // Ponemos el overlay en el mapa


    $("input:checkbox").change( // Si se marca o desmarca un checkbox de WMS, ponemos o quitamos el contenido y recargamos
        function () {
            if ($(this).is(':checked')) {
                if ($(this).attr("id") === "toggleCurvas") {
                    WMS_layer1 = 'EL.ContourLine';
                } else if ($(this).attr("id") === "toggleCaminos") {
                    WMS_layer2 = 'caminos';
                } else if ($(this).attr("id") === "toggleProtected") {
                    WMS_layer3 = 'PS.ProtectedSite';
                } else if ($(this).attr("id") === "toggleNombres") {
                    WMS_layer4 = 'GN.GeographicalNames';
                }
            } else {
                if ($(this).attr("id") === "toggleCurvas") {
                    WMS_layer1 = '';
                } else if ($(this).attr("id") === "toggleCaminos") {
                    WMS_layer2 = '';
                } else if ($(this).attr("id") === "toggleProtected") {
                    WMS_layer3 = '';
                } else if ($(this).attr("id") === "toggleNombres") {
                    WMS_layer4 = '';
                }
            }
            map.overlayMapTypes.removeAt(0); // Quitamos el overlay
            map.overlayMapTypes.push(overlayWMS); // Lo recargamos con las capas actualizadas
        });


}


/**
 * @return {string}
 */
var TileWMS = function (coord, zoom) { // Crea la URL de llamada obteniendo datos del mapa y juntando los que le seteamos
    var proj = map.getProjection();
    var zfactor = Math.pow(2, zoom);
    var top = proj.fromPointToLatLng(new google.maps.Point(coord.x * 256 / zfactor, coord.y * 256 / zfactor));
    var bot = proj.fromPointToLatLng(new google.maps.Point((coord.x + 1) * 256 / zfactor, (coord.y + 1) * 256 / zfactor));
    var bbox = top.lng() + "," + bot.lat() + "," + bot.lng() + "," + top.lat();

    var layers = $.grep([WMS_layer1, WMS_layer2, WMS_layer3, WMS_layer4], Boolean).join(","); // Une las variables no vacias separandolas por comas
    var myURL = WMS_URL + "SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&SRS=EPSG%3A4326&WIDTH=256&HEIGHT=256&FORMAT=image/png&TRANSPARENT=TRUE";
    myURL += "&LAYERS=" + layers;
    myURL += "&BBOX=" + bbox;
    return myURL;
};

function situarMarcador(localizacion) { // Crea un marcador y lo pone
    var marker = new google.maps.Marker({
        position: localizacion,
        animation: google.maps.Animation.DROP,
        title: "Tu selección",
        map: map
    });
    marker.addListener('click', markerClick); // Listener de click para funcion markerClick()
    return marker;
}

function markerClick() {  // Aqui poner la funcion para guardar foto, provisional
    if (markerActual.getAnimation() !== null) {
        markerActual.setAnimation(null);
    } else {
        markerActual.setAnimation(google.maps.Animation.BOUNCE);
    }
}






