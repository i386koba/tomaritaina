//NetBeans でコード内の TODO を一覧表示させる http://wp.tekapo.com/2012/12/29/how-to-show-todo-list-in-netbeans/
//http://qiita.com/kazu56/items/36b025dac5802b76715c 【jQuery】フォーム部品の取得・設定まとめ

var google;
google.maps.event.addDomListener(window, 'load', initialize);
var map;

function initialize() {
    //終了時　beforeunload　イベントがpeer.jsで上書きされるのでここで書いてもダメ。
    //peer  が　出来てからでないとだめだった。
    //クローム検証ウィンドウ（F12キー）のElementのEvent Listenersタグの再読み込みでわかった。
    //$(window).on("beforeunload", function (e) {
    //return; }
    //デバッグ用→　document.getElementById("show_result").innerHTML = error.message;
    var mapOptions = {
        zoom: 22,
        //center: gPos,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        //mapTypeId: google.maps.MapTypeId.TERRAIN
        noClear: false //http://www.openspc2.org/Google/Maps/api3/Map_option/noClear/
    };
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    //初回地図定義 （ブラウザの位置情報が取得できない場合）サーリューション35.8401073,137.9581047
    //TODO: Geolocation API の使用が　安全なサイトに制限、SSL導入しなければならない、
    //http://netbeans-org.1045718.n5.nabble.com/How-to-debug-https-or-SSL-web-applications-in-netbeans-td2885406.html
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
// success callback
            var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            map.setCenter(pos);
            //https://developers.google.com/maps/documentation/javascript/reference#Circle

        }, function (error) {
// error callback
            switch (error.code) {
                case 1:
                    $("#orient").html("ブラウザの位置情報の利用が許可されていません");
                    break;
                case 2:
                    $("#orient").html("ブラウザの位置情報が判定できません");
                    break;
                case 3:
                    $("#orient").html("ブラウザの位置情報がタイムアウトしました");
                    break;
            }
//POS取得できなかった場合。
            map.setCenter(new google.maps.LatLng(35.8401073, 137.9581047));
        });
    }
    padInitialize();
    gamePadInitialize();
    uiInitialize();
}

var padg = null; //マウスパッド コンテキスト
var pMouse = {x: null, y: null}; // マウス座標
var yRange = 400;
var yCenter = 1500;
var xRange = 400;
var xCenter = 1500;
var isDragging = false;
function padInitialize() {
    //マウスによる2chプロポ操作　Canvas上の矢印をドラッグしてXY座標入力。
    //マウスを離すと0点に戻るようにする。
    //pCanvas = document.getElementById("padCanvas");
    //canvas をjQueryで使う。 http://tnomura9.exblog.jp/12624562/
    pCanvas = $("#padCanvas").get(0);
    padg = pCanvas.getContext("2d");
    //mCanvas = document.getElementById("mouseCanvas");
    mCanvas = $("#mouseCanvas").get(0);
    mouseg = mCanvas.getContext("2d");
    //初期化
    pMouse.x = 120;
    pMouse.y = 120;
    padDraw(pCanvas);
    //HTML5のcanvas内の複数の画像をドラッグ＆ドロップさせてみる http://qiita.com/akase244/items/b801f435e85ea67a70eb
    pCanvas.addEventListener("mousedown", function (e) {
        // マウス位置を更新
        var rect = e.target.getBoundingClientRect();
        pMouse.x = e.clientX - rect.left;
        pMouse.y = e.clientY - rect.top;
        if (pMouse.x > 100 && pMouse.x < 140 && pMouse.y > 100 && pMouse.y < 140) {
            isDragging = true;
        }
    }, false);
    // ドラッグ終了
    pCanvas.addEventListener('mouseup', function (e) {
        isDragging = false;
        pMouse.x = 120;
        pMouse.y = 120;
        padDraw(pCanvas);
    }, false);
    pCanvas.addEventListener("mousemove", function (e) {
        //ドラッグ中
        if (isDragging === true) {
            //要素の上でマウスが動いた際の処理 http://tmlife.net/programming/javascript/javascript-mouse-pos.html
            // マウス位置を更新 // 注）getBoundingClientRect()はページがスクロールしても対応しているようです。
            //http://cartman0.hatenablog.com/entry/2015/06/29/022301
            var rect = e.target.getBoundingClientRect();
            pMouse.x = parseInt(e.clientX - rect.left);
            pMouse.y = parseInt(e.clientY - rect.top);
            padDraw(pCanvas);
        }
    }, false);
    // 要素からマウスが出た際の処理
    pCanvas.addEventListener("mouseout", function (e) {
        isDragging = false;
        pMouse.x = 120;
        pMouse.y = 120;
        padDraw(pCanvas);
    }, false);
    //サーボPWMの制御幅で角度コントロール
    //http://tetsuakibaba.jp/index.php?page=workshop/ServoBasis/main
    //パルス幅　800us〜1500usでー90～0度、1500us~2300usで0〜90度の角度設定．
    //初期値読み取り
    yRange = $("#yRange").val(); //400;
    yCenter = $("#yCenter").val(); //1500;
    xRange = $("#xRange").val(); //400;
    xCenter = $("#xCenter").val(); //1500;

    //変更読み取り
    $("#yRange").change(function () {
        yRange = $("#yRange").val();
    });
    $("#yCenter").change(function () {
        yCenter = $("#yCenter").val();
    });
    $("#xRange").change(function () {
        xRange = $("#xRange").val();
    });
    $("#xCenter").change(function () {
        xCenter = $("#xCenter").val();
    });
    //PAD十字の描画　http://www.htmq.com/canvas/lineTo.shtml
    padg.beginPath();
    padg.moveTo(0, 120);
    padg.lineTo(240, 120);
    padg.closePath();
    padg.stroke();
    padg.beginPath();
    padg.moveTo(120, 0);
    padg.lineTo(120, 240);
    padg.closePath();
    padg.stroke();
    //センター位置の四角
    padg.strokeRect(100, 100, 40, 40);
}
//マウスによるPAD操作の描画
function  padDraw(canvas) {
// クリア
    mouseg.clearRect(0, 0, canvas.width, canvas.height);
    //カメラ位置　横方向センターか？
    if ($("#xCamera").val() !== $("#xCCenter").val()) {
//if (peerdConn) {
//    peerdConn.send(("0" + $("#xCCenter").val()).slice(-4) + "x");
//}
        return;
    }
// マウスの位置に三角を描画
    mouseg.beginPath();
    //パスを使って図形を描画するには？ http://javascript-api.sophia-it.com/reference/%E3%83%91%E3%82%B9%E3%82%92%E4%BD%BF%E3%81%A3%E3%81%A6%E5%9B%B3%E5%BD%A2%E3%82%92%E6%8F%8F%E7%94%BB%E3%81%99%E3%82%8B%E3%81%AB%E3%81%AF%EF%BC%9F
    //mouseg.arc(pMouse.x, pMouse.y, 16, 0, Math.PI * 2, false);
    mouseg.moveTo(pMouse.x, pMouse.y - 20);
    mouseg.lineTo(pMouse.x - 15, pMouse.y + 10);
    mouseg.lineTo(pMouse.x + 15, pMouse.y + 10);
    mouseg.closePath();
    mouseg.strokeStyle = "blue"; // 線の色を指定する
    mouseg.fillStyle = "green"; // 塗りつぶしの色を指定する
    mouseg.fill();
    mouseg.stroke();
    // マウスの情報を表示
    //padg.fillStyle = "rgba(0, 0, 0, 1.0)";
    //padg.fillText("Mouse X : " + pMouse.x, 8, 48);
    //padg.fillText("Mouse Y : " + pMouse.y, 8, 64);
    var yR = Number(yRange);
    var yC = Number(yCenter);
    var xR = Number(xRange);
    var xC = Number(xCenter);
    pMouse.x -= 120;
    pMouse.y -= 120;
    //var mStr = parseInt(pMouse.x) + ", " + parseInt(pMouse.y);
    //GamePADのセンターが出ないので、センターより20pxずれないとpMouseを加算しない。20px以内は0
    if (Math.abs(pMouse.x) <= 20) {
        pMouse.x = 0;
    } else if (pMouse.x > 20) {
        pMouse.x -= 20;
    } else if (pMouse.x < -20) {
        pMouse.x += 20;
    }

    if (Math.abs(pMouse.y) <= 20) {
        pMouse.y = 0;
    } else if (pMouse.y > 20) {
        pMouse.y -= 20;
    } else if (pMouse.y < -20) {
        pMouse.y += 20;
    }

//Arduino サーボ制御　http://tetsuakibaba.jp/index.php?page=workshop/ServoBasis/main
    var xPWM = xC + parseInt(pMouse.x * (xR / 100), 10);
    var yPWM = yC + parseInt(pMouse.y * (yR / 100), 10);
    commandStr = "BTC:" + xPWM + "" + yPWM + "m";
    //JavaScriptで指定した数の小数も表示する http://d.hatena.ne.jp/necoyama3/20090904/1252074054
    //$("#mXY").html(parseFloat(pMouse.x).toFixed(1) + ", " + parseFloat(pMouse.y).toFixed(1));
    $("#mXY").html(parseInt(pMouse.x) + ", " + parseInt(pMouse.y)); // + "/" + mStr);
}

