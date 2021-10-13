const socket = io("/");
const chatInputBox = document.getElementById("chat_message");
const all_messages = document.getElementById("all_messages");
const main__chat__window = document.getElementById("main__chat__window");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;

let faceapi;
let video;
let detections;
let handpose;
let predictions = [];
const width = 360;
const height = 360;
let canvas, ctx;
let num = 0;
let num2 = 0;
let poseNet;
let pose;
let skeleton;
let time2 = 0;
let time3 = 0;

var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "3030",
});

let myVideoStream;

var getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");

      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });

    document.addEventListener("keydown", (e) => {
      if (e.which === 13 && chatInputBox.value != "") {
        socket.emit("message", chatInputBox.value);
        chatInputBox.value = "";
      }
    });

    socket.on("createMessage", (msg) => {
      console.log(msg);
      let li = document.createElement("li");
      li.innerHTML = msg;
      all_messages.append(li);
      main__chat__window.scrollTop = main__chat__window.scrollHeight;
    });
  });

peer.on("call", function (call) {
  getUserMedia(
    { video: true, audio: true },
    function (stream) {
      call.answer(stream); // Answer the call with an A/V stream.
      const video = document.createElement("video");
      call.on("stream", function (remoteStream) {
        addVideoStream(video, remoteStream);
      });
    },
    function (err) {
      console.log("Failed to get local stream", err);
    }
  );
});

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

const detectionOptions = {
  withLandmarks: true,
  withDescriptors: false,
};

// CHAT

const connectToNewUser = (userId, streams) => {
  var call = peer.call(userId, streams);
  console.log(call);
  var video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    console.log(userVideoStream);
    addVideoStream(video, userVideoStream);
  });
};

