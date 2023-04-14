import { Object } from "./func.js";
let { cubeRaw } = await import('./load.js');

const cube = new Object(cubeRaw);
const cube2 = new Object(cubeRaw);

export { cube, cube2 };