import "./style.css";

document.body.innerHTML = `
`;

// title value
const h1Element = document.createElement("h1");
h1Element.textContent = "Sticker SketchBook";
document.body.append(h1Element);

// canvas block
const canvas = document.createElement("canvas");
canvas.id = "canvas";
canvas.width = 256;
canvas.height = 256;
document.body.append(canvas);

// context for the canvas
const ctx = canvas.getContext("2d")!;
// reading the mouse position
const cursor = { active: false, x: 0, y: 0 };
const THIN_LINE = 2;
const THICK_LINE = 7;

// array to store the strokes
interface Point {
  x: number;
  y: number;
}

// interface for displaying on canvas
interface DisplayCanvas {
  display(ctx: CanvasRenderingContext2D): void;
}

// button interfaces
interface ToolButtonConfig {
  id: string;
  text: string;
  onClick: () => void;
  isSelected: boolean;
}

// stikers data structure
const stickers = [
  {
    id: "dango",
    text: "🍡",
    label: "Dango",
  },
  {
    id: "tea",
    text: "🍵",
    label: "Tea",
  },
  {
    id: "tamale",
    text: "🫔",
    label: "Tamale",
  },
];
const stickerButtons: HTMLButtonElement[] = [];

// function for the tool buttons
function createToolButton(config: ToolButtonConfig): HTMLButtonElement {
  const button = document.createElement("button");
  button.id = config.id;
  button.textContent = config.text;
  button.addEventListener("click", config.onClick);

  if (config.isSelected) {
    button.classList.add("selectedTool");
  }

  document.body.append(button);
  return button;
}

// class for the line strokes
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

    // looping through the points to create the line
    for (const { x, y } of this.points.slice(1)) {
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  // method to add points to the line
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
    ctx.font = "24px serif";
    ctx.fillText(this.sticker, this.x, this.y);
  }
}

// changing the mouse curser
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
      ctx.font = "24px serif";
      ctx.fillText(this.sticker, this.x, this.y);
    } else {
      ctx.save();
      ctx.lineWidth = this.thickness;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.thickness * 1.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }
}
//arrays to store user drawings and redo lines
let userDrawing: DisplayCanvas[] = [];
let redoLine: DisplayCanvas[] = [];
let currentCommand: Line | null = null;
let currentPreview: MarkerPreview | null = null;
let isDrawing = false;
let currentTool: "line" | "sticker" = "line";
let currentThickness = THIN_LINE;
let currentSticker = "🍡";

// event listeners for the mouse movements

canvas.addEventListener("mouseout", () => {
  currentCommand = null;
  currentPreview = null;
  canvas.dispatchEvent(new CustomEvent("drawing-changed"));
});
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
    currentPreview = new MarkerPreview(
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

canvas.addEventListener("mouseout", () => {
  currentCommand = null;
  canvas.dispatchEvent(new CustomEvent("drawing-changed"));
});

canvas.addEventListener("drawing-changed", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const stroke of userDrawing) {
    stroke.display(ctx);
  }
  if (!isDrawing && currentPreview) {
    currentPreview.display(ctx);
  }
});

// sticker buttons
stickers.forEach((sticker) => {
  const button = document.createElement("button");
  button.textContent = sticker.text;
  button.id = `sticker-button-${sticker.id}`;

  button.addEventListener("click", () => {
    currentSticker = sticker.text;
    currentTool = "sticker";

    stickerButtons.forEach((btn) => btn.classList.remove("selectedTool"));
    thickButton.classList.remove("selectedTool");
    thinButton.classList.remove("selectedTool");
    button.classList.add("selectedTool");
    stickerButtons.push(button);
  });

  document.body.append(button);
});

const customButton = document.createElement("button");
customButton.textContent = "Custom Sticker";
customButton.id = "custom-sticker-button";
document.body.append(customButton);

customButton.addEventListener("click", () => {
  // promt to add a custom sticker
  const customSticker = prompt("Add a custom sticker (emoji):", "🥞");
  if (customSticker) {
    stickers.push({
      id: "custom",
      text: customSticker,
      label: "Custom Sticker",
    });
    const button = document.createElement("button");
    button.textContent = customSticker;
    button.id = `sticker-button-custom`;

    button.addEventListener("click", () => {
      currentSticker = customSticker;
      currentTool = "sticker";
      stickerButtons.forEach((btn) => btn.classList.remove("selectedTool"));
      thickButton.classList.remove("selectedTool");
      thinButton.classList.remove("selectedTool");
      button.classList.add("selectedTool");
      stickerButtons.push(button);
    });

    document.body.append(button);
  } else if (customSticker === "") {
    alert("No sticker added. Please enter a valid emoji.");
  }
});

// the think and thick line buttons
const thinButton = createToolButton({
  id: "thin-button",
  text: "Thin Line",
  onClick: () => {
    currentThickness = THIN_LINE;
    currentTool = "line";
    thinButton.classList.add("selectedTool");
    thickButton.classList.remove("selectedTool");
  },
  isSelected: true,
});

const thickButton = createToolButton({
  id: "thick-button",
  text: "Thick Line",
  onClick: () => {
    currentThickness = THICK_LINE;
    currentTool = "line";
    thickButton.classList.add("selectedTool");
    thinButton.classList.remove("selectedTool");
  },
  isSelected: false,
});

createToolButton({
  id: "clear-button",
  text: "Clear",
  onClick: () => {
    userDrawing = [];
    redoLine = [];
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
  },
  isSelected: false,
});

// creating the undo button
createToolButton({
  id: "undo-button",
  text: "undo",
  onClick: () => {
    if (userDrawing.length > 0) {
      redoLine.push(userDrawing.pop()!);
      canvas.dispatchEvent(new CustomEvent("drawing-changed"));
    }
  },
  isSelected: false,
});

// redo button
createToolButton({
  id: "redo-button",
  text: "redo",
  onClick: () => {
    if (redoLine.length > 0) {
      userDrawing.push(redoLine.pop()!);
      canvas.dispatchEvent(new CustomEvent("drawing-changed"));
    }
  },
  isSelected: false,
});

// export button
createToolButton({
  id: "export-button",
  text: "export",
  onClick: () => {
    //making a temp canvas to re scale for the export
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d")!;
    const exportWidth = 1024;
    const exportHeight = 1024;

    tempCanvas.width = exportWidth;
    tempCanvas.height = exportHeight;

    tempCtx.fillStyle = "#f5f1c9";
    tempCtx.fillRect(0, 0, exportWidth, exportHeight);

    const scaleWidth = exportWidth / canvas.width;
    const scleHeight = exportHeight / canvas.height;
    tempCtx.scale(scaleWidth, scleHeight);
    tempCtx.drawImage(canvas, 0, 0);

    const anchor = document.createElement("a");
    anchor.href = tempCanvas.toDataURL("image/png");
    anchor.download = "sketchpad.png";
    anchor.click();
  },
  isSelected: false,
});
