let handPose;
let video;
let hands = [];
let object = [];
let book = [];
let currentObject = null;
let statusDisplay;
let cameraReady = false;

function preload() {
  // Load images first
  let objectPath = ['asset/bed.png', 'asset/doll.png', 'asset/dress.png', 'asset/ticket.png'];
  let bookPath = ['asset/book/1.png', 'asset/book/2.png', 'asset/book/3.png', 'asset/book/4.png',
    'asset/book/5.png', 'asset/book/6.png', 'asset/book/7.png', 'asset/book/8.png'];

  for (let path of objectPath) {
    loadImage(path, img => {
      object.push(img);
    });
  }

  for (let path of bookPath) {
    loadImage(path, img => {
      book.push(img);
    });
  }
}

function setupSpeechRecognition() {
  try {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'th-TH';

    recognition.onstart = () => {
      if (statusDisplay) {
        statusDisplay.textContent = "Listening for the command ...";
      }
    };

    recognition.onresult = (event) => {
      const command = event.results[0][0].transcript.toLowerCase();
      console.log(`You said: ${command}`);
      
      if (command.includes('เตียง')) {
        currentObject = object[0];
      } else if (command.includes('เดรส') || command.includes('ชุด')) {
        currentObject = object[2];
      } else if (command.includes('ตุ๊กตา')) {
        currentObject = object[1];
      } else if (command.includes('ตั๋ว')) {
        currentObject = object[3];
      } else if (command.includes('หนังสือ')) {
        currentObject = book[0];
      } else if (command.includes('วาง') || command.includes('ปิด')) {
        currentObject = null;
      }
      
      setTimeout(() => {
        try {
          recognition.start();
        } catch (e) {
          console.error('Failed to restart recognition:', e);
        }
      }, 1000);
    };

    recognition.onerror = (event) => {
      console.log(`Error occurred in recognition: ${event.error}`);
      setTimeout(() => {
        try {
          recognition.start();
        } catch (e) {
          console.error('Failed to restart recognition after error:', e);
        }
      }, 1000);
    };

    recognition.onend = () => {
      if (statusDisplay) {
        statusDisplay.textContent = "Voice recognition ended. Restarting...";
      }
    };

    return recognition;
  } catch (e) {
    console.error('Failed to setup speech recognition:', e);
    return null;
  }
}

async function setup() {
  createCanvas(640, 480);
  statusDisplay = createElement('p', 'Initializing camera...');
  
  try {
    const videoPromise = new Promise((resolve, reject) => {
      video = createCapture({
        video: {
          width: 640,
          height: 480
        },
        audio: false
      });
      
      // Wait for video to be ready
      video.elt.addEventListener('loadeddata', () => {
        cameraReady = true;
        resolve(video);
      });

      video.elt.addEventListener('error', (err) => {
        reject(new Error('Video initialization failed'));
      });
    });

    await videoPromise;
    video.size(640, 480);
    video.hide();
    
    console.log('Camera initialized successfully');
    statusDisplay.html('Camera ready, loading hand tracking...');

    handPose = await ml5.handpose();
    console.log('Handpose model loaded');
    statusDisplay.html('System ready!');
    
    handPose.detectStart(video, gotHands);

    // Setup speech recognition
    const recognition = setupSpeechRecognition();
    if (recognition) {
      try {
        recognition.start();
      } catch (e) {
        console.error('Failed to start recognition:', e);
      }
    }
  } catch (err) {
    console.error('Setup error:', err);
    statusDisplay.html('Error during setup. Please refresh and try again.');
  }
}

function draw() {
  if (video && cameraReady) {
    // Draw the webcam video
    image(video, 0, 0, width, height);

    // Draw object on hand if available
    if (currentObject && hands && hands.length > 0) {
      let hand = hands[0];
      if (hand && hand.landmarks && hand.landmarks[9]) {
        let handPosition = hand.landmarks[9];
        image(currentObject, 
          handPosition[0] - currentObject.width / 2, 
          handPosition[1] - currentObject.height / 2
        );
      }
    }
  }
}

function gotHands(results) {
  hands = results;
}