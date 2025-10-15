//import exampleIconUrl from "./noun-paperclip-7598668-00449F.png";
import "./style.css";

document.body.innerHTML = `
`;

const h1Element: HTMLHeadingElement = document.createElement("h1");

h1Element.textContent = "Sticker SketchBook";
document.body.append(h1Element);

const canvas = document.createElement("canvas");
canvas.id = "canvas";
canvas.width = 256;
canvas.height = 256;
document.body.append(canvas);
