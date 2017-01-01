var colors = [];
var stage;
var col;
var row;
var x;
var y;
var grid_width;
var grid_height;
var width;
var height;
var canvas_width;
var canvas_height;
var level;
var move;
var able_to_response;
var escape;
var time;
var interval;

$(document).ready(function() {
    init();
});

function init() {
    console.log("init");

    level = 0;
    time = 5 * 60 * 1000;
    clearInterval(interval);
    interval = false;

    stage = new createjs.Stage("main");
    stage.mouseMoveOutside = true;

    var canvas = document.getElementById("main");
    canvas_width = canvas.width;
    canvas_height = canvas.height;

    enter(level);
}

function start(level, infinity) {
    console.log("start");

    grid_width = 100;
    grid_height = 100;
    colors = [];
    move = 0;
    able_to_response = 1;
    for (var i = 0; i < stage.getNumChildren(); i++) {
        var child = stage.getChildAt(i);
        child.removeAllEventListeners();
    }
    stage.removeAllChildren();
    stage.removeAllEventListeners();

    // size
    row = 1 + Math.round(level/5);
    if (row > 5) {
        row = 5;
    }
    col = 5 + Math.round(level/10);
    if (col > 10) {
        col = 10;
    }
    var mul = row * col;
    col = getRandomInt(col-1, col+1);
    row = Math.round(mul/col);

    if (col >= 6 || row >= 4) {
        grid_width = 80;
        grid_height = 80;
    }
    if (col >= 8 || row >= 5) {
        grid_width = 60;
        grid_height = 60;
    }

    // console.log("level: %s, row: %s, col: %s", level, row, col);

    width = grid_width * col;
    height = grid_height * row;
    x = canvas_width / 2 - width / 2;
    y = canvas_height / 2 - height / 2 + 40;

    // color parameters - h
    var color_h_start = getRandomInt(0, 300);
    var color_h_range = 360 - color_h_start - level*10;
    if (color_h_range < 60) {
        color_h_range = 60;
    }
    var color_h_end = color_h_start + color_h_range;

    // color parameters - s
    var color_s_start = getRandomInt(40, 70);
    var color_s_range = getRandomInt(10, 30);

    // color parameters - l
    var color_l_start = getRandomInt(50, 60);
    var color_l_range = getRandomInt(20, 40);

    var h_dir = (Math.random()>0.5) ? 1 : -1;
    var s_dir = (Math.random()>0.5) ? 1 : -1;
    var l_dir = (Math.random()>0.5) ? 1 : -1;
    var i_j_dir = (Math.random()>0.5) ? 1 : -1;

    for (var j = 0; j < row; j++) {
        for (var i = 0; i < col; i++) {
            // calculate colors and store in array
            var k = i + j * col;
            if (i_j_dir > 0) {
                var h = Math.round(color_h_start + h_dir * i * color_h_range / col);
                var s = Math.round(color_s_start + s_dir * j * color_s_range / row);
                var l = Math.round(color_l_start + l_dir * j * color_l_range / row);
            } else {
                var h = Math.round(color_h_start + h_dir * j * color_h_range / row);
                var s = Math.round(color_s_start + s_dir * i * color_s_range / col);
                var l = Math.round(color_l_start + l_dir * i * color_l_range / col);
            }
            colors.push(new Array(h, s, l, i, j, k));
        }
    }
    // stage.update();
    // exit();
    // console.log("colors: %a", colors);

    // var unshuffled_colors = [];
    // for (var i = 0; i < colors.length; i++) {
    //     unshuffled_colors.push(colors[i][5]);
    // }
    // console.log("unshuffled_colors: %a", unshuffled_colors);

    // shuffle color array
    if (row < 2) {
        escape = new Array(0, colors.length-1);
    } else if (row < 3) {
        escape = new Array(0, col-1, colors.length-1);
    } else {
        escape = new Array(0, col-1, (row-1)*col, colors.length-1);
    }
    shuffle(colors, escape);

    // draw game
    var main = stage.getChildByName("main");
    if (!main) {
        main = new createjs.Container();
        main.name = "main";
        stage.addChild(main);

        var background = new createjs.Shape();
        background.graphics.beginFill("#151517").drawRect(0, 0, canvas_width, canvas_height);
        main.addChild(background);
    } else {
        stage.setChildIndex(main, stage.getNumChildren()-1);
    }

    var dec_bg = main.getChildByName("dec_bg");
    if (!dec_bg) {
        dec_bg = new createjs.Shape();
        dec_bg.graphics.beginFill("#151517").drawRect(0, 0, col*grid_width, row*grid_height);
        dec_bg.x = x;
        dec_bg.y = y;
        dec_bg.shadow = new createjs.Shadow("#000000", 0, 0, 30);
        main.addChild(dec_bg);
    } else {
        dec_bg.width = col*grid_width;
        dec_bg.height = row*grid_height;
        dec_bg.x = x;
        dec_bg.y = y;
    }

    for (var i = 0; i < col; i++) {
        for (var j = 0; j < row; j++) {
            var k = i + j * col;
            if (k >= 0 && k <colors.length) {
                var h = colors[k][0];
                var s = colors[k][1];
                var l = colors[k][2];
                var final_i = colors[k][3];
                var final_j = colors[k][4];
                var final_k = colors[k][5];

                // draw shuffled colors
                var dragger = new createjs.Container();
                dragger.x = x + i * grid_width;
                dragger.y = y + j * grid_height;
                dragger.i = i;
                dragger.j = j;
                dragger.k = k;
                dragger.final_i = final_i;
                dragger.final_j = final_j;
                dragger.final_k = final_k;
                dragger.name = "dragger_" + k;
                main.addChild(dragger);

                var rect = new createjs.Shape();
                var color = 'hsl('+ h +', ' + s +'%, '+ l +'%)';
                rect.graphics.beginFill(color);
                rect.graphics.drawRect(0, 0, grid_width, grid_height);
                rect.name = "rect";
                dragger.addChild(rect);

                var label = new createjs.Text(final_k, "bold 20px Arial", "#FFFFFF");
                label.textAlign = "center";
                label.x = grid_width/2;
                label.y = grid_height/2 - 10;
                label.alpha = 0;
                label.name = "label";
                label.shadow = new createjs.Shadow("#151517", 1, 1, 2);
                dragger.addChild(label);

                var color = new createjs.Text(h+","+s+","+l, "bold 14px Arial", "#FFFFFF");
                color.textAlign = "center";
                color.x = grid_width/2;
                color.y = 0;
                color.alpha = 1;
                color.alpha = 0;
                color.name = "color";
                color.shadow = new createjs.Shadow("#151517", 1, 1, 2);
                dragger.addChild(color);

                if (escape.includes(final_k)) {
                    var lock = new createjs.Bitmap("images/lock_48.png");
                    lock.name = "lock";
        			lock.x = grid_width - 20;
                    lock.y = grid_height - 20;
                    lock.scaleX = 0.5;
                    lock.scaleY = 0.5;
                    lock.shadow = new createjs.Shadow("#151517", 1, 1, 2);
                    dragger.addChild(lock);
                    dragger.locked = 1;
                    lock.image.onload = function(dragger) {
                        stage.update();
                    }
                    continue;
                } else {
                    dragger.locked = 0;
                }

                dragger.on("pressmove", function(evt) {
                    // console.log(evt.currentTarget.name);
                    evt.currentTarget.parent.setChildIndex(evt.currentTarget, evt.currentTarget.parent.getNumChildren()-1);
                    evt.currentTarget.x = evt.stageX - grid_width/2;
                    evt.currentTarget.y = evt.stageY - grid_height/2;
                    // console.log("evt.stage: %s, %s, target: %s, %s", evt.stageX, evt.stageY, evt.currentTarget.x, evt.currentTarget.y);
                    // console.log("target: %a", evt.currentTarget);
                    stage.update();
                });
                dragger.on("pressup", function(evt) {
                    // console.log("up: %s(%s)", evt.currentTarget.final_k, evt.currentTarget.k);
                    if (able_to_response == 1) {
                        able_to_response = 0;
                        setTimeout(function(){
                            able_to_response = 1;
                        }, 500);
                        // console.log("up");
                        // find nearest grid and switch with the current placehoder
                        evt.currentTarget.x = x + Math.round((evt.currentTarget.x-x) / grid_width) * grid_width;
                        evt.currentTarget.y = y + Math.round((evt.currentTarget.y-y) / grid_height) * grid_height;
                        var i2 = Math.round((evt.currentTarget.x - x) / grid_width);
                        var j2 = Math.round((evt.currentTarget.y - y) / grid_height);
                        var k2 = i2 + j2 * col;
                        if (k2 != evt.currentTarget.k) {
                            var target2 = evt.currentTarget.parent.getChildByName("dragger_" + k2);
                            if (target2 && target2.final_k != evt.currentTarget.final_k) {
                                switch_rects(evt.currentTarget, target2);
                            } else if (target2) {
                                // console.log("error 1: %s(%s), %s(%s)", target2.final_k, target2.k, evt.currentTarget.final_k, evt.currentTarget.k);
                                evt.currentTarget.x = x + evt.currentTarget.i * grid_width;
                                evt.currentTarget.y = y + evt.currentTarget.j * grid_height;
                                stage.update();
                            } else {
                                // console.log("error 3: k2: %s, target2: %s", k2, target2);
                                evt.currentTarget.x = x + evt.currentTarget.i * grid_width;
                                evt.currentTarget.y = y + evt.currentTarget.j * grid_height;
                                stage.update();
                            }
                        } else {
                            // console.log("error 2");
                            evt.currentTarget.x = x + evt.currentTarget.i * grid_width;
                            evt.currentTarget.y = y + evt.currentTarget.j * grid_height;
                            stage.update();
                        }
                    } else {
                        // console.log("error 4");
                        evt.currentTarget.x = x + evt.currentTarget.i * grid_width;
                        evt.currentTarget.y = y + evt.currentTarget.j * grid_height;
                        stage.update();
                    }
                });
            }
        }
    }

    var level_text = new createjs.Text("Level: " + (level+1), "bold 50px Arial", "#FFFFFF");
    level_text.textAlign = "center";
    level_text.x = canvas_width/2;
    level_text.y = 20;
    level_text.name = "level";
    level_text.shadow = new createjs.Shadow("#000000", 0, 0, 10);
    main.addChild(level_text);

    var move_text = new createjs.Text("Move: " + move, "bold 24px Arial", "#FFFFFF");
    move_text.textAlign = "center";
    move_text.x = canvas_width/2;
    move_text.y = 80;
    move_text.name = "move";
    move_text.shadow = new createjs.Shadow("#000000", 0, 0, 10);
    main.addChild(move_text);

    if (!infinity) {
        var time_left = Math.floor(time/60/1000) + ":" + Math.floor((time/1000) % 60);
        var time_text = new createjs.Text("Time: " + time_left, "bold 24px Arial", "#FFFFFF");
        time_text.textAlign = "center";
        time_text.x = canvas_width/2;
        time_text.y = 104;
        time_text.name = "time";
        time_text.shadow = new createjs.Shadow("#000000", 0, 0, 10);
        main.addChild(time_text);
    }

    stage.update();

    // inteval
    if (interval == false && !infinity) {
        interval = setInterval(function(){
            update(1000);
        }, 1000);
    }

    credit();
}

