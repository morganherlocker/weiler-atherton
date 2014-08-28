// reference http://cs1.bradley.edu/public/jcm/weileratherton.html
var inside = require('turf-inside');
var polygon = require('turf-polygon');
var point = require('turf-point');
var dll = require('doubly-linked-list');

module.exports = function (subject, clip) {
    var subjectPolygon = polygon([subject])
    var clipPolygon = polygon([clip])
    console.log(JSON.stringify(subjectPolygon))
    console.log(JSON.stringify(clipPolygon))
    // get intersections
    var subjectWithIntersects = deepCopy(subject);
    var clipWithIntersects = deepCopy(clip);
    var intersections = [];
    var entering = [];
    var exiting = [];
    var result = [];
    var enteringCount = 0;
    var exitingCount = 0;
    var list;

    for(var i = 0; i < subject.length-1; i++){
        for(var k = 0; k < clip.length-1; k++){
            console.log('---')
            var intersection = checkLineIntersection(
                subject[i][0],
                subject[i][1],
                subject[i+1][0],
                subject[i+1][1],
                clip[k][0],
                clip[k][1],
                clip[k+1][0],
                clip[k+1][1]);

            if(intersection){
                console.log(intersection)
                var isExiting = inside(point(clip[k][0], clip[k][1]), subjectPolygon)
                if(isExiting){
                    exiting.push(intersection)
                    intersection.push('exiting');
                } else {
                    entering.push(intersection)
                    intersection.push('entering');
                }

                subjectWithIntersects.splice(i, 0, intersection);
                clipWithIntersects.splice(k, 0, intersection)
                intersections.push(intersection);
            }
        }
    }

    list = dll(intersections)
}

function deepCopy(arr){
    var copy = []   
    arr.forEach(function(pt){
        copy.push(pt[0], pt[1])
    });
    return copy;
}

// modified from http://jsfiddle.net/justin_c_rounds/Gd2S2/light/
function checkLineIntersection(line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY) {
    // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
    var denominator, a, b, numerator1, numerator2, result = {
        x: null,
        y: null,
        onLine1: false,
        onLine2: false
    };
    denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
    if (denominator == 0) {
        if(result.x != null && result.y != null) {
            return result;
        } else {
            return false;
        }
    }
    a = line1StartY - line2StartY;
    b = line1StartX - line2StartX;
    numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
    numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
    a = numerator1 / denominator;
    b = numerator2 / denominator;

    // if we cast these lines infinitely in both directions, they intersect here:
    result.x = line1StartX + (a * (line1EndX - line1StartX));
    result.y = line1StartY + (a * (line1EndY - line1StartY));
/*
        // it is worth noting that this should be the same as:
        x = line2StartX + (b * (line2EndX - line2StartX));
        y = line2StartX + (b * (line2EndY - line2StartY));
        */
    // if line1 is a segment and line2 is infinite, they intersect if:
    if (a > 0 && a < 1) {
        result.onLine1 = true;
    }
    // if line2 is a segment and line1 is infinite, they intersect if:
    if (b > 0 && b < 1) {
        result.onLine2 = true;
    }
    // if line1 and line2 are segments, they intersect if both of the above are true
    if(result.onLine1 && result.onLine2){
        return [result.x, result.y];
    }
    else {
        return false;
    }
}



1       
2       1
    1
3       2
4       3
    2
5       4


[1,0,0], [2,0,1]