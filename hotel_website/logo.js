export function draw_crescent() {
    const x = document.getElementById("logo");
    const context = x.getContext("2d");

    context.arc(25, 25, 25, 0, Math.PI);
    context.fillStyle = "indigo";
    context.fill();

    context.fillRect(10,10,30,15);

    context.beginPath();
        context.moveTo(3, 10);
        context.lineTo(25, 2);
        context.lineTo(45, 10);
        context.lineTo(5, 10);
        context.strokeStyle = "indigo"; // Optional: make it stand out
        context.lineWidth = 2;
        context.stroke(); // ← this is the important missing part
    context.closePath();
}