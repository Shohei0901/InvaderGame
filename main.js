/* クラス定義 */

//Machineクラス//
class Machine {
  constructor(canvas, context, x, y, r, color, isPlayer, vel) {
    this.canvas = canvas;     //キャンバス
    this.context = context;   //コンテキスト
    this.x = x;               //x座標
    this.y = y;               //y座標
    this.r = r;               //円の半径
    this.color = color;       //円の色
    this.bullets = [];        //弾丸の配列
    this.isPlayer = isPlayer; //プレイヤーならtrue, 敵ならfalseとする
    this.alive = true;        //生存中ならtrue, 撃墜されたらfalse
    this.vel = vel;           //速度
  }
  //自機を描くメソッド//
  drawMachine() {
    this.context.beginPath();
    this.context.arc(this.x, this.y, this.r, 0, 2 * Math.PI, true);
    this.context.fillStyle = this.color;
    this.context.fill();
    this.context.lineWidth = 3;
    this.context.stroke();
  }
  //自機の座標を中心にセット//
  setPointCenter() {
    this.x = this.canvas.width / 2;
  }
  //速度更新//
  updateVel(vel) {
    this.vel = vel;
  }
  updatePosition(dt) {
    this.x += this.vel * dt;
    if (this.canvas.width - this.r < this.x) { //右端
      this.x = this.canvas.width - this.r;
      this.vel *= this.isPlayer ? 1 : -1; //敵なら速度を反転
      this.y   += this.isPlayer ? 0 : this.r * 4; //敵なら2段下へ
    } else if (this.x < this.r) {         //左端
      this.x = this.r;
      this.vel *= this.isPlayer ? 1 : -1; //敵なら速度を反転
      this.y   += this.isPlayer ? 0 : this.r * 4; //敵なら2段下へ
    }
  }
  //弾丸発射//
  shootBullet(r, vel) {
    this.bullets.unshift(new Bullet(this.canvas, this.context, this.x, this.y, r, this.color, this.isPlayer, vel)); //弾丸を配列bulletsに追加
  }
  //配列bullets内の全ての弾丸を進める//
  moveBullets(dt) {
    for (let i = 0; i < this.bullets.length; i++) {
      this.bullets[i].moveBullet(dt);
      if (this.bullets[i].exist == false) {
        this.bullets[i] = null;
      }
    }
    this.bullets = this.bullets.filter(Boolean); //消失した弾丸を配列から削除
  }
  //配列bullets内の弾丸を全て描画//
  drawBullets() {
    for (let i = 0; i < this.bullets.length; i++) {
      this.bullets[i].drawBullet();
    }
  }
  //bullets内の弾丸がmachineに当たったらmachineのaliveをfalseに//
  attack(machine) {
    for (let i = 0; i < this.bullets.length; i++) {
      if (this.bullets[i].isHit(machine)) {
        this.bullets[i].exist = (this.bullets[i].r == bigBulletR) ? true : false;
        machine.alive = false;
      }
    }
  }
}

//Bullet(弾丸)クラス//
class Bullet {
  constructor (canvas, context, x, y, r, color, isPlayer, vel) {
    this.canvas = canvas; //キャンバス
    this.context = context; //コンテキスト
    this.x = x; //x座標
    this.y = y; //y座標
    this.r = r; //弾丸の直径
    this.color = color; //弾丸の色
    this.exist = true; //弾丸が画面内ならtrue, 画面外ならfalse
    this.isPlayer = isPlayer; //プレイヤーの弾丸ならtrue, 敵の弾丸ならfalseとする
    this.vel = vel; //弾丸の速度
  }
  //弾丸を描画//
  drawBullet() {
    this.context.beginPath(); //パスのリセット
    this.context.arc(this.x, this.y, this.r, 0, 2 * Math.PI, true);
    this.context.fillStyle = this.color;
    this.context.fill();
    this.context.lineWidth = 1;
    this.context.stroke();
  }
  //弾丸を進める//
  moveBullet (dt) {
    this.y += this.vel * dt * (this.isPlayer ? -1 : 1);
    if (this.y < 0) {
      this.exist = false;
    }
  }
  //machineにヒットしたかどうかの判定//
  isHit(machine) {
    if ((this.x - machine.x)**2 + (this.y - machine.y)**2 <= (this.r + machine.r)**2) {
      return true;
    } else {
      return false;
    }
  }
}

/* 関数定義  */

//背景描画関数
function drawBack(canvas, context, color) {
  context.beginPath(); //パスのリセット
  context.rect(0,0,canvas.width, canvas.height);
  context.fillStyle = color;
  context.fill();
}
//描画領域クリア用関数
function clearCanvas(canvas, context) {
  context.clearRect(0,0,canvas.width, canvas.height);
}
//ボーダーラインを引く関数
function drawBorderline(canvas, context, color, y) {
  context.beginPath(); //パスのリセット
  context.rect(0, canvas.height - y, canvas.width, 5);
  context.fillStyle = color;
  context.fill();
}