function switch_rects(a, b) {
    // console.log("switch_rects: %s(%s), %s(%s)", a.final_k, a.k, b.final_k, b.k);
    if (b.locked == 0) {
        var temp_i = a.i;
        var temp_j = a.j;
        var temp_k = a.k;
        a.i = b.i;
        a.j = b.j;
        a.k = b.k;
        a.x = b.x;
        a.y = b.y;
        a.name = "dragger_" + a.k;
        b.i = temp_i;
        b.j = temp_j;
        b.k = temp_k;
        b.x = x + b.i * grid_width;
        b.y = y + b.j * grid_height;
        b.name = "dragger_" + b.k;
        move ++;
        // console.log("move: %s", move);
        var main = stage.getChildByName("main");
        if (main) {
            var move_text = main.getChildByName("move");
            if (move_text) {
                move_text.text = "Move: " + move;
            }
            stage.update();
        }
        check_result();
        // console.log("switch_result: %s(%s), %s(%s)", a.final_k, a.k, b.final_k, b.k);
        // console.log("switch_result_2: (%s, %s), (%s, %s)", a.x, a.y, b.x, b.y);
    } else {
        a.x = x + a.i * grid_width;
        a.y = y + a.j * grid_height;
        stage.update();
    }
}

function update(refresh_time) {
    // console.log("update %s", time);

    refresh_time = (refresh_time) ? refresh_time : 0;
    time -= refresh_time;
    if (time <= 0) {
        time = 0;
    }
    var time_left = Math.floor(time/60/1000) + ":" + Math.floor((time/1000) % 60);

    var main = stage.getChildByName("main");
    if (main) {
        var time_text = main.getChildByName("time");
        if (time_text) {
            time_text.text = "Time: " + time_left;
            stage.update();
        }
    }

    if (time == 0) {
        end();
    }
}