const addVideoStream = (videoEl, stream) => {  
  videoEl.srcObject = stream;
  console.log("============================");
  console.log(stream);
  console.log("============================");
  videoEl.addEventListener("loadedmetadata", () => {
  videoEl.play();

  setTimeout(()=>{
    console.log("====wait===============");
  }, 1000);
  console.log(videoEl)

  video = videoEl;

  //ml5 Code
  console.log('---------------------------')
  console.log(videoEl.width, videoEl.height)
  console.log('---------------------------')

  canvas = createCanvas(width, height);
  ctx = canvas.getContext("2d");

  videoEl.width = width;
  videoEl.height = height;

  faceapi = ml5.faceApi(videoEl, detectionOptions, modelReady);
  handpose = ml5.handpose(video, modelReady);
  poseNet = ml5.poseNet(video, modelReady);
  });

  function modelReady() {
    console.log("handpose ready!");
    handpose.on("predict", gotResult);
    console.log("ready!");
    faceapi.detect(gotResults);
    console.log("posenet ready");
    poseNet.on("pose", gotPoses);
  }

function gotPoses(poses) {
    try{
    pose = poses[0].pose
    }
    catch {}
    
  }

function gotResult(results){
    var now = new Date();
    var seconds = now.getSeconds();
      predictions = results;    
      // console.log('predictions');
      // console.log(predictions);
    var rad = Math.atan2(pose.keypoints[2].position.y - pose.keypoints[1].position.y, pose.keypoints[2].position.x - pose.keypoints[1].position.x);
    var degree = (rad * 180) / Math.PI;
    // console.log(degree);
      // if ((Math.abs(pose.keypoints[1].position.y - pose.keypoints[2].position.y) > 20) && (predictions.length > 0)){
      if ((180 - Math.abs(degree) > 20) && (predictions.length > 0)){
      // if (predictions.length > 0){
        console.log(num);
        if(num == 5){
          alert('집중하세요!!');
          // audio.play();
          window.location.href='../views/pose.ejs';
          num = 0;
        }
        
        //5초동안
        if(seconds - time2 == 1){
          num = num + 1;
        }
        time2 = seconds;
      } else if ((180 - Math.abs(degree) > 25)) {
        console.log(num);
        if(num == 5){
          alert('집중하세요!!');
          // audio.play();
          window.location.href='../views/pose.ejs';
          num = 0;
        }
        
        //5초동안
        if(seconds - time2 == 1){
          num = num + 1;
        }
        time2 = seconds;
      } else if ((predictions.length > 0)) {
        console.log(num);
        if(num == 5){
          alert('집중하세요!!');
          // audio.play();
          window.location.href='../views/pose.ejs';
          num = 0;
        }
        
        //5초동안
        if(seconds - time2 == 1){
          num = num + 1;
        }
        time2 = seconds;
      } else {
        num = 0;
      }
  }

  function createCanvas(w, h) {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    document.body.appendChild(canvas);
    return canvas;
  }

  function gotResults(err, result) {
    if (err) {
      console.log(err);
      return;
    }
    var now = new Date();
    var seconds = now.getSeconds();
    // console.log(result)
    detections = result;
    console.log("===========1111===============");
    console.log(detections);
    if(detections.length == 0){
      console.log("num2" + num2);
      if(num2 == 10){
        alert("집중하세요!!")
        window.location.href='../views/pose.ejs';
      }
      //5초동안
      if(seconds - time3 == 1){
        num2 = num2 + 1;
      }
      time3 = seconds;
    } else {
      num2 = 0;
    }
    
  
    // Clear part of the canvas
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);
    console.log("===========222============");
    console.log(video);
    ctx.drawImage(video, 0, 0, width, height);
  
    if (detections) {
      if (detections.length > 0) {
        drawBox(detections);
        drawLandmarks(detections);
      }
    }
    faceapi.detect(gotResults);
  }
  
  function drawBox(detections) {
    console.log("sssssss");
    for (let i = 0; i < detections.length; i += 1) {
      const alignedRect = detections[i].alignedRect;
      const x = alignedRect._box._x;
      const y = alignedRect._box._y;
      const boxWidth = alignedRect._box._width;
      const boxHeight = alignedRect._box._height;
  
      ctx.beginPath();
      ctx.rect(x, y, boxWidth, boxHeight);
      ctx.strokeStyle = "#a15ffb";
      ctx.stroke();
      ctx.closePath();
    }
  }
  
  function drawLandmarks(detections) {
    for (let i = 0; i < detections.length; i += 1) {
      const mouth = detections[i].parts.mouth;
      const nose = detections[i].parts.nose;
      const leftEye = detections[i].parts.leftEye;
      const rightEye = detections[i].parts.rightEye;
      const rightEyeBrow = detections[i].parts.rightEyeBrow;
      const leftEyeBrow = detections[i].parts.leftEyeBrow;
  
      drawPart(mouth, true);
      drawPart(nose, false);
      drawPart(leftEye, true);
      drawPart(leftEyeBrow, false);
      drawPart(rightEye, true);
      drawPart(rightEyeBrow, false);
    }
  }
  
  function drawPart(feature, closed) {
    ctx.beginPath();
    for (let i = 0; i < feature.length; i += 1) {
      const x = feature[i]._x;
      const y = feature[i]._y;
  
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
  
    if (closed === true) {
      ctx.closePath();
    }
    ctx.stroke();
  }

  videoGrid.append(videoEl);
  let totalUsers = document.getElementsByTagName("video").length;
  if (totalUsers > 1) {
    for (let index = 0; index < totalUsers; index++) {
      document.getElementsByTagName("video")[index].style.width =
        100 / totalUsers + "%";
    }
  }
};

const playStop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

const setPlayVideo = () => {
  const html = `<i class="unmute fa fa-pause-circle"></i>
  <span class="unmute">Resume Video</span>`;
  document.getElementById("playPauseVideo").innerHTML = html;
};

const setStopVideo = () => {
  const html = `<i class=" fa fa-video-camera"></i>
  <span class="">Pause Video</span>`;
  document.getElementById("playPauseVideo").innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `<i class="unmute fa fa-microphone-slash"></i>
  <span class="unmute">Unmute</span>`;
  document.getElementById("muteButton").innerHTML = html;
};
const setMuteButton = () => {
  const html = `<i class="fa fa-microphone"></i>
  <span>Mute</span>`;
  document.getElementById("muteButton").innerHTML = html;
};
