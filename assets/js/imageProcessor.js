/*


var pixelToMeter = 0.3679;

var ImageProcessor = function(polyXPoints,polyYPoints){
    this.polyXPoints = polyXPoints;
    this.polyYPoints = polyYPoints;
    this.canvas = document.getElementById("destinationCanvas");
    this.matrix  ={};
    this.insidePolyGon=[];
};


ImageProcessor.prototype.buildMatrix = function () {

    var polygonPoints = [];
    for(var k=0;k<polyXPoints.length;k++){
        var poly =[];
        poly.push(polyXPoints[k]);
        poly.push(polyYPoints[k]);
        polygonPoints.push(poly);
    }
    var canvasContext = this.canvas.getContext('2d');
    var imgPixels = canvasContext.getImageData(0, 0, this.canvas.width, this.canvas.height);

    var neighBorPixels = [[-1,-1],[0,-1],[1,-1],[-1,1],[1,0],[-1,1],[0,1],[1,1]];

    for(var y = 0; y < imgPixels.height; y++){
        for(var x = 0; x < imgPixels.width; x++){
            var point = [x,y];
            if(inside(point,polygonPoints)){
                this.insidePolyGon.push(x+","+y);
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
                        this.matrix[x + "," + y] = 1;
                    }else{
                        this.matrix[x + "," + y] = 0;
                    }
                }
            }else{
                this.matrix[x + "," + y] = 0;
            }
        }
    }
    $("#resultRow").show();
    $("#originalImage").attr("src",this.canvas.toDataURL("image/png"));
    $("#destinationCanvas").addClass("hide");
    $("#sourceCanvas").removeClass("hide");
    console.log("Matrix Build Completed.")
};

ImageProcessor.prototype.countAndArea = function(){

    var canvasContext = this.canvas.getContext('2d');
    var imgPixels = canvasContext.getImageData(0, 0, this.canvas.width, this.canvas.height);

    var imageAlgo = new ImageAlgorithm(imgPixels.width,imgPixels.height,this.matrix,this.insidePolyGon);
    imageAlgo.erosion();
    console.log("Erosion Completed.");
    var dilatedMatrix = imageAlgo.dilation();
    console.log("Dilation Completed.");
    var pCount = 0;

    for (var y = 0; y < imgPixels.height; y++) {
        for (var x = 0; x < imgPixels.width; x++) {
            var i = (y * 4) * imgPixels.width + x * 4;
            if(dilatedMatrix[x + "," + y] == 1){
                imgPixels.data[i] = 255;
                imgPixels.data[i + 1] = 255;
                imgPixels.data[i + 2] = 255;
                this.matrix[x + "," + y] = 1;
                pCount++
            } else {
                imgPixels.data[i] = 0;
                imgPixels.data[i + 1] = 0;
                imgPixels.data[i + 2] = 0;
                this.matrix[x + "," + y] = 0;
            }
        }
    }
    console.log("Processing Completed.");
    canvasContext.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
    var objectCount = imageAlgo.getObjectCount(this.matrix);
    console.log("Object Couting Completed.");
    var area = pCount*pixelToMeter;

    return {objectCount:objectCount,processedCanvas:this.canvas,area:area}
};

function inside(point, vs) {

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



*/
