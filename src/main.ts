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
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
//reading the mouse position
const cursor = { active: false, x: 0, y: 0 };

//array to store the strokes
interface Point {
  x: number;
  y: number;
}

type Line = Point[];

let userDrawing: Line[] = [];
let isDrawing = false;

//event listeners for the mouse movements
canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  const currentStroke: Line = [];
  userDrawing.push(currentStroke);
  currentStroke.push({ x: e.offsetX, y: e.offsetY });
  canvas.dispatchEvent(new CustomEvent("drawing-changed"));
});

canvas.addEventListener("mouseup", () => {
  isDrawing = false;
  cursor.active = false;
});

canvas.addEventListener("mousemove", (e) => {
  if (!isDrawing) return;
  const currentStroke = userDrawing[userDrawing.length - 1]!;
  currentStroke.push({ x: e.offsetX, y: e.offsetY });
  canvas.dispatchEvent(new CustomEvent("drawing-changed"));
});

canvas.addEventListener("drawing-changed", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const stroke of userDrawing) {
    if (stroke.length >= 2) {
      ctx.beginPath();
      const { x, y } = stroke[0]!;
      ctx.moveTo(x, y);
      const remainingPoints = stroke.slice(1);
      for (const { x, y } of remainingPoints) {
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }
});

//making the clear button
const clearButton = document.createElement("button");
clearButton.textContent = "clear";
clearButton.id = "clear-button";
document.body.append(clearButton);

//the event listener for the clear button
clearButton.addEventListener("click", () => {
  userDrawing = [];
  canvas.dispatchEvent(new CustomEvent("drawing-changed"));
});
