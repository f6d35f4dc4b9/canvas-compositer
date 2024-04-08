import { getImgSize, blobToImageData, drawLinear, drawCircular, Mode } from "./utils"

let mode = "Linear" as Mode;
let changeWidth = 100;
let gradient = 0;
let radius = 50;
let invert = false;

let x_0 = 50;
let y_0 = 50;

let canvas = null as HTMLCanvasElement | null;
let ctx = null as CanvasRenderingContext2D | null;
let baseImg = null as ImageBitmap | null;
let overlayImg = null as ImageData | null; 
let baseImgWidth = null as number | null;
let baseImgHeight = null as number | null;

let animationHanderId = 0;

async function drawCanvas() {
  const width = baseImgWidth!
  const height = baseImgHeight!;
  canvas!.width = width;
  canvas!.height = height;

  ctx!.drawImage(baseImg!, 0, 0);

  if (!overlayImg) {
    return;
  }

  const buf = new ImageData(overlayImg.data.slice(0), width);
  
  switch (mode) {
    case "Linear": {
      drawLinear(buf, Math.tan(gradient * Math.PI / 180), { x: x_0, y: y_0 }, changeWidth, invert);
      break;
    }
    case "Circular": {
      drawCircular(buf, radius, { x: x_0, y: y_0 }, changeWidth, invert);
      break;
    }
  }

  ctx!.drawImage(await createImageBitmap(buf), 0, 0);
}


function attachListeners() {
  document.getElementById("base-img")!.onchange = async (ev) => {
    clear();
    const target = ev.target as HTMLInputElement;
    const blob = (target.files as FileList)[0];
    const { width, height } = await getImgSize(blob);
    baseImgWidth = width;
    baseImgHeight = height;
    baseImg = await createImageBitmap(blob);
    drawCanvas();
  };
  document.getElementById("overlay-img")!.onchange = async (ev) => {
    const target = ev.target as HTMLInputElement;
    const blob = (target.files as FileList)[0];
    const { width, height } = await getImgSize(blob);
    if (baseImgWidth !== width || baseImgHeight !== height) {
      alert("「ベース画像」と「重ねる画像」の大きさが違います。")
      return;
    }
    overlayImg = await blobToImageData(blob, width, height);
    drawCanvas();
  };

  document.getElementById("linear")!.onchange = ev => {
    mode = (ev.target as HTMLInputElement).checked ? "Linear" : "Circular";
    drawCanvas();
  };
  document.getElementById("circular")!.onchange = ev => {
    mode = (ev.target as HTMLInputElement).checked ? "Circular" : "Linear";
    drawCanvas();
  };

  document.getElementById("change-width")!.onchange = ev => {
    const _changeWidth = Number.parseInt((ev.target as HTMLInputElement).value);
    if (_changeWidth < 0) {
      changeWidth = 0;
      (ev.target as HTMLInputElement).value = "0";
    } else {
      changeWidth = _changeWidth;
    }
    drawCanvas();
  };
  document.getElementById("change-width-minus")!.onclick = () => {
    changeWidth = Math.max(changeWidth - 50, 0);
    (document.getElementById("change-width") as HTMLInputElement).value = changeWidth.toString();
    drawCanvas();
  };
  document.getElementById("change-width-plus")!.onclick = () => {
    changeWidth += 50;
    (document.getElementById("change-width") as HTMLInputElement).value = changeWidth.toString();
    drawCanvas();
  };
  
  document.getElementById("gradient")!.onchange = ev => {
    gradient = Number.parseInt((ev.target as HTMLInputElement).value);
    drawCanvas();
  };
  document.getElementById("gradient-minus")!.onclick = () => {
    gradient -= 10;
    (document.getElementById("gradient") as HTMLInputElement).value = gradient.toString();
    drawCanvas();
  };
  document.getElementById("gradient-plus")!.onclick = () => {
    gradient += 10;
    (document.getElementById("gradient") as HTMLInputElement).value = gradient.toString();
    drawCanvas();
  };

  document.getElementById("radius")!.onchange = ev => {
    const _radius = Number.parseInt((ev.target as HTMLInputElement).value);
    if (_radius < 0) {
      radius = 0;
      (ev.target as HTMLInputElement).value = "0";
    } else {
      radius = _radius;
    }

    drawCanvas();
  };
  document.getElementById("radius-minus")!.onclick = () => {
    radius = Math.max(radius - 50, 0);
    (document.getElementById("radius") as HTMLInputElement).value = radius.toString();
    drawCanvas();
  };
  document.getElementById("radius-plus")!.onclick = () => {
    radius += 50;
    (document.getElementById("radius") as HTMLInputElement).value = radius.toString();
    drawCanvas();
  };

  document.getElementById("invert")!.onclick = ev => {
    invert = (ev.target as HTMLInputElement).checked;
    drawCanvas();
  }

  document.getElementById("save-btn")!.onclick = async () => {
    const a = document.createElement("a");
    a.download = "download.webp";
    a.href = canvas!.toDataURL("image/webp", 0.92);

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  document.getElementById("fullscr-btn")!.onclick = () => {
    canvas!.requestFullscreen();
  };

  document.getElementById("canvas")!.onmousedown = ev => {
    const clientRect = (ev.target as HTMLElement).getBoundingClientRect();
    x_0 = (ev.pageX - (clientRect.left + window.scrollX)) * (baseImgWidth! / clientRect.width);
    y_0 = (ev.pageY - (clientRect.top + window.scrollY)) * (baseImgHeight! / clientRect.height);
    drawCanvas();
  };
  document.getElementById("canvas")!.onmousemove = ev => {
    if (ev.buttons !== 1) {
      return;
    }
    cancelAnimationFrame(animationHanderId)
    const clientRect = (ev.target as HTMLElement).getBoundingClientRect();
    x_0 = (ev.pageX - (clientRect.left + window.scrollX)) * (baseImgWidth! / clientRect.width);
    y_0 = (ev.pageY - (clientRect.top + window.scrollY)) * (baseImgHeight! / clientRect.height);
    
    animationHanderId = requestAnimationFrame(drawCanvas);
  };
  document.getElementById("canvas")!.ontouchmove = ev => {
    ev.preventDefault();
    cancelAnimationFrame(animationHanderId)
    const clientRect = (ev.target as HTMLElement).getBoundingClientRect();
    x_0 = (ev.touches[0].pageX - (clientRect.left + window.scrollX)) * (baseImgWidth! / clientRect.width);
    y_0 = (ev.touches[0].pageY - (clientRect.top + window.scrollY)) * (baseImgHeight! / clientRect.height);
    animationHanderId = requestAnimationFrame(drawCanvas);
  };
}

function clear() {
  baseImg?.close();
  baseImg = null;
  overlayImg = null;
}

async function setUp() {
  canvas = document.getElementById("canvas") as HTMLCanvasElement;
  ctx = canvas.getContext("2d");
  attachListeners();
}
setUp();

