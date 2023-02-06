import { LinearFilter, Texture } from "three";

const againstFontUrl = '/Against.ttf'

export default async function createTextTexture(
  text: string
): Promise<Texture> {
  const textTexture: Texture = new Texture(
    await createTextCanvas(text || '')
  );
  textTexture.generateMipmaps = false;
  textTexture.minFilter = LinearFilter;
  textTexture.needsUpdate = true;
  return textTexture;
}

async function createTextCanvas(text: string, parameters: any = {}) {
  // Prepare the font to be able to measure
  const fontSize = parameters.fontSize || 106;
  const bannerFont = `${fontSize}px Against`;

  const fonts = (document as any).fonts;
  if (!fonts.check(bannerFont)) {
    // @ts-ignore
    const font = new FontFace(
      'Against',
      `url('${againstFontUrl}') format('truetype')`
    );
    const newFont = await font.load();
    (document as any).fonts.add(newFont);
  }
  const canvas = document.createElement('canvas');
  // tslint:disable-next-line:no-non-null-assertion
  const ctx = canvas.getContext('2d')!;

  // Prepare the font to be able to measure
  ctx.font = bannerFont;

  // let width = textMetrics.width;
  // let height = fontSize;

  const width = 630;
  const height = 1890;

  // Resize canvas to match text size
  canvas.width = width;
  canvas.height = height;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';

  // Re-apply font since canvas is resized.
  ctx.font = `${fontSize}px Against`;
  ctx.textAlign = parameters.align || 'center';
  ctx.textBaseline = parameters.baseline || 'middle';

  // Make the canvas transparent for simplicity
  ctx.fillStyle = 'transparent';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.fillStyle = 'white';
  ctx.fillText(text, width / 2, 400);

  return canvas;
}
