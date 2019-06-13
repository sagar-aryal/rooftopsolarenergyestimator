/**
 * Created by sagar on 12/01/19.
 */


var ImageAlgorithm = function(width,height,matrix){
    this.height = height;
    this.width = width;
    this.usedLabel = [];
    this.parentChild={};
    // this.insidePointList= insidePointList;
    if(matrix){
        this.matrix = matrix;
    }
};

ImageAlgorithm.prototype.erosion = function() {
    
    var erosionMatrix = {};
    
    for(var y = 0; y < this.height; y++) {
        for (var x = 0; x < this.width; x++) {
            if (this.matrix[x+","+y] == 1) {
                var first = getMatrixVal(x - 1, y - 1);
                var second = getMatrixVal(x, y - 1);//top
                var third = getMatrixVal(x + 1, y - 1);
                var fourth = getMatrixVal(x - 1, y);//left
                var fifth = getMatrixVal(x + 1, y);
                var sixth = getMatrixVal(x - 1, y + 1);
                var seventh = getMatrixVal(x, y + 1);
                var eighth = getMatrixVal(x + 1, y + 1);

                if (first == 1 && second == 1 && third == 1 && fourth == 1 && fifth == 1 && sixth == 1 && seventh == 1
                    && eighth == 1) {
                    erosionMatrix[x+","+y] = 1;
                }
                else {
                    erosionMatrix[x+","+y] = 0;
                }
            }else{
                erosionMatrix[x+","+y] = 0
            }
        }
    }
    this.matrix = erosionMatrix;
    return erosionMatrix
};

ImageAlgorithm.prototype.dilation = function(){
    var dilatedMatrix = {};
    for(var y = 0; y < this.height; y++) {
        for (var x = 0; x < this.width; x++) {
            if (this.matrix[x+","+y] == 0) {
                var first = getMatrixVal(x - 1, y - 1);
                var second = getMatrixVal(x, y - 1);//top
                var third = getMatrixVal(x + 1, y - 1);
                var fourth = getMatrixVal(x - 1, y);//left
                var fifth = getMatrixVal(x + 1, y);
                var sixth = getMatrixVal(x - 1, y + 1);
                var seventh = getMatrixVal(x, y + 1);
                var eighth = getMatrixVal(x + 1, y + 1);

                if (first == 1 || second == 1 || third == 1 || fourth == 1 || fifth == 1 || sixth == 1 || seventh == 1
                    || eighth == 1) {
                    dilatedMatrix[x+","+y] = 1;
                }
                else {
                    dilatedMatrix[x+","+y] = 0;
                }
            }else{
                dilatedMatrix[x+","+y] = 1
            }
        }
    }
    this.matrix = dilatedMatrix;
    return dilatedMatrix
};

ImageAlgorithm.prototype.getObjectCount = function(){
    for(var y = 0; y < this.height; y++) {
        for (var x = 0; x < this.width; x++) {
            if (this.matrix[x+","+y] == 1) {
                var first = getMatrixVal(x - 1, y - 1);
                var second = getMatrixVal(x, y - 1);//top
                var third = getMatrixVal(x + 1, y - 1);
                var fourth = getMatrixVal(x - 1, y);//left
                var fifth = getMatrixVal(x + 1, y);
                var sixth = getMatrixVal(x - 1, y + 1);
                var seventh = getMatrixVal(x, y + 1);
                var eighth = getMatrixVal(x + 1, y + 1);

                if (first == 0 && second == 0 && third == 0 && fourth == 0 && fifth == 0 && sixth == 0 && seventh == 0
                    && eighth == 0) {
                    this.matrix[x+","+y] = 0;
                }
                else {
                    this.matrix[x+","+y] = getLabel(x, y);
                }
            }
        }
    }
    Object.keys(this.parentChild).forEach(function (key) {
        var childList = this.parentChild[key];
        var otherKeys = Object.keys(this.parentChild);
        otherKeys.forEach(function (k) {
            if(key!=k){
                if(itemExist(k, childList))
                    delete this.parentChild[k];
            }
        });

    });
    return Object.keys(this.parentChild).length
    
};

function getLabel(x,y) {
    var left = getMatrixVal(x-1,y);
    var top = getMatrixVal(x,y-1);

    if(itemExist(left, this.usedLabel) && itemExist(top, this.usedLabel)){
        var parent,child;
        if(top>=left){
            parent = left;
            child = top;
        } else{
            parent = top;
            child = left;
        }
        if(parent in this.parentChild) {
            var childList = this.parentChild[parent];
            if (!(itemExist(child, childList))) {
                childList.push(child);
                this.parentChild[parent] = childList;
                return parent;
            }
        }else{
            var childList;
            for (var key in this.parentChild) {
                if (this.parentChild.hasOwnProperty(key)) {
                    childList = this.parentChild[key];
                    if (itemExist(parent, childList)) {
                        if (!(itemExist(child, childList))) {
                            childList.push(child);
                            this.parentChild[key] = childList;
                        }
                        return parent;
                    }
                }
            }
            childList = [];
            childList.push(child);
            this.parentChild[parent] = childList;
        }
        return parent
    }
    if(jQuery.inArray(left, this.usedLabel) !== -1){
        return left;
    }
    if(jQuery.inArray(top, this.usedLabel) !== -1){
        return top;
    }
    if(this.usedLabel.length==0){
        this.usedLabel.push(2);
        return 2;
    }
    var newLabel = this.usedLabel[this.usedLabel.length-1]+1;
    this.usedLabel.push(newLabel);
    return newLabel;
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


function getMatrixVal(x,y){
    try{
        return this.matrix[x+","+y]
    }catch (err){
        return 0
    }
}