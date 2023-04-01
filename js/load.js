//Load file from specified url and returns contents
async function loadFile(path) {
  let response = await fetch(path);
  let data = await response.text();
  return data;
}

const cubeRaw = await loadFile("./Resources/Meshes/Cube/cube.obj");

export { cubeRaw };