function gamePadInitialize() {
    var gamePadID, gamePadInterval;
    // Gemapad API
    //http://hakuhin.jp/js/gamepad.html#GAMEPAD_GAMEPAD_MAPPING
    // ゲームパッドをXboxコントローラーとして使う　x360ce の使い方
    // http://peekness.blog.jp/archives/31808206.html
    //上記64bit版　Chrome PS2コントローラUSB変換で試してOK。
    //以下は非Xinputのコントローラー直で動くか？
    //　HTML5-JavaScript-Gamepad-Controller-Library　https://github.com/kallaspriit/HTML5-JavaScript-Gamepad-Controller-Library

    if (window.GamepadEvent) {
// ゲームパッドを接続すると実行されるイベント
//window.addEventListener("gamepadconnected", function (e) {
// console.log(e.gamepad);
//ブラウザ起動時にpadのボタン何を押してもgamepadconnectedが発火しない。
//ブラウザのタグを切り替えると発火する模様。
//不便なので手動にする
        $("#gpSW").click(function () {
// ゲームパッドリストを取得する
            var gamepad_list = navigator.getGamepads();
            console.log(gamepad_list);
            var gamePad = false;
            for (i = 0; i < gamepad_list.length; i++) {
// Gamepad オブジェクトを取得する
                if (!gamepad_list[i]) {
                    continue;
                }
                gamePad = gamepad_list[i];
                gamePadID = i; //Loop中の接続確認のためID指定
            }
//GamePadがある。
            if (gamePad) {
// ゲームパッドの識別名
                var gStr = "id: " + gamePad.id + "\n";
                // ゲームパッドの物理的な接続状態
                gStr += "connected: " + gamePad.connected + "\n";
                // マッピングタイプ情報
                gStr += "mapping: " + gamePad.mapping + "\n";
                $("#commandStat").val(gStr + "ゲームパッドが接続されました\n");
                //GamePad監視 一定時間隔で、繰り返し実行される関数 10FPS
                clearInterval(gamePadInterval);
                //setInterval()やsetTimeout()で関数に引数を与えるには
                gamePadInterval = setInterval(function () {
                    gamePadListen(gamePadID, gamePadInterval);
                }, 100);
                console.log("ゲームパッドが接続されました");
                //jQueryのprop()でdisabled属性を切り替える http://qiita.com/pugiemonn/items/5db6fb8fd8a303406b17
                $("#gpSW").prop("disabled", true);
            } else {
                $("#commandStat").val("ゲームパッドが接続されていません\n");
            }
        });
        // ゲームパッドの接続を解除すると実行されるイベント
        window.addEventListener("gamepaddisconnected", function (e) {
            //$(window).on("gamepaddisconnected", function (e) {
            console.log("ゲームパッドの接続が解除された");
            console.log(e.gamepad);
            $("#commandStat").val("ゲームパッドの接続が解除されました。");
            //http://qiita.com/mimoe/items/629f535ffbd9e78db83b
            clearInterval(gamePadInterval);
        });
    }
}