/* 変数定義  */

const UUID_ACCELEROMETER_SERVICE = 'e95d0753-251d-470a-a062-fa1922dfa9a8'
const UUID_ACCELEROMETER_SERVICE_CHARACTERISTIC_DATA   = 'e95dca4b-251d-470a-a062-fa1922dfa9a8'
const UUID_ACCELEROMETER_SERVICE_CHARACTERISTIC_PERIOD = 'e95dfb24-251d-470a-a062-fa1922dfa9a8'
const UUID_BUTTON_SERVICE = 'e95d9882-251d-470a-a062-fa1922dfa9a8'
const UUID_BUTTON_SERVICE_CHARACTERISTIC_A   = 'e95dda90-251d-470a-a062-fa1922dfa9a8'
const UUID_BUTTON_SERVICE_CHARACTERISTIC_B = 'e95dda91-251d-470a-a062-fa1922dfa9a8'
const INTERVAL = 10;// 取得間隔(ミリ秒)
let server = null;
let device = null;
let service_accel = undefined;
let char_accel = null;
let char_accelPeriod = null;
let service_button = null;
let char_buttonA = null;
let char_buttonB = null;

let accelX; //加速度
let buttonA, buttonB; //ボタン状態
let wt  = 500; //操作感度(>0) (MBで取得した加速度accelXの値に乗算する重み)

let animeID; //requestAnimationFrameの戻り値を格納する変数

let start;  //ゲーム開始時刻
let previous; //1つ前の時刻(1フレームあたりの時間dtを計算する時に使用(start-previous))

let spawnPeriod = 1.0; //敵の生成頻度[s]
let shootPeriod = 0.5; //敵の弾丸発射抽選を行う頻度[s]
let cntSec4Spawn; //敵の生成頻度[s]に達するまで時間をカウントする変数
let cntSec4Shoot; //敵が弾丸を発射する頻度[s]に達するまで時間をカウントする変数


let shake; //画面を揺らすときに使う変数
let shakeMax = 5; //画面の揺れ幅の最大値[px]

let playerClr = "blue", enemyClr = "red", backClr = "lightgray", borderClr = "white"; //色設定
let playerR = 10, enemyR = 15, bulletR = 5, bigBulletR = 25; //円の半径[px]
let borderY = playerR * 2 + 20; //ボーダーラインのy座標(下から) プレイヤー円の直径 + ちょっと

let playerBulletV = 900, playerBigBulletV = 50, enemyBulletV = 200; //弾丸の速度[px/s]
let bigBulletNumMax = 5, bigBulletNum; //大きい弾丸の発射数上限

let enemyNumMax = 100; //ゲーム内で生成する敵の数
let enemyNumFirst = 3; //ゲーム開始時に生成する敵の数
let enemyNum; //生成されていない残りの敵の数

let cnt, pre_cnt; //撃墜数と1つ前の撃墜数
let enemyVelMax = 150; //敵のスピードの最大値[px/s]

let shootRate = 0.1; //敵が弾丸を発射する確率(0<= shootRate <= 1)

let transX = 0, transY = 0; //描画領域の基準点座標

let canvas = document.getElementById("field"); //canvas情報を取得
let ctx = canvas.getContext("2d"); //コンテキストを取得(2D)

let player;       //プレイヤーのオブジェクト用変数
let enemies = []; //敵のオブジェクト用配列

let startButton = document.getElementById("startButton"); //スタートボタンのIDを取得
startButton.disabled = true; //スタートボタンを押せないようにする


//背景を描画
drawBack(canvas, ctx, backClr);

//接続//
async function connect() {
  device = await navigator.bluetooth.requestDevice({
    filters: [
      {services: [UUID_ACCELEROMETER_SERVICE, UUID_BUTTON_SERVICE]},
      { namePrefix: "BBC micro:bit" }
    ]}
  );
  server = await device.gatt.connect();
  alert("接続が完了しました(1/3)");
  service_accel = await server.getPrimaryService(UUID_ACCELEROMETER_SERVICE); //プライマリサービス(加速度サービス)取得
  char_accel = await service_accel.getCharacteristic(UUID_ACCELEROMETER_SERVICE_CHARACTERISTIC_DATA); //加速後測定値のキャラ取得
  char_accelPeriod = await service_accel.getCharacteristic(UUID_ACCELEROMETER_SERVICE_CHARACTERISTIC_PERIOD); //加速度取得周期のキャラ取得
  await char_accelPeriod.writeValue(new Uint16Array([INTERVAL]));//加速度取得周期を書き込み
  await char_accel.startNotifications();
  alert("加速度取得準備が完了しました(2/3)");
  service_button = await server.getPrimaryService(UUID_BUTTON_SERVICE);
  char_buttonA = await service_button.getCharacteristic(UUID_BUTTON_SERVICE_CHARACTERISTIC_A);
  char_buttonB = await service_button.getCharacteristic(UUID_BUTTON_SERVICE_CHARACTERISTIC_B);
  await char_buttonA.startNotifications();
  await char_buttonB.startNotifications();
  alert("ボタン状態取得準備が完了しました(3/3)");
  startButton.disabled = false;
}

