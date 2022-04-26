var token = "";
var tuid = "";
var ebs = "";

// because who wants to type this every time?
var twitch = window.Twitch.ext;

// create the request options for our Twitch API calls
var requests = {
    set: createRequest("POST", "cycle"),
    get: createRequest("GET", "query"),
};

function createRequest(type, method) {
    return {
        type: type,
        url: location.protocol + "//localhost:8080/canvas/" + method,
        success: updateBlock,
        error: logError,
    };
}

function setAuth(token) {
    Object.keys(requests).forEach((req) => {
        twitch.rig.log("Setting auth headers");
        requests[req].headers = { Authorization: "Bearer " + token };
    });
}

twitch.onContext(function(context) {
    twitch.rig.log(context);
});

twitch.onAuthorized(function(auth) {
    // save our credentials
    token = auth.token;
    tuid = auth.userId;

    // enable the button
    $("#submitButton").removeAttr("disabled");

    setAuth(token);
    $.ajax(requests.get);
});

function updateBlock(hex) {
    twitch.rig.log("Updating block color");
    $("#color").css("background-color", hex);
}

function logError(_, error, status) {
    twitch.rig.log("EBS request returned " + status + " (" + error + ")");
}

function logSuccess(hex, status) {
    // we could also use the output to update the block synchronously here,
    // but we want all views to get the same broadcast response at the same time.
    twitch.rig.log("EBS request returned " + hex + " (" + status + ")");
}

$(function() {
    // when we click the cycle button
    $("#submitButton").click(function() {
        if (!token) {
            return twitch.rig.log("Not authorized");
        }
        twitch.rig.log("Sending canvas data to server");
        requests.set["data"] = {
            imgData: imgData,
            width: width,
            height: height,
        };
        $.ajax(requests.set);
    });

    // listen for incoming broadcast message from our EBS
    twitch.listen("broadcast", function(target, contentType, message) {
        twitch.rig.log("Received broadcast");
        if (message === "send images") {
            console.log("send images");
            $("#submitButton").click();
        } else {
            console.log("received image");
            document
                .getElementById("otherCanvas")
                .getContext("2d")
                .drawImage(image, 0, 0);
            updateImgData(
                document.getElementById("otherCanvas"),
                document.getElementById("otherCanvas").getContext("2d"),
                "other"
            );
        }
    });
});

const drawTypes = {
    Line: "line",
};
var drawType = drawTypes.Line;
var drawColor = "#000000";
var drawSize = 1;

var clicks = 0;
var lastClick = { x: 0, y: 0 };

function getCursorPosition(canvas, event) {
    var x;
    var y;

    if (event.pageX != undefined && event.pageY != undefined) {
        x = event.pageX;
        y = event.pageY;
    } else {
        x =
            event.clientX +
            document.body.scrollLeft +
            document.documentElement.scrollLeft;
        y =
            event.clientY +
            document.body.scrollTop +
            document.documentElement.scrollTop;
    }

    return { x: x, y: y };
}

var oImgData;
var oCanvas = document.getElementById("otherCanvas");

var dImgData;
var dCanvas = document.getElementById("drawingCanvas");
dCanvas.addEventListener("click", draw, false);

var sCanvasWidth = 100;
var sImgData;
var sCanvas = document.getElementById("selectionCanvas");
sCanvas.addEventListener("click", select, false);

function updateImgData(canvas, context, type = "draw") {
    if (type === "draw") {
        dImgData = context.getImageData(0, 0, canvas.width, canvas.height);
    } else if (type === "selection") {
        sImgData = context.getImageData(0, 0, canvas.width, canvas.height);
    } else if (type === "other") {
        oImgData = context.getImageData(0, 0, canvas.width, canvas.height);
    }
}

const selectMappingColors = {
    red: { color: "#ff0000", x: 0, y: 0 },
    green: { color: "#00ff00", x: 1, y: 0 },
    blue: { color: "#0000ff", x: 2, y: 0 },
    orange: { color: "#ffaa00", x: 0, y: 1 },
    cyan: { color: "#00ffff", x: 1, y: 1 },
    magenta: { color: "#ff00ff", x: 2, y: 1 },
    yellow: { color: "#ffff00", x: 0, y: 2 },
    white: { color: "#ffffff", x: 1, y: 2 },
    black: { color: "#000000", x: 2, y: 2 },
};
const selectMappingTools = {
    pencil: { x: 0, y: 3 },
    eraser: { x: 0, y: 4 },
    line: { x: 0, y: 5 },
};
const selectMappingSize = {
    small: { x: 0, y: 6, size: 1 },
    medium: { x: 1, y: 6, size: 2 },
    large: { x: 2, y: 6, size: 3 },
};

