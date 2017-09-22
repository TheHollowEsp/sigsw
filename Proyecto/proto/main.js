var map;
var infowindow;
var centro;
var markerActual = null;
var bandera = 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png';


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

    var kmlLayer = new google.maps.KmlLayer({
        url: 'https://www.google.com/maps/d/kml?mid=1WO-FP4tIazhob0X4DMuNwCR6DIs&forcekml=1',
        suppressInfoWindows: true, // Permite mostrar nuestros iconos (fotos incluidas)
        map: map
    });

    google.maps.event.addListener(kmlLayer, 'click', function (event) {
        if (markerActual) markerActual.setMap(null);
        markerActual = situarMarcador(event.latLng);
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
        icon: bandera,
        draggable: true,
        map: map
    });
    var html = "<div id='content'>\n" +
        "  <div id='siteNotice'></div>\n" +
        "  <h1 id='firstHeading' class='firstHeading'>Corredor</h1>\n" +
        "  <div id='bodyContent'>\n" +
        "    <div>\n" +
        "      <form id='inform' enctype='multipart/form-data' onsubmit='return submitFoto()'>\n" +
        "        <table><tbody>" +
        "        <tr><td align='right'><label class='uk-form-label' for='name'>Nombre: </label> </td>\n" +
        "        <td><input class='uk-input' id='name' type='text' size='12' />\n" +
        "        </tr>" +
        "        <tr><td align='right'>" +
        "        <label class='uk-form-label' for='title'>Title: </label> </td>\n" +
        "        <td><input class='uk-input' id='title' type='text' size='12' /> </td>\n" +
        "        </tr><tr><td align='right'>" +
        "        <label class='uk-form-label' for='file'>Photo: </label> </td>\n" +
        "        <td><input class='uk-input' type='file' id='inputFile' /> </td>\n" +
        "        </tr><tr><td align='right'></td><td><input id='submit' value='Add' type='submit'></td></tr>" +
        "        <tr><td align='right'></td><td><img id='image_upload_preview' style='max-width: 150px; max-height:150px;' src='http://placehold.it/100x100' alt='your image' /></td></tr>" +
        "        </tbody></table>" +
        "      </form>\n" +
        "    </div>\n" +
        "  </div>\n" +
        "</div>";
    if (infowindow) infowindow.close();
    infowindow = new google.maps.InfoWindow({
        content: html, maxWidth: 400
    });
    infowindow.open(map, marker);
    $("#inputFile").change(function () {
        readURL(this);
    });
    marker.addListener('click', function() {
        infowindow.open(map, marker);
    });
    return marker;
}

function submitFoto() {
    // Subir foto
    return false;
}

function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            $('#image_upload_preview').attr('src', e.target.result);
        };
        reader.readAsDataURL(input.files[0]);
    }
}