function gamePadListen(gamePadID, gamePadInterval) {
    var gamepad_list = navigator.getGamepads(); //Chromeでは毎回呼び出す
    var gamePad = gamepad_list[gamePadID];
    //接続確認
    if (!gamePad) {
        clearInterval(gamePadInterval);
        $("#gpSW").prop("disabled", false);
        console.log("ゲームパッドの接続が解除されました。");
        $("#commandStat").val("ゲームパッドの接続が解除されました。");
        pMouse.x = 120;
        pMouse.y = 120;
        padDraw();
        return;
    }
// 軸リスト axes
    var axes = gamePad.axes;
    if (axes !== lastAxes) {
//http://www.w3.org/TR/gamepad/#remapping
//http://hakuhin.jp/js/gamepad.html#GAMEPAD_GAMEPAD_AXES
//左スティック　左右　axes[0] (-1.0 ~ +1.0)
//左スティック　上下　axes[1]
//右スティック　左右　axes[2]
//右スティック　上下　axes[3]
//console.log('gamepad axes,' + axes[0] + ', ' + axes[1] + ', ' + axes[2] + ', ' + axes[3] );
        pMouse.x = (axes[0] * 120) + 120;
        pMouse.y = (axes[1] * 120) + 120;
        padDraw();
    }
    lastAxes = axes;
    /*   // ボタンリスト
     var str;
     var buttons = gamepad.buttons; 		 str += "buttons: {\n";
     var j;
     var n = buttons.length;
     for (j = 0; j < n; j++) {
     // GamepadButton オブジェクトを取得
     var button = buttons[j];
     str += "  \"" + j + "\": { ";
     // ボタン押下状態
     str += "pressed:" + button.pressed + " , ";
     // ボタン入力強度
     str += "value:" + button.value + " }\n";
     } */
}
var muted = false;
function uiInitialize() {
//Camera servo control
//レンジ入力（input[type=range]）の変更時の値をリアルタイムに取得する　http://elearn.jp/jmemo/jquery/memo-287.html
//Xカメラ操作
    $("#xCamera").on('input', function () {
//JavaScriptでゼロ埋めする方法 http://stabucky.com/wp/archives/4655
        commandStr = "BTC:" + ("0" + $("#xCamera").val()).slice(-4) + "x";
    });
    //Center Click
    $("#xCset").click(function () {
        $("#xCamera").val($("#xCCenter").val());
        commandStr = "BTC:" + ("0" + $("#xCamera").val()).slice(-4) + "x";
    });
    //xCamera　中心　xCCenter
    $("#xCamera").val($("#xCCenter").val());
    $("#xCCenter").on('input', function () {
        $("#xCamera").val($("#xCCenter").val());
        commandStr = "BTC:" + ("0" + $("#xCamera").val()).slice(-4) + "x";
    });
    //Yカメラ操作
    $("#yCamera").on('input', function () {
        commandStr = "BTC:" + ("0" + $("#yCamera").val()).slice(-4) + "y";
    });
    //Center Click
    $("#yCSet").click(function () {
        $("#yCamera").val($("#yCCenter").val());
        commandStr = "BTC:" + ("0" + $("#yCamera").val()).slice(-4) + "y";
    });
    //CameraY↑範囲"yCMaxRange"
    $("#yCamera").prop('max', $("#yCMaxRange").val());
    $("#yCMaxRange").change(function () {
        $("#yCamera").prop('max', $("#yCMaxRange").val());
    });
    //CameraY↓範囲"yCMinRange
    $("#yCamera").prop('min', $("#yCMinRange").val());
    $("#yCMinRange").change(function () {
        $("#yCamera").prop('min', $("#yCMinRange").val());
    });
    //CameraY 補正"yCCenter"
    $("#yCamera").val($("#yCCenter").val());
    $("#yCCenter").on('input', function () {
        $("#yCamera").val($("#yCCenter").val());
        commandStr = "BTC:" + ("0" + $("#yCamera").val()).slice(-4) + "y";
    });
    //BT connect Click
    $("#btConn").click(function () {
        commandStr = "btConnect";
    });
    //switchCamera Click
    $("#camSW").click(function () {
        commandStr = "switchCamera";
    });
    //videoRotate https://sites.google.com/site/westinthefareast/home/html5/css3videorotate
    //http://www.buildinsider.net/web/jqueryref/005
    $("#videoRotate270").click(function () {
        $("#android-video").css("-webkit-transform", "rotate(270deg)");
    });
    $("#videoRotate0").click(function () {
        $("#android-video").css("-webkit-transform", "rotate(0deg)");
    });
    $("#RcBatVol").html("-.-");
    //テスト http://qiita.com/shizuma/items/d561f37f864c3ebb5096 jQuery 便利なonを使おう（on click)
    //$('#deBug').click(getSnap);
    //debug カクチュウ　35.764267, 137.954661
//    $('#deBug').click(function () {
//        readJData("{'no':'DeBug','lat':35.764267,'lng':137.954661,'alti':700,'accuracy':10,'btr':'BAT:0.0'}");
//    });
    //JavaScript入門（HTML5編） 音量とミュート
    //http://www.pori2.net/html5/Video/040.html
    var media = document.getElementById("android-video");
    $('#mute').click(function () {
        if (muted === false) {
            media.muted = true;
            muted = true;
        } else {
            media.muted = false;
            muted = false;
        }
    });
}

function setMsgTextArea(str) {
    $("#messages").val(str + "\n" + $("#messages").val());
    //http://www.jquerystudy.info/reference/css/scrollTop.html
    //$("#messages").scrollTop();
}

function setBtTextArea(str) {
    var val = $("#btMessages").val().substr(0, 100);
    $("#btMessages").val(str + "\n" + val);
    //$("#btMessages").scrollTop();
}

var encPos = null;
var gpsPoly; //GPSポリライン
var encPoly; //ホイル回転推定ポリライン
var setMarker = null; //現在地修正マーカー
var gmMarker = null; //GPSモジュ‐ルマーカー
var startInfoWin; //位置修正出来ますよインフォ
var setPos = null; //位置修正ポジ
var setDrag = false; //位置修正中
var setInfoWin; //位置修正決定インフォ
var gpsAccCircle = null; //GPS精度 距離
var encMarkerArray = [];
function polyInitialize(pos) {
    //シンボルをポリラインに追加する https://developers.google.com/maps/documentation/javascript/symbols?hl=ja#add_to_polyline
    //var lineSymbol = { google.maps.SymbolPath.FORWARD_CLOSED_ARROW　};
    //GPSは赤マーカー
    gpsPoly = new google.maps.Polyline({
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 3,
        //icons: [{ 最後にしかマーカーされない
        //icon: lineSymbol,
        //offset: '100%'
        //}],
        zIndex: 1// 重なりの優先値(z-index)
    });
    //エンコーダーは青マーカー
    encPoly = new google.maps.Polyline({
        strokeColor: '#0000FF',
        strokeOpacity: 1.0,
        strokeWeight: 3,
        //icons: [{ 最後にしかマーカーされない
        //icon: lineSymbol,
        //offset: '100%'
        //}],
        zIndex: 1// 重なりの優先値(z-index)
    });
    //GPS 精度円
    gpsAccCircle = new google.maps.Circle({
        fillColor: '#ff0000', // 塗りつぶし色
        fillOpacity: 0.2, // 塗りつぶし透過度（0: 透明 ⇔ 1:不透明）
        strokeColor: '#ff0000', // 外周色
        strokeOpacity: 0.5, // 外周透過度（0: 透明 ⇔ 1:不透明）
        strokeWeight: 1, // 外周太さ（ピクセル）
        zIndex: 1, //
        center: pos,
        radius: 100,
        map: map
    });
    //現在位置指定マーカー　青丸　（ポリラインの終端。）
    setMarker = new google.maps.Marker({
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 3,
            strokeColor: '#0000FF'
        },
        draggable: true, // ドラッグ可能にする
        map: map,
        position: pos,
        zIndex: 4// 重りの優先値(z-index)
    });
    map.setCenter(pos);
    //GPSモジュールマーカー
    gmMarker = new google.maps.Marker({
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 3,
            strokeColor: '#00FF00'
        },
        map: map,
        position: pos,
        zIndex: 3// 重りの優先値(z-index)
    });
    //情報ウィンドウを開く/閉じる http://www.ajaxtower.jp/googlemaps/ginfowindow/index2.html
    //google.maps.InfoWindow class
    //https://developers.google.com/maps/documentation/javascript/3.exp/reference?hl=ja#InfoWindow
    startInfoWin = new google.maps.InfoWindow({
        content: '青丸アイコンを現在地にドラッグしてください。'
    });
    startInfoWin.open(map, setMarker);
    setInfoWin = new google.maps.InfoWindow({
        content: '<button onClick="setEndInfoWin()">現在位置設定</button>'
    });
    //マウスによる位置修正 http://orange-factory.com/dnf/googlemap_v3.html
    // マーカーのドロップ（ドラッグ終了）時のイベント
    google.maps.event.addListener(setMarker, 'dragend', function (ev) {
        startInfoWin.close();
        setDrag = true;
        // イベントの引数evの、プロパティ.latLngが緯度経度。
        setPos = ev.latLng;
        map.setCenter(setPos);
        setInfoWin.open(map, setMarker);
        //移動のキャンセル
        google.maps.event.addListener(setInfoWin, 'closeclick', function () {
            setDrag = false;
            map.setCenter(pos);
        });
    });
    //複数のマーカーをまとめて地図上から削除する http://googlemaps.googlermania.com/google_maps_api_v3/ja/map_example_remove_all_markers.html
    //マーカー、パスのクリア
    $("#mapClear").click(function () {
        for (var i = 0; i < encMarkerArray.length; i++) {
            encMarkerArray[i].setMap(null);
        }
        encMarkerArray = [];
        var gPath = gpsPoly.getPath();
        var ePath = encPoly.getPath();
        gpsPoly.setMap(null);
        encPoly.setMap(null);
        //ポリラインを検査する https://developers.google.com/maps/documentation/javascript/shapes?hl=ja#polyline_remove
        //MVCArray class  https://developers.google.com/maps/documentation/javascript/3.exp/reference?hl=ja#MVCArray
        gPath.clear();
        ePath.clear();
    });
}

