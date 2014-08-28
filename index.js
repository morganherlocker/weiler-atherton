// reference http://cs1.bradley.edu/public/jcm/weileratherton.html
var inside = require('turf-inside');
var polygon = require('turf-polygon');
var point = require('turf-point');

module.exports = function (subject, clip) {
    var subjectList = new Polygon();
    var clipList = new Polygon();

    for(var i = 0; i < subject.length-1; i++){
        subjectList.add(new Point(subject[i][0], subject[i][1]));
    }
    for(var i = 0; i < clip.length-1; i++){
        clipList.add(new Point(clip[i][0], clip[i][1]));
    }

    var currentSubject = subjectList.first;
    var currentClip = clipList.first;
    for(var i = 0; i < subject.length-1; i++) {
        for(var k = 0; k < clip.length-1; k++) {
            var intersection = checkLineIntersection(
                subject[i][0],
                subject[i][1],
                subject[i+1][0],
                subject[i+1][1],
                clip[k][0],
                clip[k][1],
                clip[k+1][0],
                clip[k+1][1]);

            if(intersection) {
                var isEntering = !inside(point(clip[k][0], clip[k][1]), subjectPolygon)
                currentSubject.next.insertBefore(new Point(intersection[0], intersection[1]), isEntering);
                currentClip.next.insertBefore(new Point(intersection[0], intersection[1]), isEntering);
            }
            currentClip = currentClip.next;
        }
        currentSubject = currentSubject.next;
    }
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

// polygon contour as a doubly linked list
// https://github.com/mapbox/seidel/blob/master/src/polygon.js
function Polygon() {
    this.length = 0;
    this.first = null;
    this.last = null;
}

function PolygonNode(point) {
    this.point = point;
    this.next = null;
    this.prev = null;
    this.ear = false;
}

Polygon.prototype = {
    add: function (point) {
        var node = new PolygonNode(point);

        if (!this.length) {
            this.first = this.last = node;

        } else {
            this.last.next = node;
            node.prev = this.last;
            this.last = node;
        }

        this.length++;
    },

    remove: function (node) {
        if (!this.length) return;

        if (node === this.first) {
            this.first = this.first.next;

            if (!this.first) this.last = null;
            else this.first.prev = null;

        } else if (node === this.last) {
            this.last = this.last.prev;
            this.last.next = null;

        } else {
            node.prev.next = node.next;
            node.next.prev = node.prev;
        }

        node.prev = null;
        node.next = null;

        this.length--;
    },

    insertBefore: function (point, node) {
        var newNode = new PolygonNode(point);
        newNode.prev = node.prev;
        newNode.next = node;

        if (!node.prev) this.first = newNode;
        else node.prev.next = newNode;

        node.prev = newNode;

        this.length++;
    }
};

https://github.com/mapbox/seidel/blob/master/src/point.js
function Point(x, y, entrering) {
    this.x = x;
    this.y = y;
    this.entering = entering;
}