let video;
let detector;
let detections = [];
function preload() {
  img = loadImage('https://cdn.namdonews.com/news/photo/201905/522803_142123_4915.jpg');
  detector = ml5.objectDetector('cocossd')
}

function gotDetections(error, results){
  if(error){
    console.error(error);
  }
  detections = results;  
    detector.detect(video, gotDetections);
    }
  
function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  detector.detect(video, gotDetections)
  video.size(640, 480);
  video.hide()
  detector.detect(video, gotDetections);
}

function draw(){
  image(video, 0,0);
  for (let i = 0; i<detections.length; i++){
    let object = detections[i];
    stroke(0, 255, 0);
    strokeWeight(4);
    noFill()
    rect(object.x, object.y, object.width, object.height);
    noStroke();
    fill(255);
    textSize(32);
    text(object.label + " " + object.id, object.x + 10, object.y + 24);
}
}