function setEndInfoWin() {
    setInfoWin.close();
    //位置修正、最後のENCマーカー,パスを削除
    if (encMarkerArray.length !== 0) {
        var lastEncMaker = encMarkerArray.pop(encMarker);
        lastEncMaker.setMap(null);
        var ePath = encPoly.getPath();
        ePath.pop();
    }
    encPathDraw(setPos);
    encPos = setPos;
    setDrag = false;
}

//エンコーダー軌跡　ポイントは緑のEncMaker
//（TODO:位置修正対応（パスを修正））
function encPathDraw(pos, rota) {
//マーカーのドラッグしていないときはENCMAKERと位置指定が同じ場所に
    if (!setDrag) {
        setMarker.setPosition(pos);
    }
    var ePath = encPoly.getPath();
    //GoogleMAP上の高度
    //gElevation(rPos);
    ePath.push(pos);
    var encMarker = new google.maps.Marker({
        position: pos,
        icon: {path: 'M -2,2 0,-2 2,2 0,0 z',
            scale: 3,
            strokeColor: '#00FF00',
            rotation: rota
        },
        map: map,
        zIndex: 1// 重なりの優先値(z-index)
    });
    //関数で呼ばないとInfowindowが重なる
    attachMessage(encMarker, rota);
    encPoly.setMap(null);
    encPoly.setMap(map);
    encMarkerArray.push(encMarker);
}

//ローバーアイコンのWindow
var lastInfoWin = null;
function attachMessage(marker, rota) {
    // infowindow内のコンテンツ(html)を作成 http://kwski.net/api/799/
    var time = new Date(jData.time); //time.toLocaleString()
    //http://www.nanchatte.com/map/showDifferentInfoWindowOnEachMarker.html
    var infoWin = new google.maps.InfoWindow({
        maxWidth: 300, // infowindowの最大幅を設定
        content: '<div class="infowindow' + jData.no + '">'
                + 'No.' + jData.no
                // '<img src="' + imgfile + '" width="100">'
                + ', ' + time.toLocaleString() + '<br />'
                + ',GPS高度:' + jData.alti + 'm'
                + ',方向:' + rota + '°' + ',pitch ' + jData.pitch + '°'
                + ',roll:' + jData.roll + '°'
                //+ '<br>btr:' + jData.btr
                + '</div>'
    });
    // イベントを取得するListenerを追加
    google.maps.event.addListener(marker, 'click', function () {
        //次のウィンドウが表示されるまでウィンドウを表示
        if (lastInfoWin !== null) {
            lastInfoWin.close();
        }
        lastInfoWin = infoWin;
        //ウィンドウオープンopen(map:Map|StreetViewPanorama, anchor?:MVCObject)
        infoWin.open(marker.getMap(), marker);
    });
    // mouseoutイベントを取得するListenerを追加
    //google.maps.event.addListener(marker, 'mouseout', function(){
    google.maps.event.addListener(infoWin, 'closeclick', function () {
        infoWin.close();
    });
}

