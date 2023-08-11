import { Object } from "./func.js";
let { cubeRaw, cubeRawCol, sqrPyrRaw, sqrPyrRawCol} = await import('./load.js');

const cube = new Object(cubeRaw, cubeRawCol);
const sqrPyr = new Object(sqrPyrRaw, sqrPyrRawCol);

export { cube, sqrPyr };