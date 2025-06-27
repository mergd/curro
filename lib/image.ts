import { getPlaiceholder } from "plaiceholder";

export async function getImageData(src: string) {
  try {
    const buffer = await fetch(src).then(async (res) =>
      Buffer.from(await res.arrayBuffer()),
    );

    const {
      metadata: { height, width },
      base64,
    } = await getPlaiceholder(buffer);

    return {
      base64,
      height,
      width,
    };
  } catch (e) {
    console.error("Error generating image data:", e);
    return null;
  }
}