//切断//
function disconnect() {
  cancelAnimationFrame(animeID);
  startButton.disabled = true;
  if (!device || !device.gatt.connected){
    return;
  }
  device.gatt.disconnect();
  alert("切断しました。");
}


//ゲーム中の処理//
function game (timestamp) {
  if (start == undefined) {
    start = timestamp;    //開始時刻を保存
    previous = timestamp;
    //敵を生成//
    for (let i = 0; i < enemyNumFirst; i++) {
      let enemyX = Math.random() * ((canvas.width-enemyR) - enemyR) + enemyR; //x座標をランダムでセット
      enemies.unshift(new Machine(canvas,ctx, enemyX, enemyR*(1+4*i), enemyR,enemyClr, false, 0)); //敵を配列の頭のほうから追加
      enemies[0].updateVel(Math.random() * (enemyVelMax - (-enemyVelMax)) + (-enemyVelMax)); //敵の速度をランダムで決定
      enemyNum--;
    }
  }

  //描画領域基準座標をリセット//
  ctx.translate(-transX, -transY);
  transX = transY = 0;

  //dtを計算//
  let dt = (timestamp - previous) / 1000;
  previous = timestamp;

  //敵生成頻度と敵の弾丸発射頻度用に時間を計測//
  cntSec4Spawn += dt;
  cntSec4Shoot += dt;

  //経過時刻を出力//
  var time = (timestamp - start) / 1000;
  document.getElementById("time").innerText = time.toFixed(2) + "[s]  ";

  //弾丸にあたったかどうか判定//
  for (let i = 0; i < enemies.length; i++) {
    if (enemies[i].y + enemies[i].r > canvas.height - borderY) { //敵がボーダーラインを超えたら
      player.alive = false;                                      //playerは死亡する
    }
    player.attack(enemies[i]); //playerの弾丸に敵が当たったか
    enemies[i].attack(player); //敵の弾丸にplayerが当たったか
    if (!enemies[i].alive) {   //enemies[i]が死んでいるなら
      enemies[i] = null;       //そいつをnullにする
      shake = 3;               //画面を揺らす
      cnt++;                   //撃墜数カウント
    }
  }
  enemies = enemies.filter(Boolean); //撃墜された敵(nullになったところ)を配列enemiesから削除

  //敵の追加//
  if (enemyNum > 0) {
    if (cntSec4Spawn >= spawnPeriod || pre_cnt != cnt) { //敵生成周期(spawnPeriod)分の時間が経過した or 敵を撃墜したら
      cntSec4Spawn = 0;　//敵生成周期の時間計測をリセット
      let enemyX = Math.random() * ((canvas.width-enemyR) - enemyR) + enemyR; //x座標をランダムでセット
      let enemyY = (1 + 4 * Math.round(Math.random() * (enemyNumFirst - 1))) * enemyR; //y座標をランダムでセット(最初に生成された敵のY座標のどれかをランダムでセット)
      enemies.unshift(new Machine(canvas,ctx, enemyX, enemyY, enemyR, enemyClr, false, 0)); //敵を配列の頭のほうから追加
      enemies[0].updateVel(Math.random() * (enemyVelMax - (-enemyVelMax)) + (-enemyVelMax)); //敵の速度をランダムで決定
      enemyNum--;
    }
  }
  pre_cnt = cnt;

  //キャンバスをクリア//
  clearCanvas(canvas, ctx);

  //ヒット時に画面を揺らすための処理//
  if (shake) {
    shake--;
    transX = Math.random() * (shakeMax - (-shakeMax)) + (-shakeMax);
    transY = Math.random() * (shakeMax - (-shakeMax)) + (-shakeMax);
  }
  ctx.translate(transX, transY);

  //キャンバスをクリア//
  clearCanvas(canvas, ctx);
  //背景の描画//
  drawBack(canvas, ctx, backClr);
  //ボーダーラインの描画//
  drawBorderline(canvas, ctx, borderClr, borderY);

  //プレイヤーの速度を更新//
  player.updateVel(accelX);
  //プレイヤーの座標更新//
  player.updatePosition(dt);
  //プレイヤーの描画//
  player.drawMachine();

  //敵の座標更新と描画//
  for (let i = 0; i < enemies.length; i++) {
      enemies[i].updatePosition(dt); //敵の座標更新
      enemies[i].drawMachine(); //敵を描画
  }

  //撃墜数表示//
  document.getElementById("kill").innerText = "撃墜数 : " + cnt + "体";

  //プレイヤーの弾丸の処理//
  //通常の弾丸
  if (buttonA == 1 || buttonB == 1) { //AボタンかBボタンが押されたら
    buttonA = buttonB = 0; //ボタンを押されてない状態に戻す(こうしないとずっと条件がtrueになってボタンを押している間ずっと弾丸が出っぱなしになる)
    player.shootBullet(bulletR, playerBulletV); //弾丸を発射
  }
  //貫通弾(大きい弾丸)
  if (bigBulletNum > 0 && buttonA == 2 && buttonB == 2) { //ボタンAとBが長押しされたら
    buttonA = buttonB = 0; //ボタンを押されていない状態に戻す
    bigBulletNum--; //弾丸の発射可能数をデクリメント
    document.getElementById("bigBullet").innerText = "貫通弾 : 残り"+ bigBulletNum + "発"; //発射可能数を更新
    player.shootBullet(bigBulletR, playerBigBulletV); //大きい弾丸を発射
  }
  player.moveBullets(dt); //発射されているプレイヤーの弾丸を進める
  player.drawBullets();   //プレイヤーの弾丸を描画


  //敵の弾丸の処理//
  if (cntSec4Shoot >= shootPeriod) { //弾丸発射周期(shootPeriod)分の時間が経過したら
    cntSec4Shoot = 0; //弾丸発射周期の時間計測をリセット
    for (let i = 0; i < enemies.length; i++) {
      if (Math.random() <= shootRate) {                //shootRateの確率で
        enemies[i].shootBullet(bulletR, enemyBulletV); //弾丸を発射
      }
    }
  }
  for (let i = 0; i < enemies.length; i++) {
    enemies[i].moveBullets(dt); //発射されている敵の弾丸を進める
    enemies[i].drawBullets();   //敵の弾丸を描画
  }

  //終了判定//
  if ((!player.alive | !enemies.length) && (transX == 0 && transY == 0)) { //(プレイヤーが死亡 or 敵が全滅した)かつ  画面の振動が終了したら
    //終了//
    char_accel.removeEventListener('characteristicvaluechanged', onAccelerationChanged);
    char_buttonA.removeEventListener('characteristicvaluechanged', onButtonAStateChanged);
    char_buttonB.removeEventListener('characteristicvaluechanged', onButtonBStateChanged);
    document.getElementById("result").innerText = "勝敗 : " + (player.alive ? "あなたの勝ち!" : "あなたの負け!");
    player = null;
    cancelAnimationFrame(animeID);
  } else {
    animeID = requestAnimationFrame(game);
  }
}