function end() {
    var end = stage.getChildByName("end");
    if (!end) {
        end = new createjs.Container();
        end.name = "end";
        stage.addChild(end);

        var background = new createjs.Shape();
        background.graphics.beginFill("#151517").drawRect(0, 0, canvas_width, canvas_height);
        end.addChild(background);

        var text = new createjs.Text("Max level: "+(level+1), "bold 60px Arial", "#FFFFFF");
        text.textAlign = "center";
        text.x = canvas_width/2;
        text.y = canvas_height/2 - 50;
        text.name = "text";
        text.shadow = new createjs.Shadow("#000000", 0, 0, 20);
        end.addChild(text);

        var button = new createjs.Container();
        button.x = canvas_width/2 - 100;
        button.y = canvas_height/2 + 80;
        end.addChild(button);

        var button_bg = new createjs.Shape();
        button_bg.graphics.beginFill("#131314").drawRect(0, 0, 200, 80);
        button_bg.shadow = new createjs.Shadow("#000000", 0, 0, 20);
        var button_text = new createjs.Text("Retry", "bold 40px Arial", "#FFFFFF");
        button_text.textAlign = "center";
        button_text.x = 100;
        button_text.y = 20;
        button.addChild(button_bg, button_text);

        button.on("click", function(event) {
            button.mouseEnabled = false;
            // init();
            location.reload();
        });
    } else {
        stage.setChildIndex(end, stage.getNumChildren()-1);
        var text = end.getChildByName("text");
        if (text) {
            text.Text = "Max level: "+level;
        }
    }

    stage.update();

    credit();
}