var commandStr = "";
var lastCommand = "";
var lastBtR = "";
var gpsAccCount = 0;
var lastGpsPos = null;
var lastEncPos = null;
var jData = null;
var sumRota = 0;
var rCount = 0;
var sumDis = 0;
var recDis = 0;
const ori8 = ["N W", "  N  ", "N E", " E ", "S E", " S ", "S W", " W ", "N W", "  N  ", "N E", " E "];
var oriBar = "W";
for (var i = 0; i < ori8.length; i++) {
    oriBar += ("|........|........|" + ori8[i]);
}
var encMarker = null;
var gpsNum = 0;
var hdop = 0;
function readJData(res) {
    //res.replace(/\r?\n/g, "");
    $("#JSON").html(res);
    //Androidデータ読み出し
    //jData = eval('(' + res + ')');
    jData = JSON.parse(res);
    //console.log(res);
    //Chromeデベロッパー・ツールの機能 http://www.buildinsider.net/web/chromedevtools/01#page-9
    //jData.rota 0-180と0~-180 -> 0-360変更済み
    //現在位置
    $('#droidroneStat').html("No.: " + jData.no
            + ", GPS lat:" + jData.lat
            + ", lng: " + jData.lng
            + ", 高度: " + jData.alti + 'm'
            + ', 誤差: ' + jData.accuracy + 'm'
            + ', pitch: ' + jData.pitch + '°'
            + ', roll: ' + jData.roll + '°'
            + ', GPS数: ' + gpsNum + ', HDOP: ' + hdop);
    //方向平均値用
    sumRota += jData.rota;
    rCount++;
    //方角表示
    $("#orient").html(("00" + jData.rota).substr(-3) + ":" + oriBar.substr(Math.floor(jData.rota / 2), 90).substr(25, 45));
    //Android　バッテリ情報
    $("#Astat").html(" Bat: " + jData.batLevel + "％, Temp: " + (jData.batTemp / 10).toFixed(1) + "℃, LTE Level: " + jData.lte);
    //メディアPeer接続後にBTコマンドが前回と違うとコマンド送信
    if (helloAndroid && commandStr !== lastCommand) {
        lastCommand = commandStr;
        $("#commandStat").val('PeerSend[' + commandStr + ']');
        //console.log(commandStr);
        // Peer送信
        if (peerdConn && commandStr !== "") {
            peerdConn.send(commandStr);
            //CameraSwitch 連続押し対応
            if (commandStr === "switchCamera") {
                commandStr = "";
            }
        }
    }

    //BuleTooth受信解析
    var btr = jData.btr;
    if (btr !== "") {
        //GPSモジュール　解析
        //ＧＰＳ受信機キット　１ＰＰＳ出力付き　「みちびき」対応　http://akizukidenshi.com/catalog/g/gK-09991/
        //GPSのNMEAフォーマットhttp://www.hiramine.com/physicalcomputing/general/gps_nmeaformat.html
        //例 $GPGGA,062950.000,3550.4017,N,13757.4716,E,2,11,0.81,652.2,M,37.7,M,0000,0000*6C
        if (btr.substr(0, 6) === "$GPGGA") {
            //https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/String/split
            var gpggaArray = btr.split(",");
            var utc = gpggaArray[1];
            var latStr = gpggaArray[2];
            gpsNum = gpggaArray[7];
            hdop = gpggaArray[8];//HDOP 水平精度低下率
            //console.log("lat,dec:" + latStr.substr(2));
            gmLat = parseFloat(latStr.substr(0, 2)) + (parseFloat(latStr.substr(2)) / 60);
            var lngStr = gpggaArray[4];
            //console.log("lng,dec:" + lngStr.substr(3));
            gmLng = parseFloat(lngStr.substr(0, 3)) + (parseFloat(lngStr.substr(3)) / 60);
            //setBtTextArea("lat:" + gmLat + ", lng:" + gmLng);
            var gmPos = new google.maps.LatLng(gmLat, gmLng);
            //gmMarker.setMap(null);
            if (gmMarker !== null) {
                gmMarker.setPosition(gmPos);
            }
            //gmMarker.setMap(map);
        } else {
            lastBtR = btr;
            //if (lastBtR !== btr) {
            setBtTextArea(btr);
            var dis = btrDecode(btr);
            if (encPos !== null) {
                if (dis !== 0) {
                    var avgRota = jData.rota;
                    if (rCount !== 0) {
                        avgRota = sumRota / rCount;
                        sumRota = 0;
                        rCount = 0;
                    }
                    encPos = google.maps.geometry.spherical.computeOffset(encPos, dis, avgRota);
                    //地図上の２点間の距離を求める http://www.nanchatte.com/map/computeDistance.html
                    //var distance = google.maps.geometry.spherical.computeDistanceBetween(encPos, lastEncPos);
                    //setBtTextArea("距離" + distance.toFixed(2) + "m," + btr + ",rot:" + jData.rota + "°.");
                    //距離が2m動いたらパス描画,データ記録
                    //if (distance > 2) {
                    sumDis += dis;
                    if (sumDis > 2) {
                        encPathDraw(encPos, avgRota);
                        recDis += sumDis;
                        if ($('#mapLink').prop('checked')) {
                          //軌跡記録
                          videoSnapShot(jData);
                        }
                        sumDis = 0;
                    }
                }
                //地図中心　エンコーダ
                if ($('#encCenter').prop('checked')) {
                    map.setCenter(encPos);
                }
                //Encマーカー　青
                if (encMarker !== null) {
                    encMarker.setMap(null);
                }
                encMarker = new google.maps.Marker({
                    position: encPos,
                    icon: {path: 'M -2,2 0,-2 2,2 0,0 z', // 矢印中心が先っぽだけだったのでPath作った。
                        //var arrowPath = google.maps.SymbolPath.FORWARD_CLOSED_ARROW;
                        scale: 3,
                        strokeColor: '#0000FF',
                        rotation: jData.rota
                    },
                    map: map,
                    zIndex: 2// 重なりの優先値(z-index)
                });
            }
        }
    }
    //`スマフォGPS受信
    if (jData.lat === 'NoData') {
        $("#orient").html("GPSが受信できません");
    } else {
        var gpsPos = new google.maps.LatLng(jData.lat, jData.lng);
        //GPS初回受信　エンコーダ位置指定
        if (lastGpsPos === null) {
            lastGpsPos = gpsPos;
            polyInitialize(gpsPos);
        }
        //GPS (位置設定までGPSで地図中心
        if (setPos === null) {
            map.setCenter(gpsPos);
            setMarker.setPosition(gpsPos);
        }
        //地図中心　
        if ($('#gpsCenter').prop('checked')) {
            map.setCenter(gpsPos);
        }
        if (gpsAccCount === 0) {
            //前回GPS精度円を除去
            gpsAccCircle.setMap(null);
            gpsAccCount = 10;
            //半径を指定した円を地図上の中心点に描く http://www.nanchatte.com/map/circle-v3.html
            gpsAccCircle.setCenter(gpsPos);
            // 中心点(google.maps.LatLng)
            gpsAccCircle.setRadius(jData.accuracy);
            gpsAccCircle.setMap(map);
        }
        gpsAccCount--;
        //GPS精度が10m以内ならパス描画
        if (jData.accuracy < 10) {
            //地図上の２点間の距離を求める http://www.nanchatte.com/map/computeDistance.html
            //var distance = google.maps.geometry.spherical.computeDistanceBetween(gpsPos, lastGpsPos);
            //距離が10m動いたらパス描画,データ記録
            //if (distance > 10) {
            if (lastGpsPos !== gpsPos) {
                lastGpsPos = gpsPos;
                var gPath = gpsPoly.getPath();
                //GoogleMAP上の高度
                //gElevation(rPos);
                gPath.push(gpsPos);
                gpsPoly.setMap(null);
                gpsPoly.setMap(map);
            }
        }
    }
    //GPSモジュール　NMEAフォーマット　http://www.hiramine.com/physicalcomputing/general/gps_nmeaformat.html
    nmeaPos = nmeaPosDecode(jData.nmea);
    //TODO: 自動操縦 (将来的にはAndroidで、）
    if (!$('#autoOff').prop('checked')) {
        autoPilot(jData.rota);
    }

//Videoの向きを判断して回転
//2016.11.15 Android縦専用にした。
//    if (vRotate === 0 && video.get(0).videoHeight > video.get(0).videoWidth ){
//        video.css("-webkit-transform", "rotate(270deg)");
//        vRotate = 270;
//    }
//    //横長になった
//    if (vRotate === 270 && video.get(0).videoHeight < video.get(0).videoWidth ){
//        video.css("-webkit-transform", "rotate(0deg)");
//        vRotate = 0;
//    }
}

function  btrDecode(btr) {
    var dis = 0;
    //（RCバッテリー電圧）
    if (btr.substr(0, 4) === "BAT:") {
        var a0Vol = btr.substr(4) * 0.0112; //(10 / 1024); 分圧1/2ですが実測値より計算
        $("#RcBatVol").html(a0Vol.toFixed(1) + "V");
        //ローバーホイル回転センサー受信
    }
//（タイヤ回転センサ）
    if (btr.substr(0, 4) === "RPS:" && btr.substr(4) !== '0' && encPos !== null) {
//タイヤ一回転カウントでの距離
        var countM = Number($("#countM").val()) * 0.001;
        //ホイルカウントから1秒間の距離を計算
        dis = Number(btr.substr(4)) * countM;
        //Google Maps JavaScript API V3 ジオメトリ ライブラリ //http://gm-api.net/geometry.html
        //computeOffset() を使用すると、特定の方向、出発地、移動距離（メートル単位）から、目的地の座標を計算できます。
        //https://developers.google.com/maps/documentation/javascript/3.exp/reference#spherical
    }
    return dis;
}

function videoSnapShot(jData) {
//video画面をGD保存 $('#android-video');
//attr(key,value) http://semooh.jp/jquery/api/attributes/attr/key%2Cvalue/
    $('#tmp-canvas').attr("width", $('#android-video').get(0).videoWidth);
    $('#tmp-canvas').attr("height", $('#android-video').get(0).videoHeight);
    //http://www.html5.jp/tag/elements/video.html
    //videoの任意のフレームをcanvasに描画するメモ　http://d.hatena.ne.jp/favril/20100225/1267099197
    var tmpCanvas = $('#tmp-canvas').get(0);
    var tmpCtx = tmpCanvas.getContext("2d");
    tmpCtx.drawImage($('#android-video').get(0), 0, 0);
    //第2引数は品質レベルで、0.0~1.0の間の数値です。高いほど高品質。
    var url = tmpCanvas.toDataURL("image/jpeg", 0.5);
    var rJson = JSON.stringify(jData);
    //記録用GDフォルダ作製
    if (jData !== null) {
        if (saveDirID === 0) {
            gdInsertFolder(jData.time, url, rJson);
        } else {
            gdUploadImg(jData.time + ".jpg", url, rJson);
        }
    }
}
//GPSモジュール　NMEAフォーマット　http://www.hiramine.com/physicalcomputing/general/gps_nmeaformat.html
function nmeaPosDecode(str) {
    var lat, lng;
    return new google.maps.LatLng(lat, lng);
}

