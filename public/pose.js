

let video;
let poseNet;
let pose;
let skeleton;

let brain;
let poseLabel = "X";

let poseState = "x";
let count = 0;

// 초기 setup 함수
function setup() {
  // 1) 웹캠보여주기
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.hide();

  // ml5에서 poseNet함수 호출 => 2) 뼈다귀 보여주기
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotPoses);

  // ml5.nN의 옵션
  let options = {
    inputs: 34,
    outputs: 2,
    task: 'classification',
    debug: true
  }
  brain = ml5.neuralNetwork(options);

  // 불러올(사용할) 전처리한 model의 정보
  const modelInfo = {
    model: '/model/model.json',
    metadata: '/model/model_meta.json',
    weights: '/model/model.weights.bin',
  };
  // 3) 무슨 자세인지 분류하기
  brain.load(modelInfo, brainLoaded);
}

function brainLoaded() {
  console.log('pose classification ready!');
  setTimeout(function() {
    alert("카메라에 상반신이 보이는 상태에서 '만세'하는 동작을 취해주세요.");
  }, 1000)

  classifyPose();
}

function classifyPose() {
  if (pose) {
    let inputs = [];
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      inputs.push(x);
      inputs.push(y);
    }
    brain.classify(inputs, gotResult);
  } 
  else {
    setTimeout(classifyPose, 100);
  }
}

function gotResult(error, results) {

  if (results[0].confidence > 0.75) {
    poseLabel = results[0].label.toUpperCase();

    console.log(results[0].label)
    poseState = results[0].label;

    if (poseState == 'o') {
      console.log(count);
      count = count + 1;
      
      if (count == 50) {
        alert('잠에서 깨셨습니다!');
        history.back();
      }
    }

    if (poseState == 'x') {
      count = 0;
    }
      
  }
  classifyPose();
}


function gotPoses(poses) {
  // console.log(poses);
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
  }
}


function modelLoaded() {
  console.log('poseNet ready');
}

function draw() {
  push();
  translate(video.width, 0);
  scale(-1, 1);
  image(video, 0, 0, video.width, video.height);

  if (pose) {
    for (let i = 0; i < skeleton.length; i++) {
      let a = skeleton[i][0];
      let b = skeleton[i][1];
      strokeWeight(2);
      stroke(0);

      line(a.position.x, a.position.y, b.position.x, b.position.y);
    }
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      fill(0);
      stroke(255);
      ellipse(x, y, 16, 16);
    }
  }
  pop();

  fill(255, 255, 255);
  noStroke();
  textSize(150);
  textAlign(CENTER, CENTER);
  text(poseLabel, width / 1.1, height / 6);
}
