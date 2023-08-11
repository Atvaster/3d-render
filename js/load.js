//Load file from specified url and returns contents
async function loadFile(path) {
  let response = await fetch(path);
  let data = await response.text();
  return data;
}

const cubeRaw = await loadFile("./Resources/Meshes/Cube/cube.obj");
const cubeRawCol = await loadFile("./Resources/Meshes/Cube/cube.col");
const sqrPyrRaw = await loadFile("./Resources/Meshes/Square_Pyramid/square_pyramid.obj");
const sqrPyrRawCol = await loadFile("./Resources/Meshes/Square_Pyramid/square_pyramid.col");

export { cubeRaw, cubeRawCol, sqrPyrRaw, sqrPyrRawCol };