var autoPoly;
var autoSetPos;
var autoSetMaker = null;
var reachInfoWin;
var reachInfoWinClose = false;
var autoFinCircle;
//TODO: 自動操縦 (将来的にはAndroidでやるべきだろう、LTE通信が途切れても移動するため）
function autoPilot(rota) {
    if (autoSetMaker === null) {
        //https://developers.google.com/maps/documentation/javascript/3.exp/reference?hl=ja#PolylineOptions
        autoPoly = new google.maps.Polyline({
            strokeColor: '#00FFFF',
            strokeOpacity: 1.0,
            strokeWeight: 2,
            editable: true,
            zIndex: 1// 重なりの優先値(z-index)
        });
        autoSetMaker = new google.maps.Marker({});
        reachInfoWin = new google.maps.InfoWindow({
            content: '次の移動場所に行くならClose'
                    //'<button onClick="checkedInfoWin()"></button>'
        });
        autoFinCircle = new google.maps.Circle({
            fillColor: '#00ff00', // 塗りつぶし色 緑
            fillOpacity: 0.2, // 塗りつぶし透過度（0: 透明 ⇔ 1:不透明）
            strokeColor: '#00ff00', // 外周色
            strokeOpacity: 0.5, // 外周透過度（0: 透明 ⇔ 1:不透明）
            strokeWeight: 1, // 外周太さ（ピクセル）
            zIndex: 1 //
        });
        google.maps.event.addListener(reachInfoWin, 'closeclick', function () {
            reachInfoWinClose = true;
        });
        //自動運転移動場所設定　PATH
        google.maps.event.addListener(map, 'click', function (ev) {
            if (!setDrag && !$('#autoOff').prop('checked')) {
                var autoPath = autoPoly.getPath();
                autoPath.push(ev.latLng);
                autoPoly.setMap(map);
            }
        });
    }
    var setDis = 1.0; //自動運転停止、設定位置までの距離
    //https://developers.google.com/maps/documentation/javascript/3.exp/reference?hl=ja#MVCArray
    var autoPath = autoPoly.getPath();
    var num = autoPath.getLength();
    if (num > 0) {
        autoSetPos = autoPath.getAt(0);
        autoSetMaker.setMap(null);
        autoSetMaker.setPosition(autoSetPos);
        autoSetMaker.setMap(map);
        //前回設定終了円を除去
        autoFinCircle.setMap(null);
        //半径を指定した円を地図上の中心点に描く http://www.nanchatte.com/map/circle-v3.html
        autoFinCircle.setCenter(autoSetPos); // 中心点(google.maps.LatLng)
        autoFinCircle.setRadius(setDis);
        autoFinCircle.setMap(map);
        //https://developers.google.com/maps/documentation/javascript/geometry?hl=ja#Navigation
        var heading = google.maps.geometry.spherical.computeHeading(encPos, autoSetPos);
        var distance = google.maps.geometry.spherical.computeDistanceBetween(encPos, autoSetPos);
        if (heading < 0) { //マイナス角度修正
            heading += 360;
        }
        setBtTextArea("設定までd:" + distance.toFixed(2) + "m,　h:" + heading.toFixed(0) + "°.");
        //設定場所到着
        if (distance < setDis) {
            commandStr = "BTC:15001500m"; //停止
            if ($('#selfOn').prop('checked') && !reachInfoWinClose) {
                reachInfoWin.open(map, autoSetMaker);
            } else {
                autoSetMaker.setMap(null);
                autoPath.removeAt(0);
                reachInfoWinClose = false;
            }
        } else {
            //目的までの方向条件
            var speed = 1470;
            //direction は　rotaから見たheadingの角度
            var direction = heading - rota;
            // 左　０　～　-１８０、　右　０～１８０
            if (direction < -180) {
                direction += 360;
            }
            if (direction > 180) {
                direction -= 360;
            }
            if (direction > 0) {
                //ローバーの右が目的地
                if (direction > 90) { //急角度
                    commandStr = "BTC:" + "1700" + speed + "m";
                    $("#commandStat").val(rota + '自動操縦 右 急旋回' + direction.toFixed(0));
                } else if (direction < 10) {
                    commandStr = "BTC:" + "1500" + speed + "m";
                    $("#commandStat").val(rota + '自動操縦　直進' + direction.toFixed(0));
                } else { // 右　なだらか
                    commandStr = "BTC:" + "1600" + speed + "m";
                    $("#commandStat").val(rota + '自動操縦 右 旋回' + direction.toFixed(0));
                }
            } else {
                //ローバーの左が目的地
                if (direction < -90) {
                    commandStr = "BTC:" + "1300" + speed + "m";
                    $("#commandStat").val(rota + '自動操縦 左 急旋回' + direction.toFixed(0));
                } else if (direction > -10) {
                    commandStr = "BTC:" + "1500" + speed + "m";
                    $("#commandStat").val(rota + '自動操縦　直進' + direction.toFixed(0));
                } else {
                    commandStr = "BTC:" + "1400" + speed + "m";
                    $("#commandStat").val(rota + '自動操縦 左　旋回' + direction.toFixed(0));
                }
            }
        }
    }
}
var peer = null;
var gapi;
var peerdConn = null; // 接続したコネを保存しておく変数
var helloAndroid = false;
var lastAxes;
var googleName;
var googleID;
var skyWayFolderID = "";
var saveDirID = 0;
//SkyWayに関するドキュメントとサンプルアプリ
//https://nttcom.github.io/skyway/documentation.html
// SkyWayのシグナリングサーバーへ接続する (APIキーを置き換える必要あり）
const apiKey = '30fa6fbf-0cce-45c1-9ef6-2b6191881109';
//Drive REST API JavaScript Quickstart
//https://developers.google.com/drive/v2/web/quickstart/js
// Your Client ID can be retrieved from your project in the Google
// Developer Console, https://console.developers.google.com
const CLIENT_ID = '233745234921-nv641kj8arbantub6qde76ld1l2pp4jf.apps.googleusercontent.com';
//google api authorizeでの複数スコープ指定+α http://qiita.com/anyworks@github/items/bdba3cd8f17e1d6cc8b3
//OAuth 2.0 Scopes for Google APIs https://developers.google.com/identity/protocols/googlescopes
const SCOPES = ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/userinfo.profile'];
const MapLinkGDFolderID = '0ByPgjiFncZu1a3B1dEdLVVJzOFk'; //\\i386koba\SkyWayRC\MapLink

const boundary = '-------314159265358979323846';
const delimiter = "\r\n--" + boundary + "\r\n";
const close_delim = "\r\n--" + boundary + "--";
// Initiate auth flow in response to user clicking authorize button.
function handleAuth() {
    //既存のPeer再接続（Android再起動の場合）
    if (helloAndroid) {
        return false;
        //peer.destroy();
        //helloAndroid = false;
    }
    peer = new Peer({key: apiKey, debug: 3});
    peer.on('error', function (err) {
        setMsgTextArea('peer-err : ' + err);
    });
    peer.on('close', function () {
        peer.destroy();
        setMsgTextArea('peer Close: : ');
        helloAndroid = false;
        //$("#authorizeButton").prop("disabled", false);
    });
    peer.on('open', function () {
        // - 自分のIDはpeerオブジェクトのidプロパティに存在する
        setMsgTextArea('My PeerID : ' + peer.id);
    });
    //immediate: false
    gapi.auth.authorize({client_id: CLIENT_ID, scope: SCOPES.join(" "), immediate: false}, handleAuthResult);
    return false;
}

//Check if current user has authorized this application.
//function checkAuth() {
//    gapi.auth.authorize({'client_id': CLIENT_ID, 'scope': SCOPES.join(' '), 'immediate': true}, handleAuthResult);
//}