function enter(level) {
    var enter = stage.getChildByName("enter");
    if (!enter) {
        enter = new createjs.Container();
        enter.name = "enter";
        stage.addChild(enter);

        var background = new createjs.Shape();
        background.graphics.beginFill("#151517").drawRect(0, 0, canvas_width, canvas_height);
        enter.addChild(background);

        var title = new createjs.Text("Color Master", "bold 60px Arial", "#FFFFFF");
        title.textAlign = "center";
        title.x = canvas_width/2;
        title.y = 100;
        title.name = "title";
        title.shadow = new createjs.Shadow("#000000", 0, 0, 20);
        enter.addChild(title);

        var button = new createjs.Container();
        button.x = canvas_width/2 - 130;
        button.y = canvas_height/2 - 40;
        enter.addChild(button);

        var button_bg = new createjs.Shape();
        button_bg.graphics.beginFill("#131314").drawRect(0, 0, 260, 80);
        button_bg.shadow = new createjs.Shadow("#000000", 0, 0, 20);
        var button_text = new createjs.Text("Limited Time", "bold 32px Arial", "#FFFFFF");
        button_text.textAlign = "center";
        button_text.x = 130;
        button_text.y = 20;
        button.addChild(button_bg, button_text);

        button.on("click", function(event) {
            start(level);
        });

        var button_2 = new createjs.Container();
        button_2.x = canvas_width/2 - 130;
        button_2.y = canvas_height/2 + 80;
        enter.addChild(button_2);

        var button_2_bg = new createjs.Shape();
        button_2_bg.graphics.beginFill("#131314").drawRect(0, 0, 260, 80);
        button_2_bg.shadow = new createjs.Shadow("#000000", 0, 0, 20);
        var button_2_text = new createjs.Text("Infinity Mode", "bold 32px Arial", "#FFFFFF");
        button_2_text.textAlign = "center";
        button_2_text.x = 130;
        button_2_text.y = 20;
        button_2.addChild(button_2_bg, button_2_text);

        button_2.on("click", function(event) {
            start(level, true);
        });
    } else {
        stage.setChildIndex(enter, stage.getNumChildren()-1);
    }
    stage.update();
    credit();
}

