const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;

    return new Promise(resolve => {
        video.onloadedmetadata = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            resolve();
        };
    });
}

const shirts = document.querySelectorAll(".selectable-shirt");
let shirtReady = false;
const shirtImg = new Image();

shirts.forEach(shirt => {
    shirt.addEventListener("click", () => {
        const selectedPath = shirt.dataset.shirtPath;

        // Update AR shirt image
        shirtImg.src = selectedPath;
        shirtImg.onload = () => {
            shirtReady = true;
        };

        console.log("Selected shirt:", selectedPath);
    });
});

// check if image is loaded
// let shirtReady = false;
// const shirtImg = new Image();
// shirtImg.src = "/assets/js/AR_Try_On/whiteTShirt.png";
// shirtImg.onload = () => {
//     shirtReady = true;
// }


const pose = new Pose({
    locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
});

pose.setOptions({
    modelComplexity: 0,   // SIMPLEST MODEL
    smoothLandmarks: true,
    enableSegmentation: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

pose.onResults(results => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!results.poseLandmarks || !shirtReady) return;

    const leftShoulder = results.poseLandmarks[11];
    const rightShoulder = results.poseLandmarks[12];
    const leftHip = results.poseLandmarks[23];
    const rightHip = results.poseLandmarks[24];

    const lx = leftShoulder.x * canvas.width;
    const ly = leftShoulder.y * canvas.height;
    const rx = rightShoulder.x * canvas.width;
    const ry = rightShoulder.y * canvas.height;

    const hx = (leftHip.x + rightHip.x) / 2 * canvas.width;
    const hy = (leftHip.y + rightHip.y) / 2 * canvas.height;

    const shoulderWidth = Math.hypot(rx - lx, ry - ly);
    const shoulderMidY = (ly + ry) / 2;
    const torsoHeight = hy - shoulderMidY;

    const shirtWidth = shoulderWidth * 2.5;
    const shirtHeight = torsoHeight * 1.7;

    const shirtX = (lx + rx) / 2 - shirtWidth / 2;
    const shirtY = shoulderMidY - torsoHeight * 0.37;

    ctx.drawImage(
        shirtImg,
        shirtX,
        shirtY,
        shirtWidth,
        shirtHeight
    );
});

async function start() {
    await setupCamera();

    const camera = new Camera(video, {
        onFrame: async () => {
            await pose.send({ image: video });
        },
        width: canvas.width,
        height: canvas.height
    });

    camera.start();
}

start();

// Stop Camera
function exitAR() {
    const stream = video.srcObject;
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    window.history.back();
}
