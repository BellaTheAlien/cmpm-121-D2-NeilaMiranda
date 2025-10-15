//import exampleIconUrl from "./noun-paperclip-7598668-00449F.png";
import "./style.css";

document.body.innerHTML = `
`;

//title value
const h1Element = document.createElement("h1");
h1Element.textContent = "Sticker SketchBook";
document.body.append(h1Element);

//canvas block
const canvas = document.createElement("canvas");
canvas.id = "canvas";
canvas.width = 256;
canvas.height = 256;
document.body.append(canvas);

//context for the canvas
const ctx = canvas.getContext("2d");
//reading the mouse position
const cursor = { active: false, x: 0, y: 0 };

//event listeners for the mouse movements
canvas.addEventListener("mousedown", (e) => {
  cursor.active = true;
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;
});

canvas.addEventListener("mouseup", () => {
  cursor.active = false;
});

canvas.addEventListener("mousemove", (e) => {
  if (cursor.active && ctx) {
    ctx.beginPath();
    ctx.moveTo(cursor.x, cursor.y);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
  }
});

//making the clear button
const clearButton = document.createElement("button");
clearButton.textContent = "clear";
clearButton.id = "clear-button";
document.body.append(clearButton);

//the event listener for the clear button
clearButton.addEventListener("click", () => {
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
});