function handleAuthResult(authResult) {
    var authButton = document.getElementById('authorizeButton');
    if (authResult && !authResult.error) {
// Access token has been successfully retrieved, requests can be sent to the API.
        gapi.client.load('drive', 'v2', loadPeerId);
    } else {
// No access token could be retrieved, show the button to start the authorization flow.
        authButton.onclick = function () {
            gapi.auth.authorize({'client_id': CLIENT_ID, 'scope': SCOPES.join(" "), 'immediate': false}, handleAuthResult);
        };
    }
}

function loadPeerId() {
//SkyWayフォルダ検索
    var SKYWAYRC_DIR = "SkyWayRC";
    var SKYWAY_ANDROID_ID = "SkyWayAndroid.id";
    //Drive REST API JavaScript Quickstart https://developers.google.com/drive/v2/web/quickstart/js
    var skyWayIdfileID = "";
    var requestFolder = gapi.client.drive.files.list({
        q: "'root' in parents and mimeType = 'application/vnd.google-apps.folder'and trashed = false"
    });
    //Search for Folder
    requestFolder.execute(function (resp) {
        setMsgTextArea("Google drive load PeerId file.");
        //appendPre('Files:');
        var files = resp.items;
        if (files && files.length > 0) {
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                if (file.title === SKYWAYRC_DIR) {
                    skyWayFolderID = file.id;
                    setMsgTextArea("Folder:" + file.title);
                } //else { //setMsgTextArea(file.title ); }
            }
            var requestFile = gapi.client.drive.files.list({
                q: "'" + skyWayFolderID + "' in parents and mimeType = 'text/plain'"
            });
            //Search for Files
            requestFile.execute(function (resp) {
                //appendPre('Files:');
                var files = resp.items;
                if (files && files.length > 0) {
                    for (var i = 0; i < files.length; i++) {
                        var file = files[i];
                        if (file.title === SKYWAY_ANDROID_ID) {
                            skyWayIdfileID = file.id;
                            setMsgTextArea("File:" + file.title);
                            //downloadFile(file, function (responseText){
                            //setMsgTextArea("download peer.id:" + responseText);
                            //});
                        }
                    }
                    var requestIdGet = gapi.client.drive.files.get({'fileId': skyWayIdfileID});
                    requestIdGet.execute(function (resp) {
                        console.log('Title: ' + resp.title);
                        console.log('Description: ' + resp.description);
                        console.log('MIME type: ' + resp.mimeType);
                        setMsgTextArea("Android peer.id:" + resp.description);
                        //Peer ID 接続
                        peerStart(resp.description);
                        //ボタンを無効にする
                        //$("#authorizeButton").prop("disabled", true);
                    });
                } else {
                    setMsgTextArea("SkyWayAndroid.id not found:");
                }
            });
        } else {
            setMsgTextArea('SkyWayRC-folder not found:');
        }
    });
    //How to get user email from google plus oauth http://stackoverflow.com/questions/11606101/how-to-get-user-email-from-google-plus-oauth
    var request = gapi.client.request({
        'path': '/oauth2/v1/userinfo', //?alt=json',
        'method': 'GET'
    });
    request.execute(function (resp) {
        console.log(resp);
        googleName = resp.name;
        googleID = resp.id;
    });
}

//TODO:　カメラ画像、経路データをGoogleDriveに保存
//skyWayFolderIDの下に読み込み共有の経路ファイル、写真用のTime番号のフォルダ作る。
//GoogleDrive経路一覧共通ファイルに上記フォルダIDを追加。
//GDフォルダ作成 Creating a folder https://developers.google.com/drive/v2/web/folder#creating_a_folder
//Google Driveフォルダに権限追加する方法 http://qiita.com/nurburg/items/7720d031a3adac5a3c34#%E6%9B%B8%E3%81%8D%E6%96%B9
//Google Drive APIs REST v2 Permissions: insert https://developers.google.com/drive/v2/reference/permissions/insert
var mapLinkID;
function gdInsertFolder(name, url, data) {
    var request = gapi.client.drive.files.insert({
        'path': '/upload/drive/v2/files',
        'method': 'POST',
        "title": name,
        "parents": [{"id": skyWayFolderID}],
        "mimeType": "application/vnd.google-apps.folder"
    });
    //画像保存Folder作成　id = saveDirID
    request.execute(function (insert) {
        saveDirID = insert.id;
        console.log("application/vnd.google-apps.folder");
        //console.log(insert);
        setMsgTextArea('JpegSaveDirID :' + saveDirID);
        //permissions change(共有（読み出し））
        var body = {
            //'value': value,//mailAddress
            'type': 'anyone',
            'role': 'reader'
        };
        var perRequest = gapi.client.drive.permissions.insert({
            'fileId': saveDirID,
            'resource': body,
            'sendNotificationEmails': 'false'  //"false"にすると通知メールが飛びません
        });
        perRequest.execute(function (resp) {
            console.log('folder permissions:Done');
            console.log(resp);
            gdUploadImg(name + ".jpg", url, data);
        });
        //軌跡記録リンク用フォルダ作成　id = mapLinkID (全ユーザーの記録先をフォルダファイルで記録)
        //（gapi.client.drive.files.insertがJSでフォルダのみの模様）
        var json = eval('(' + data + ')');
        var recRequest = gapi.client.drive.files.insert({
            'path': '/upload/drive/v2/files',
            'method': 'POST',
            //ユーザー名には、アンパサンド（&）、等号（=）、山かっこ（<、>）、プラス記号（+）、カンマ（,）を使用できません。また、1 行に複数のピリオド（.）を含めることはできません。
            "title": [json.lat, json.lng, googleName].join(','),
            "parents": [{"id": MapLinkGDFolderID}],
            //https://developers.google.com/drive/v3/web/mime-types
            "mimeType": "application/vnd.google-apps.folder",
            'description': [saveDirID, googleID].join(',')
        });
        recRequest.execute(function (insert) {
            mapLinkID = insert.id;
            console.log('mapLink:' + mapLinkID);
            setMsgTextArea('mapLink:' + mapLinkID);
            console.log(insert);
        });
    });
}

//距離の短い軌跡データは削除する mapLinkID, saveDirID
function gdDelFolder() {
//DEL saveDirID folder
    var request1 = gapi.client.drive.files.delete({
        'fileId': saveDirID
    });
    request1.execute(function (resp) {
        console.log(resp);
    });
    //DEL mapLinkID folder
    var request2 = gapi.client.drive.files.delete({
        'fileId': mapLinkID
    });
    request2.execute(function (resp) {
        console.log(resp);
    });
    setMsgTextArea('移動距離が短いので軌跡記録を破棄します.');

}
//HTML5のvideoとcanvasで動画のキャプチャを取る http://maepon.skpn.com/web/entry-32.html
//GDアップロードにはSimple、マルチパートがある。
//Simple upload https://developers.google.com/drive/v2/web/manage-uploads#simple
//うまくいかなかった。gapi.client.drive.files.insertはフォルダ以外のアップロードはJavascriptで使えない模様。
//gapi.client.requestでないとファイルのアップロードは無理。
//gapi.client.requestマルチパートアップロードでないとファイル名指定できない。シンプルアップロードではinsertでないとファイル名指定できない。
//よって、ファイル名を指定したいシンプルアップロードアップデートは無理な模様。
//application/vnd.google-apps.photo でインサートできるか？
//drive v2 でファイルupload http://qiita.com/anyworks@github/items/98ffc5b2cac77d440a1e
//いまさら聞けないHTTPマルチパートフォームデータ送信 http://d.hatena.ne.jp/satox/20110726/1311665904
//JavaScriptのみでGoogle Driveに動的にテキストや画像等を保存する http://qiita.com/kjunichi/items/552f13b48685021966e4
//Google Drive APIでFile OpenからSaveまで http://qiita.com/nida_001/items/9f0479e9e9f5051bca3c
function gdUploadImg(name, url, data) {
    var contentType = 'image/jpeg'; // 'application/octet-stream';
    var metadata = {
        'title': name,
        'mimeType': contentType,
        'parents': [{'id': saveDirID}], //親フォルダここで指定
        'description': data
    };
    //toDataURLのファイルの先頭　data:image/jpeg;base64,を削除
    var binaryData = url.replace(/^data:image\/(png|jpeg);base64,/, "");
    var multipartRequestBody =
            delimiter + 'Content-Type: application/json\r\n\r\n' +
            JSON.stringify(metadata) + delimiter +
            'Content-Type: ' + contentType + '\r\n' +
            'Content-Transfer-Encoding: base64\r\n' +
            '\r\n' + binaryData + close_delim;
    var request = gapi.client.request({
        'path': '/upload/drive/v2/files',
        'method': 'POST',
        'params': {'uploadType': 'multipart'},
        'headers': {'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'},
        'body': multipartRequestBody
    });
    request.execute(function (file) {
        console.log('Upload jpeg:' + name);
        setMsgTextArea('Upload jpeg:' + name + '/dis:' + recDis.toFixed(1) + 'm');
        console.log(file);
        //console.log(multipartRequestBody);
    });
}