function credit() {
    var credit = stage.getChildByName("credit");
    if (!credit) {
        credit = new createjs.Text("Color Master by River Liu \u00A9" + new Date().getFullYear(), "20px Arial", "#FFFFFF");
        credit.textAlign = "center";
        credit.x = canvas_width/2;
        credit.y = canvas_height - 40;
        credit.alpha = 0.2;
        credit.shadow = new createjs.Shadow("#000000", 0, 0, 10);
        credit.on("click", function(event) {
            window.open("http://riverliu.net","_blank");
        });
        stage.addChild(credit);
    } else {
        stage.setChildIndex(credit, stage.getNumChildren()-1);
    }
    stage.update();
}

function check_result() {
    var finished = true;
    var main = stage.getChildByName("main");
    if (main) {
        for (var i = 0; i < col; i++) {
            for (var j = 0; j < row; j++) {
                var dragger = main.getChildByName("dragger_"+(i + j * col));
                if (dragger) {
                    if (dragger.k != dragger.final_k) {
                        finished = false;
                        break;
                    }
                } else {
                    continue;
                }
            }
        }
    }
    // console.log("finished: %s", finished);

    if (finished) {
        setTimeout(function () {
            next();
        }, 1000);
    }
}

function next(){
    // animation
    var main = stage.getChildByName("main");
    if (main) {
        createjs.Ticker.setFPS(20);
        createjs.Ticker.addEventListener("tick", rotate);
        function rotate() {
            for (var i = 0; i < colors.length; i++) {
                var dragger = main.getChildByName("dragger_"+i);
                if (dragger) {
                    //rotate around center
                    if (dragger.alpha == 1) {
                        dragger.x += grid_width/2;
                        dragger.y += grid_height/2;
                        dragger.regX = grid_width/2;
                        dragger.regY = grid_height/2;
                    }
                    dragger.rotation += 3;
                    dragger.alpha -= 0.05;
                }
            }
            stage.update();
        }
    }

    // go to next level
    level++;
    setTimeout(function () {
        start(level);
    }, 1000);
}

function go(level) {
    level = (level >= 0) ? level : 0;
    start(level);
}

function cheat(timeout) {
    timeout = (timeout) ? timeout : 3000;
    var labels = [];
    var main = stage.getChildByName("main");
    if (main) {
        for (var i = 0; i < colors.length; i++) {
            var dragger = main.getChildByName("dragger_"+i);
            if (dragger) {
                var label = dragger.getChildByName("label");
                var color = dragger.getChildByName("color");
                label.alpha = .7;
                labels.push(label);
                color.alpha = .7;
                labels.push(color);
            }
        }
        stage.update();
    }
    setTimeout(function() {
        if (labels) {
            for (var i = 0; i < labels.length; i++) {
                var label = labels[i];
                label.alpha = 0;
            }
            stage.update();
        }
    }, timeout);
}

/**
 * Shuffles array in place.
 * @param {Array} array items The array containing the items.
 * @param {Array} escape index The array containing the index of escaped items.
 */
function shuffle(array, escape) {
    // console.log("escape: %a", escape);
    var j, x, i, count;
    var unshuffled = shuffled = [];
    for (i = array.length - 1; i >= 0; i--) {
        unshuffled.push(array[array.length-1-i][5]);
        if (escape.includes(i)) {
            continue;
        }
        count = 0;
        for (var count = 0; count < 5; count ++) {
            j = getRandomInt(0, i-1);
            if (!escape.includes(j) && j != i) {
                break;
            }
        }
        if (escape.includes(j) || j == i) {
            continue;
        }
        x = array[i];
        array[i] = array[j];
        array[j] = x;
    }
    // for (i = array.length - 1; i >= 0; i--) {
    //     shuffled.push(array[array.length-1-i][5]);
    // }
    // console.log("unshuffled: %a", unshuffled);
    // console.log("shuffled: %a", shuffled);
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
