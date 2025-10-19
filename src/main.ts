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
const THIN_LINE = 2;
const THICK_LINE = 5;

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
  thickness: number = THIN_LINE;

  constructor(x: number, y: number, thickness: number) {
    this.points = [{ x, y }];
    this.thickness = thickness;
  }
  display(ctx: CanvasRenderingContext2D) {
    ctx.lineWidth = this.thickness;
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

class Sticker implements DisplayCanvas {
  x: number;
  y: number;
  sticker: string;
  constructor(x: number, y: number, sticker: string) {
    this.x = x;
    this.y = y;
    this.sticker = sticker;
  }
  display(ctx: CanvasRenderingContext2D): void {
    ctx.font = "30px serif";
    ctx.fillText(this.sticker, this.x, this.y);
  }
}

//changing the mouse curser
class MarkerPreview implements DisplayCanvas {
  x: number;
  y: number;
  thickness: number;
  sticker: string;
  constructor(x: number, y: number, thickness: number, sticker: string) {
    this.x = x;
    this.y = y;
    this.thickness = thickness;
    this.sticker = sticker;
  }
  display(ctx: CanvasRenderingContext2D): void {
    if (currentTool === "sticker") {
      ctx.font = "30px serif";
      ctx.fillText(this.sticker, this.x, this.y);
    } else {
      ctx.save();
      ctx.lineWidth = this.thickness;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.thickness * 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }
}
//arrays to store user drawings and redo lines
let userDrawing: DisplayCanvas[] = [];
let redoLine: DisplayCanvas[] = [];
let currentCommand: Line | null = null;
let curentPreview: MarkerPreview | null = null;
let isDrawing = false;
let currentTool: "line" | "sticker" = "line";
let currentThickness = THIN_LINE;
let currentSticker = "🍡";

//event listeners for the mouse movements
canvas.addEventListener("mousedown", (e) => {
  if (currentTool === "sticker") {
    const stickerCommand = new Sticker(e.offsetX, e.offsetY, currentSticker);
    userDrawing.push(stickerCommand);
    redoLine = [];
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
    return;
  } else {
    isDrawing = true;
    currentCommand = new Line(e.offsetX, e.offsetY, currentThickness);
    userDrawing.push(currentCommand);
    redoLine = []; // Clear redo stack on new action
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
  }
});

canvas.addEventListener("mouseup", () => {
  currentCommand = null;
  isDrawing = false;
  cursor.active = false;
});

canvas.addEventListener("mousemove", (e) => {
  if (!isDrawing) {
    curentPreview = new MarkerPreview(
      e.offsetX,
      e.offsetY,
      currentThickness,
      currentSticker,
    );
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
  } else if (currentCommand) {
    currentCommand.drag(e.offsetX, e.offsetY);
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
  }
});

canvas.addEventListener("drawing-changed", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const stroke of userDrawing) {
    stroke.display(ctx);
  }
  if (!isDrawing && curentPreview) {
    curentPreview.display(ctx);
  }
});

//the think and thick line buttons
const thinButton = document.createElement("button");
thinButton.textContent = "Thin Line";
thinButton.id = "thin-button";
thinButton.classList.add("selectedTool");
document.body.append(thinButton);

thinButton.addEventListener("click", () => {
  currentThickness = THIN_LINE;
  currentTool = "line";
  thinButton.classList.add("selectedTool");
  thickButton.classList.remove("selectedTool");
  dangoSticker.classList.remove("selectedTool");
});

const thickButton = document.createElement("button");
thickButton.textContent = "Thick Line";
thickButton.id = "thick-button";
document.body.append(thickButton);

thickButton.addEventListener("click", () => {
  currentThickness = THICK_LINE;
  currentTool = "line";
  thickButton.classList.add("selectedTool");
  thinButton.classList.remove("selectedTool");
  dangoSticker.classList.remove("selectedTool");
});

//emoji/sticker button
const dangoSticker = document.createElement("button");
dangoSticker.textContent = "🍡";
dangoSticker.id = "sticker-button";
document.body.append(dangoSticker);

//event listener for the sticker button
dangoSticker.addEventListener("click", () => {
  currentSticker = "🍡";
  currentTool = "sticker";
  thickButton.classList.remove("selectedTool");
  thinButton.classList.remove("selectedTool");
  dangoSticker.classList.add("selectedTool");
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
