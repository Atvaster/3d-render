import { Object } from "./func.js";
let { cubeRaw, cubeRawCol } = await import('./load.js');

const cube = new Object(cubeRaw, cubeRawCol);

export { cube };