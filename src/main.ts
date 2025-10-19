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

//interface for displaying on canvas
interface DisplayCanvas {
  display(ctx: CanvasRenderingContext2D): void;
}

//class for the line strokes
class Line implements DisplayCanvas {
  points: Point[];

  constructor(x: number, y: number) {
    this.points = [{ x, y }];
  }
  display(ctx: CanvasRenderingContext2D) {
    if (this.points.length < 2) return;
    ctx.beginPath();
    const { x, y } = this.points[0]!;
    ctx.moveTo(x, y);

    //looping through the points to create the line
    for (const { x, y } of this.points.slice(1)) {
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  //method to add points to the line
  drag(x: number, y: number) {
    this.points.push({ x, y });
  }
}

//arrays to store user drawings and redo lines
let userDrawing: Line[] = [];
let redoLine: Line[] = [];
let currentCommand: Line | null = null;
let isDrawing = false;

//event listeners for the mouse movements
canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  currentCommand = new Line(e.offsetX, e.offsetY);
  userDrawing.push(currentCommand);
  redoLine = []; // Clear redo stack on new action
  canvas.dispatchEvent(new CustomEvent("drawing-changed"));
});

canvas.addEventListener("mouseup", () => {
  currentCommand = null;
  isDrawing = false;
  cursor.active = false;
});

canvas.addEventListener("mousemove", (e) => {
  if (!isDrawing || !currentCommand) return;

  currentCommand.drag(e.offsetX, e.offsetY);
  canvas.dispatchEvent(new CustomEvent("drawing-changed"));
});

canvas.addEventListener("drawing-changed", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const stroke of userDrawing) {
    stroke.display(ctx);
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
  redoLine = [];
  canvas.dispatchEvent(new CustomEvent("drawing-changed"));
});

//creating the undo button
const undoButton = document.createElement("button");
undoButton.textContent = "undo";
undoButton.id = "undo-button";
document.body.append(undoButton);

// event listener for the undo button
undoButton.addEventListener("click", () => {
  if (userDrawing.length > 0) {
    redoLine.push(userDrawing.pop()!);
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
  }
});

//redo button
const redoButton = document.createElement("button");
redoButton.textContent = "redo";
redoButton.id = "redo-button";
document.body.append(redoButton);

redoButton.addEventListener("click", () => {
  if (redoLine.length > 0) {
    userDrawing.push(redoLine.pop()!);
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
  }
});
