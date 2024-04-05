
export type Mode = "Linear" | "Circular";
export type Point = { x: number, y: number };

export async function getImgSize(blob: Blob) {
  const img = new Image();
  await new Promise(res => {
    img.src = URL.createObjectURL(blob);
    img.onload = res;
  })
  return ({
    height: img.height,
    width: img.width,
  });
};

export async function blobToImageData(blob: Blob, width: number, height: number): Promise<ImageData> {
  const ctx =  new OffscreenCanvas(width, height).getContext("2d")!;
  ctx.drawImage(await createImageBitmap(blob), 0, 0);
  return ctx.getImageData(0, 0, width, height);
}

export function drawLinear(
  buf: ImageData,
  gradient: number,
  passingPoint: Point,
  changeWidth: number,
  invert: boolean,
): ImageData {
  const width = buf.width;
  const height = buf.height;
  const halfChangeWidth = changeWidth * 0.5;
  const denominator = Math.sqrt(gradient * gradient + 1);
  const A = gradient * passingPoint.x + passingPoint.y;
  const coeff = invert ? -1 : 1;

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const dist = (- gradient * x - y + A) / denominator;

      buf.data[(x + y * width) * 4 + 3] = 128 + (dist / halfChangeWidth) * 128 * coeff;
    }
  }

  return buf;
}

export function drawCircular(
  buf: ImageData,
  radius: number,
  center: Point,
  changeWidth: number,
  invert: boolean,
): ImageData {
  const width = buf.width;
  const height = buf.height;
  const halfChangeWidth = changeWidth * 0.5;
  const cx = center.x;
  const cy = center.y;
  const coeff = invert ? -1 : 1;

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      buf.data[(x + y * width) * 4 + 3] = 128 + ((dist - radius) / halfChangeWidth ) * 128 * coeff;
    }
  }

  return buf;
}
