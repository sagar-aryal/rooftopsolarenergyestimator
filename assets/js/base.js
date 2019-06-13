/**
 * Created by iam on 12/01/19.
 */
var geocoder;

var lat = 85.32247;
var lon = 27.68248;

var autocomplete;

function initAutocomplete() {
    var options = {
        // use types for selecting support type for locations
        //types: ['(regions)'] ,
        componentRestrictions: {country: "np"}
    };
    var input = document.getElementById('address');
    autocomplete = new google.maps.places.Autocomplete(input, options);
    autocomplete.addListener('place_changed', notFoundCondition);
}


function  notFoundCondition() {
    var place = autocomplete.getPlace();
    if (!place.geometry) {
        // User entered the name of a Place that was not suggested and
        // pressed the Enter key, or the Place Details request failed.
        window.alert("No details available for input: '" + place.name + "'");
        return;
    }
}

function codeAddress() {
   geocoder = new google.maps.Geocoder();
    var address = document.getElementById("address").value;
    geocoder.geocode( { 'address': address, 'region': 'np'}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        var inp=results[0].geometry.location;

		var lat = results[0].geometry.location.lat();
		var lon = results[0].geometry.location.lng();

          console.log(address + " " + lat + " " + lon) ;

          map.setView(new ol.View({
              maxZoom:19,
              minZoom: 17,
              projection: 'EPSG:3857',
              center:  ol.proj.transform([parseFloat(lon), parseFloat(lat)],
                  'EPSG:4326', 'EPSG:900913'),
              zoom: map.getView().getZoom()
          }));

          var zoom = map.getView().getZoom();
          console.log(zoom);

      } else {
        alert("The searched location was not found.");
      }
    });
}


var polyXPoints = [],polyYPoints=[];

var styles = [

    new ol.style.Style({
        stroke: new ol.style.Stroke({
            color:  'rgb(12, 231, 216)',
            width: 1
        })
    }),
    new ol.style.Style({
        image: new ol.style.Circle({
            radius: 2,
            fill: new ol.style.Fill({
                color: 'orange'
            })
        })
    })
];

var map = new ol.Map({
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM({
                "url" : "https://tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=de197060b5e64dd0aea6fbfbe9eb2efc"
            })
        })
    ],
    target: 'basicMap',
    controls: ol.control.defaults({
        attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
            collapsible: false
        })
    }),
    view: new ol.View({
        center: ol.proj.transform([lat, lon], 'EPSG:4326', 'EPSG:900913'),
        maxZoom:19,
        minZoom: 17,
        zoom: 18,
        projection: 'EPSG:3857'
    })
});

var vectorSource = new ol.source.Vector();
var vectorLayer = new ol.layer.Vector({
    source:vectorSource,
    style: styles
});
map.addLayer(vectorLayer);


var startDraw = document.getElementById('drawPoly');
var resetDraw = document.getElementById('resetMap');


startDraw.addEventListener('click', function(e) {
    
    var first=0;
    map.once('postcompose', function(event) {
        var canvas = event.context.canvas;
        var destiCanvas = document.getElementById("destinationCanvas");
        destiCanvas.width = canvas.width;
        destiCanvas.height = canvas.height;
        var destiContext = destiCanvas.getContext("2d");
        // destiContext.drawImage(canvas, 0, 0);
        destiContext.drawImage(canvas, 0, 0, 958.328, canvas.height * (958.328/canvas.width));

        $(".ol-unselectable").attr("id","sourceCanvas");
        $("#sourceCanvas").addClass("hide");
        $("#destinationCanvas").removeClass("hide");

        $("#destinationCanvas").on("mousedown",function(e){
            if(first==0){
                destiContext.clearRect(0, 0, canvas.width, canvas.height);
                destiContext.drawImage(canvas, 0, 0, 958.328, canvas.height * (958.328/canvas.width));
                first++;
            }
            var offset = $(this).offset();
            var x =e.pageX - offset.left;
            var y = e.pageY - offset.top;
            destiContext.fillStyle = "#000000";
            destiContext.beginPath();
            destiContext.arc( x, y, 2, 0, 2*Math.PI);
            destiContext.fill();
            polyXPoints.push(Math.round(x));
            polyYPoints.push(Math.round(y));
            var polyLength = polyXPoints.length;
            if(polyXPoints.length>=2){
                destiContext.beginPath();
                destiContext.moveTo(polyXPoints[polyLength-2],polyYPoints[polyLength-2]);
                destiContext.lineTo(polyXPoints[polyLength-1],polyYPoints[polyLength-1]);
                destiContext.stroke();
            }
        });

    });
    map.renderSync();
}, false);

resetDraw.addEventListener('click', function(e) {
    $("#resultRow").hide();
    $("#destinationCanvas").addClass("hide");
    $("#sourceCanvas").removeClass("hide");
    polyXPoints=[];
    polyYPoints=[];

    $("#processButton").prop('disabled', true);
});




function uploadImageData(){

    if(polyXPoints.length == 0 && polyYPoints == 0){
                initializeInitial()
            }

    startProcess(polyXPoints,polyYPoints);
    disposeAllVariable();
    polyXPoints = [];
    polyYPoints=[];
}

function initializeInitial(){
    console.log("Initializing Points with default values.");
    var canvas = document.getElementById("destinationCanvas");
    var cWidth = canvas.width;
    var cHeight = canvas.height;
    polyXPoints = [0,cWidth,cWidth,0];
    polyYPoints = [0,0,cHeight,cHeight];
}


$("#myBtn").click(function(){
        $("#myModal").modal();
    });
$("#resultRow").hide();
$("#processButton").prop('disabled', true);


function startTour() {
    var tour = introJs();
    tour.setOption('tooltipPosition', 'auto');
    tour.setOption('positionPrecedence', ['left', 'right', 'bottom', 'top'])
    tour.start()
}

//clear search input
$('.has-clear input[type="text"]').on('input propertychange', function() {
    var $this = $(this);
    var visible = Boolean($this.val());
    $this.siblings('.form-control-clear').toggleClass('hidden', !visible);
}).trigger('propertychange');

$('.form-control-clear').click(function() {
    $(this).siblings('input[type="text"]').val('')
        .trigger('propertychange').focus();
});



