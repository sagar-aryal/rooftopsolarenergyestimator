

var usedLabel = [],polygonPoints = [];
var parentChild = {},matrix = {};

function startProcess(polyXPoints,polyYPoints){
    for(var k=0;k<polyXPoints.length;k++){
        var poly =[];
        poly.push(polyXPoints[k]);
        poly.push(polyYPoints[k]);
        polygonPoints.push(poly);
    }

    var canvas = document.getElementById("destinationCanvas");
    var canvasContext = canvas.getContext('2d');
    var imgPixels = canvasContext.getImageData(0, 0, canvas.width, canvas.height);

    var neighBorPixels = [[-1,-1],[0,-1],[1,-1],[-1,1],[1,0],[-1,1],[0,1],[1,1]];


    for(var y = 0; y < imgPixels.height; y++){
        for(var x = 0; x < imgPixels.width; x++){
            var point = [x,y];
            if(inside(point,polygonPoints)){
                var i = (y * 4) * imgPixels.width + x * 4;
                var avg = Math.round((imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) / 3);
                if(avg==239){
                    var goodNeighbor = true;
                    for(var n=0;n<neighBorPixels.length;n++){
                        var newX = x+neighBorPixels[n][0];
                        var newY = y+neighBorPixels[n][1];
                        var j = (newY * 4) * imgPixels.width + newX * 4;
                        avg = Math.round((imgPixels.data[j] + imgPixels.data[j + 1] + imgPixels.data[j + 2]) / 3);
                        if(avg!=239){
                            goodNeighbor = false;
                            break;
                        }
                    }
                    if(goodNeighbor){
                        matrix[x + "," + y] = 1;
                    }else{
                        matrix[x + "," + y] = 0;
                    }
                }
            }else{
                matrix[x + "," + y] = 0;
            }
        }
    }
    canvasContext.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
    $("#originalImage").attr("src",canvas.toDataURL("image/png"));
    $("#totalBuildings").val(getBuildingCount(canvas));
    $("#destinationCanvas").addClass("hide");
    $("#sourceCanvas").removeClass("hide");
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
}


function getBuildingCount(canvas) {

    var canvasContext = canvas.getContext('2d');
    var imgPixels = canvasContext.getImageData(0, 0, canvas.width, canvas.height);

    var imageAlgo = new ImageAlgorithm(imgPixels.width,imgPixels.height,matrix);
    var erosionMatrix = imageAlgo.erosion();
    var dilationMatrix = imageAlgo.dilation(erosionMatrix);
    var pCount = 0;

    for (var y = 0; y < imgPixels.height; y++) {
        for (var x = 0; x < imgPixels.width; x++) {
            var i = (y * 4) * imgPixels.width + x * 4;
            if(dilationMatrix[x + "," + y] == 1){
                imgPixels.data[i] = 255;
                imgPixels.data[i + 1] = 255;
                imgPixels.data[i + 2] = 255;
                matrix[x + "," + y] = 1;
                pCount++
            } else {
                imgPixels.data[i] = 0;
                imgPixels.data[i + 1] = 0;
                imgPixels.data[i + 2] = 0;
                matrix[x + "," + y] = 0;
            }
        }
    }

    for(var y = 0; y < imgPixels.height; y++) {
        for (var x = 0; x < imgPixels.width; x++) {
            if (matrix[x+","+y] == 1) {
                var first = getMatrixVal(x - 1, y - 1);
                var second = getMatrixVal(x, y - 1);//top
                var third = getMatrixVal(x + 1, y - 1);
                var fourth = getMatrixVal(x - 1, y);//left
                var fifth = getMatrixVal(x + 1, y);
                var sixth = getMatrixVal(x - 1, y + 1);
                var seventh = getMatrixVal(x, y + 1);
                var eighth = getMatrixVal(x + 1, y + 1);

                if (first === 0 && second === 0 && third === 0 && fourth === 0 && fifth === 0 && sixth === 0 && seventh === 0
                    && eighth === 0) {
                    matrix[x+","+y] = 0;
                }
                else {
                    matrix[x+","+y] = getLabel(x, y);
                }
            }
        }
    }
    Object.keys(parentChild).forEach(function (key) {
        var childList = parentChild[key];
        var otherKeys = Object.keys(parentChild);
        otherKeys.forEach(function (k) {
            if(key!=k){
                if(itemExist(k, childList))
                    delete parentChild[k];
            }
        });

    });

    $("#resultRow").show();

    console.log(pCount);


    var zoom = map.getView().getZoom();
    console.log('zooom level - ' + zoom);

    if(zoom === 18){
        var pixelToMeter = 0.36799;
    }else if(zoom === 17){
        var pixelToMeter = 1.612226848
            ;
    }else if(zoom === 19){
        var pixelToMeter = 0.085601;
    }

    displayResult(pCount*pixelToMeter);
    canvasContext.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
    $("#processedImage").attr("src", canvas.toDataURL("image/png"));
    return Object.keys(parentChild).length;
}