function initSCanvas() {
    sCanvas.width = sCanvasWidth;
    sCanvas.height = Math.max(window.innerHeight - 20, 1);
    context = sCanvas.getContext("2d");
    context.strokeStyle = "#000000";

    for (key in selectMappingColors) {
        dict = selectMappingColors[key];
        context.fillStyle = dict["color"];
        x = dict["x"];
        y = dict["y"];
        colorRect = new Path2D();
        colorRect.rect(
            (x * 100) / 3 + 1,
            (y * 100) / 3 + 1,
            100 / 3 - 2,
            100 / 3 - 2
        );
        context.fill(colorRect);
        context.stroke(colorRect);
        dict["path"] = colorRect;
    }

    for (key in selectMappingTools) {
        dict = selectMappingTools[key];
        context.fillStyle = "#000000";
        x = dict["x"];
        y = dict["y"];
        toolRect = new Path2D();
        toolRect.rect(x * 100 + 1, (y * 100) / 3 + 1, 100 - 2, 100 / 3 - 2);
        context.fillText(
            key,
            x * 100 + 1 + sCanvasWidth / 6,
            (y * 100) / 3 + 1 + sCanvasWidth / 6
        );
        context.stroke(toolRect);
        dict["path"] = toolRect;
    }

    for (key in selectMappingSize) {
        dict = selectMappingSize[key];
        context.fillStyle = "#000000";
        x = dict["x"];
        y = dict["y"];
        sizeCirc = new Path2D();
        sizeCirc.arc(
            (x * 100) / 3 + sCanvasWidth / 6,
            (y * 100) / 3 + sCanvasWidth / 6,
            dict["size"] * 5,
            0,
            2 * Math.PI
        );
        context.fill(sizeCirc);
        dict["path"] = sizeCirc;
    }
    updateImgData(sCanvas, context, "selection");
}
initSCanvas();

function draw(event) {
    switch (drawType) {
        case drawTypes.Line:
            drawLine(this, event);
            break;
        default:
            break;
    }
    updateImgData(this, context, "draw");
}

function drawLine(this_object, event) {
    context = this_object.getContext("2d");

    var position = getCursorPosition(dCanvas, event);
    x = position["x"] - this_object.offsetLeft;
    y = position["y"] - this_object.offsetTop;

    if (clicks != 1) {
        clicks++;
    } else {
        context.beginPath();
        context.moveTo(lastClick["x"], lastClick["y"]);
        context.lineTo(x, y);

        context.strokeStyle = drawColor;
        context.lineWidth = drawSize;
        context.stroke();

        clicks = 0;
    }

    lastClick["x"] = x;
    lastClick["y"] = y;
}

function select(event) {
    var { x, y } = getCursorPosition(this, event);
    var xCoord = Math.floor(x / 100);
    var yCoord = Math.floor(y / 100);
    var color = false;
    for (key in selectMappingColors) {
        if (
            context.isPointInPath(
                selectMappingColors[key]["path"],
                event.offsetX,
                event.offsetY
            )
        ) {
            drawColor = selectMappingColors[key]["color"];
            color = true;
            break;
        }
    }
    if (!color) {
        var tool = false;
        for (key in selectMappingTools) {
            if (
                context.isPointInPath(
                    selectMappingTools[key]["path"],
                    event.offsetX,
                    event.offsetY
                )
            ) {
                drawType = key;
                tool = true;
                break;
            }
        }
    }
    if (!tool) {
        for (key in selectMappingSize) {
            if (
                context.isPointInPath(
                    selectMappingSize[key]["path"],
                    event.offsetX,
                    event.offsetY
                )
            ) {
                drawSize = selectMappingSize[key]["size"];
                break;
            }
        }
    }
}

var clearButton = document.getElementById("clearButton");
clearButton.onclick = function() {
    dCanvas.getContext("2d").clearRect(0, 0, dCanvas.width, dCanvas.height);
    clicks = 0;
    console.log("clear");
};
var showOthersButton = document.getElementById("showOthersButton");
showOthersButton.onclick = function() {
    oCanvas.hidden = false;
    console.log("showOthers");
};
var hideOthersButton = document.getElementById("hideOthersButton");
hideOthersButton.onclick = function() {
    oCanvas.hidden = true;
    console.log("hideOthers");
};
var submitButton = document.getElementById("submitButton");
submitButton.onclick = function() {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", location.protocol + "//localhost:8080/canvas/post");

    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = () => console.log(xhr.responseText);

    let data = `{ "imgData": ${dImgData}, "data": ${dImgData.data}, "width": ${dImgData.width}, "height": ${dImgData.height} }`;

    xhr.send(data);
    console.log("submit");
};

function resizeCanvases() {
    dCanvas.width = Math.max(window.innerWidth - sCanvasWidth - 42, 1);
    dCanvas.height = Math.max(window.innerHeight - 22, 1);
    if (dImgData != null) {
        dCanvas.getContext("2d").putImageData(dImgData, 0, 0);
    }

    oCanvas.width = Math.max(window.innerWidth - sCanvasWidth - 42, 1);
    oCanvas.height = Math.max(window.innerHeight - 22, 1);
    if (oImgData != null) {
        oCanvas.getContext("2d").putImageData(oImgData, 0, 0);
    }

    sCanvas.width = sCanvasWidth;
    sCanvas.height = Math.max(window.innerHeight - 220, 1);
    if (sImgData != null) {
        sCanvas.getContext("2d").putImageData(sImgData, 0, 0);
    }
}

window.onload = window.onresize = resizeCanvases;