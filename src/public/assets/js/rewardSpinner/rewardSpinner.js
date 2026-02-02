document.addEventListener("DOMContentLoaded", () => {
    const today = new Date().toDateString();
    const lastSpinDate = localStorage.getItem("dailySpinDate");
    const spinUsedToday = localStorage.getItem("spinUsed") === today;

    if (lastSpinDate !== today) {
        const rewardModal = new bootstrap.Modal(
            document.getElementById("exampleModal")
        );
        console.log("show modal");
        rewardModal.show();

        // Mark spinner as used today
        localStorage.setItem("dailySpinDate", today);
    }
});

// Get the wheel element (the circle that rotates)
const wheel = document.getElementById("wheel");

// Get all prize segments inside the wheel
const segments = document.querySelectorAll(".segment");

// Total number of prize segments
const numSegments = segments.length;

// Angle size (in degrees) of each segment
// Example: 6 segments → 360 / 6 = 60 degrees each
const anglePerSegment = 360 / numSegments;

// Spin button
const spinBtn = document.getElementById("spinBtn");

// Text element to show the result
const resultText = document.getElementById("resultText");

// Modal element (not directly used here, but kept for reference)
const rewardModalE1 = document.getElementById("rewardModal");

// Array of rewards (order MUST match the segment order)
const rewards = [
    "30% Off",
    "25% Off",
    "20% Off",
    "15% Off",
    "10% Off",
    "5% Off"
];

// Keeps track of how much the wheel has already rotated
// This prevents the wheel from snapping back after each spin
let currentRotation = 0;

/*
    Position each segment around the circle.

    - rotate(...) turns the segment to its correct angle
    - translate(0, -100%) pushes it outward from the center
    - transform-origin is set in CSS so rotation happens from the wheel center
*/
segments.forEach((segment, index) => {
    segment.style.transform =
        `rotate(${index * anglePerSegment}deg) translate(0, -100%)`;
});

// When the user clicks the spin button
spinBtn.addEventListener("click", () => {

    const today = new Date().toDateString();
    const spinUsedToday = localStorage.getItem("spinUsed") === today;

    // stop if already spun today
    if (spinUsedToday) {
        spinBtn.disabled = true;
        resultText.textContent = "You’ve already claimed today’s reward 🎁";
        return; // ⬅️ THIS is what you were missing
    }

    spinBtn.disabled = true;
    resultText.textContent = "";

    const randomIndex = Math.floor(Math.random() * rewards.length);
    const rewardArr = [0.3, 0.25, 0.2, 0.15, 0.1, 0.05];
    const reward = rewardArr[randomIndex];

    // Store reward to use in checkout
    localStorage.setItem("spinDiscount", reward);

    const spinDegrees =
        360 * 5 +
        (360 - (randomIndex * anglePerSegment + anglePerSegment / 2));

    currentRotation += spinDegrees;
    wheel.style.transform = `rotate(${currentRotation}deg)`;

    setTimeout(() => {
        resultText.textContent = `🎁 You got: ${rewards[randomIndex]}`;

        // 🔒 Lock spin for the rest of the day
        localStorage.setItem("spinUsed", today);
        spinBtn.disabled = true;

    }, 4000);
});
