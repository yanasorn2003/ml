let handPose;
let video;
let hands = [];
let object = [];
let book = [];
let currentObject = null;

function preload() {
  // Load the handPose model
  handPose = ml5.handPose();

  let objectPath = ['asset/bed.png', 'asset/doll.png', 'asset/dress.png', 'asset/ticket.png'];
  let bookPath = ['asset/book/1.png', 'asset/book/2.png', 'asset/book/3.png', 'asset/book/4.png',
    'asset/book/5.png', 'asset/book/6.png', 'asset/book/7', 'asset/book/8.png'];

  for (let path of objectPath) {
    loadImage(path, img => {object.push(img);});
  }

  for (let path of bookPath) {
    loadImage(path, img => {book.push(img);});
  }
}

function setupSpeechRecognition() {
    const SpeechRecognition = window.setupSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'th-TH';

    recognition.onstart = () => {
        statusDisplay.textContent = "Listening for the command ...";
    };

    recognition.onresult = (event) => {
        const command = event.results[0][0].transcript;
        console.log(`You said: ${command}`);
        
        switch (command.includes) {
            case 'เตียง':
                console.log("Command 'เตียง' detected!");
                currentObject = object[0];
                break;
            case 'เดรส':
                console.log("Command 'เดรส' detected!");
                currentObject = object[2];
                break;
            case 'ชุด':
                console.log("Command 'ชุด' detected!");
                currentObject = object[2];
                break;
            case 'ตุ๊กตา':
                console.log("Command 'ตุ๊กตา' detected!");
                currentObject = object[1];
                break;
            case 'ตั๋ว':
                console.log("Command 'ตั๋ว' detected!");
                currentObject = object[3];
                break;
            case 'หนังสือ':
                console.log("Command 'หนังสือ' detected!");
                currentObject = book[0];
                break;
            default:
                break;
        }
        
        // Restart listening after a brief delay
        setTimeout(() => {recognition.start();}, 1000);
    };

    recognition.onerror = (event) => {
        console.log(`Error occurred in recognition: ${event.error}`);
        setTimeout(() => {recognition.start();}, 1000);
    };

    recognition.onend = () => {
        statusDisplay.textContent = "Voice recognition ended. Restarting...";
    };
}



function setup() {
  createCanvas(640, 480);
  // Create the webcam video and hide it
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  // start detecting hands from the webcam video
  handPose.detectStart(video, gotHands);
  setupSpeechRecognition();
  recognition.start();
}

function draw() {
  // Draw the webcam video
  image(video, 0, 0, width, height);

  if (currentObject && hands.length > 0) {
    // Find the center of the hand and position the object there
    let hand = hands[0]; 
    let handPosition = hand.landmarks[9];

    // Display the object image on the hand
    image(currentObject, handPosition[0] - currentObject.width / 2, handPosition[1] - currentObject.height / 2);
  }
}

// Callback function for when handPose outputs data
function gotHands(results) {
  // save the output to the hands variable
  hands = results;
}