function itemExist(item,list){
    if(list===undefined){
        return false
    }
    for(var i=0;i<list.length;i++){
        if(item==list[i]){
            return true
        }
    };
    return false
}

function getLabel(x,y){
    var left = getMatrixVal(x-1,y);
    var top = getMatrixVal(x,y-1);

    if(itemExist(left, usedLabel) && itemExist(top, usedLabel)){
        var parent,child;
        if(top>=left){
            parent = left;
            child = top;
        } else{
            parent = top;
            child = left;
        }
        if(parent in parentChild) {
            var childList = parentChild[parent];
            if (!(itemExist(child, childList))) {
                childList.push(child);
                parentChild[parent] = childList;
                return parent;
            }
        }else{
            var childList;
            for (var key in parentChild) {
                if (parentChild.hasOwnProperty(key)) {
                    childList = parentChild[key];
                    if (itemExist(parent, childList)) {
                        if (!(itemExist(child, childList))) {
                            childList.push(child);
                            parentChild[key] = childList;
                        }
                        return parent;
                    }
                }
            }
            childList = [];
            childList.push(child);
            parentChild[parent] = childList;
        }
        return parent
    }
    if(jQuery.inArray(left, usedLabel) !== -1){
        return left;
    }
    if(jQuery.inArray(top, usedLabel) !== -1){
        return top;
    }
    if(usedLabel.length==0){
        usedLabel.push(2);
        return 2;
    }
    var newLabel = usedLabel[usedLabel.length-1]+1;
    usedLabel.push(newLabel);
    return newLabel;
}

function getMatrixVal(x,y){
    try{
        return matrix[x+","+y]
    }catch (err){
        return 0
    }
}

function inside(point, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

    var x = point[0], y = point[1];

    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];

        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
}

function displayResult(area){
    $("#totalArea").val(area);
    $( "#slider-3" ).slider({
        range:"min",value:0,
        min: 0,
        max: 100,
        slide: function( event, ui ) {
            // $( "#usage" ).val(ui.values[1]);
            $( "#usage" ).val(ui.value);
            changeVals(area);
        }
    });
}

function changeVals(area){
    var area = area
    var use = $("#usage").val();
    var actualArea = area*(use/100);
    $("#usageAreaIs").val(actualArea.toFixed(2));
    var energy = actualArea*0.1;
    var monthWise = [4.26,5.15,6.18,6.76,6.68,5.75,4.79,4.80,4.56,5.13,4.72,4.15];
    for(var i=0;i<monthWise.length;i++){
        $("input[id='"+i+"'").val((monthWise[i]*energy).toFixed(2))
    }
}

function disposeAllVariable(){
    usedLabel = [];
    polygonPoints = [];
    parentChild = {};
    matrix = {};
    console.log("Cleared all used resources.")
}