function peerStart(destPeerId) {
//peer接続されていたら無効
    if (helloAndroid) {
        setMsgTextArea('Peer is already　Open.');
        return;
    }
// 相手への接続を開始する
    peerdConn = peer.connect(destPeerId);
    //, { serialization: 'none', metadata: {message: 'hi i want to chat with you!'} });
    setMsgTextArea('Try connect: ' + destPeerId);
    peerdConn.on('error', function (err) {
        setMsgTextArea('conn-err: ' + err);
        console.log(err);
    });
    // 接続が完了した場合のイベントの設定
    peerdConn.on("open", function () {
        setMsgTextArea('Open　connect: ' + peerdConn.peer);
        // メッセージ受信イベントの設定
        peerdConn.on("data", function (res) {
            //接続初回
            if (helloAndroid === false) {
                setMsgTextArea('From Android: ' + res);
                helloAndroid = true;
                //ブラウザ終了時、、リロード時の関数
                $(window).on("beforeunload", function () {
                    if (peer !== null) {
                        peer.destroy();
                        setMsgTextArea('Peer接続を破棄');
                    }
                    //距離が短い場合は、記録を削除
                    if (recDis !== 0 && recDis < 20) {
                        gdDelFolder();
                    }
                    return true;
                });
            } else {
                readJData(res);
            }
        });
    });
    peer.on('call', function (call) {
        // - 相手のIDはCallオブジェクトのpeerプロパティに存在する
        setMsgTextArea('Call from : ' + call.peer);
        call.answer();
        //呼び出しに応答する時のMediaStreamは必須ではありません。もし応答時にMediaStreamをセットしなければ、一方向の通話が確立されます。
        setMsgTextArea('call Answer null');
        call.on('stream', function (stream) {
            // 映像ストリームオブジェクトをURLに変換する
            // - video要素に表示できる形にするため変換している
            var url = window.URL.createObjectURL(stream);
            setMsgTextArea('stream url: ' + url);
            // video要素のsrcに設定することで、映像を表示する
            $('#android-video').prop('src', url);
        });
        call.on('error', function (err) {
            setMsgTextArea('call-err : ' + err);
        });
    });

}

//未使用//現在地の地図の高度を表示
function gElevation(pos) {
// Add a listener for the click event
//google.maps.event.addListener(map, 'click', addLatLng);
//GoogleMap高度を調査。GPS高度と比べて見る
//https://developers.google.com/maps/documentation/javascript/examples/elevation-simple
//http://www.nanchatte.com/map/getElevationForLocation.html
//GPS/地図の高度データが信用ならない理由 http://www.sc-runner.com/2013/07/why-gps-altitude-not-accurate.html
//What vertical datum is used in Google Earth https://productforums.google.com/forum/#!topic/maps/FZkvHCNri0M　(海水面高度か？）
// ElevationServiceのコンストラクタ
    var elevation = new google.maps.ElevationService();
    // リクエストを発行  locations: 要素が１つでも配列に…。
    elevation.getElevationForLocations({locations: [pos]}, function (results, status) {
        if (status === google.maps.ElevationStatus.OK) {
            if (results[0].elevation) {
                // 標高ゲット！
                var gElev = results[0].elevation;
                setBtTextArea('GoogleMAPの高度:' + Math.round(gElev) + 'm');
            }
        } else if (status === google.maps.ElevationStatus.INVALID_REQUEST) {
            alert("リクエストに問題アリ！requestで渡している内容を確認せよ！！");
        } else if (status === google.maps.ElevationStatus.OVER_QUERY_LIMIT) {
            alert("短時間にクエリを送りすぎ！落ち着いて！！");
        } else if (status === google.maps.ElevationStatus.REQUEST_DENIED) {
            alert("このページでは ElevationResult の利用が許可されていない！・・・なぜ！？");
        } else if (status === google.maps.ElevationStatus.UNKNOWN_ERROR) {
            alert("原因不明のなんらかのトラブルが発生した模様。");
        } else {
            alert("えぇ～っと・・、バージョンアップ？");
        }
    });
}

//テスト用
function getSnap() {
    var videoWidth = $('#android-video').get(0).videoWidth;
    var videoHeight = $('#android-video').get(0).videoHeight;
    console.log("videoWidth:Height = " + videoWidth + " : " + videoHeight);
    //attr(key,value) http://semooh.jp/jquery/api/attributes/attr/key%2Cvalue/
    $('#tmp-canvas').attr("width", videoWidth);
    $('#tmp-canvas').attr("height", videoHeight);
    //http://www.html5.jp/tag/elements/video.html
    //videoの任意のフレームをcanvasに描画するメモ　http://d.hatena.ne.jp/favril/20100225/1267099197
    var tmpCanvas = $('#tmp-canvas').get(0);
    var tmpCtx = tmpCanvas.getContext("2d");
    tmpCtx.drawImage($('#android-video').get(0), 0, 0);
    var img = new Image();
    // 第2引数は品質レベルで、0.0~1.0の間の数値です。高いほど高品質。
    img.src = tmpCanvas.toDataURL("image/jpeg", 0.5);
    // 日時からGD画像保存フォルダを作成 new Date().toISOString()
    if (saveDirID === 0) {
        gMkdir(new Date().getTime(), img.src, $("#JSON").text());
    } else {
        saveJpegM(new Date().getTime() + ".jpg", img.src, $("#JSON").text());
    }
//mapLink("test", "disTest");
    img.onload = function () {
        img.width = videoWidth / 2;
        img.height = videoHeight / 2;
        //縦長なら回転
        //if (videoWidth < videoHeight) {
        //tmpCanvas.css("-webkit-transform", "rotate(270deg)");
        //↑表示Canvasは回転するがキャプチャIMGは回転しない
        //DOM エレメント->jQuery オブジェクト http://please-sleep.cou929.nu/jquery-object-dom-element.html
        //$(img).css("-webkit-transform", "rotate(270deg)");
        //console.log("rotate.");
        //}
        //console.log("img.width:hight = " + img.width + " : " + img.height);
        $('#snap-area').append(img);
    };
}