//ゲーム開始//
async function gameStart() {
  //初期設定//
  cnt = pre_cnt = 0;
  cntSec4Shoot = 0;
  cntSec4Spawn = 0;
  enemyNum = enemyNumMax;
  bigBulletNum = bigBulletNumMax;
  shake = 0;
  accelX = 0;
  buttonA = 0;
  buttonB = 0;
  document.getElementById("bigBullet").innerText = "貫通弾 : 残り"+ bigBulletNum + "発";
  document.getElementById("kill").innerText = "撃墜数 : ";
  document.getElementById("result").innerText = "勝敗 : ";

  //プレイヤー情報のリセット//
  player = null;
  player = new Machine(canvas,ctx, canvas.width / 2, canvas.height - playerR, playerR,playerClr, true, 0);
  player.setPointCenter();
  player.alive = true;

  //敵の配列をリセット//
  if (enemies.length) {
    for (let i = 0; i < enemies.length; i++) {
      enemies[i] = null;
    }
  }
  enemies = enemies.filter(Boolean); //撃墜された敵(nullになったところ)を配列enemiesから削除

  //情報取得開始//
  char_accel.addEventListener('characteristicvaluechanged', onAccelerationChanged);
  char_buttonA.addEventListener('characteristicvaluechanged', onButtonAStateChanged);
  char_buttonB.addEventListener('characteristicvaluechanged', onButtonBStateChanged);

  //アニメーション用のリセット処理//
  start = undefined;
  if (animeID != undefined) {
    cancelAnimationFrame(animeID);
  }

  //ゲーム開始//
  animeID = requestAnimationFrame(game);
}


//加速度取得//
function onAccelerationChanged(event) {
  accelX = event.target.value.getInt16(0, true) / 1000 * wt;
}
//ボタンA
function onButtonAStateChanged(event) {
  buttonA = event.target.value.getUint8(0);//ボタンの状態は符号なし8bit
}
//ボタンB
function onButtonBStateChanged(event) {
  buttonB = event.target.value.getUint8(0);//ボタンの状態は符号なし8bit
}
