import { createEngine } from '~/engine';
import { OrbitCamera } from '~/cameras/orbit-camera';
import { smoothUnion } from '~/operations/smooth-union';
import { torus } from '~/primitives/torus';
import { box } from '~/primitives/box';
import { material } from '~/materials/material';
import { vec3 } from '~/math/vec3';
import { remap01 } from '~/math/utils';

const engine = await createEngine({ camera: new OrbitCamera() });
document.body.append(engine.canvas);

const ring = torus();

const cube = box({
  size: vec3.fromScalar(0.7),
  material: material({ color: vec3(0, 0.5, 1) }),
});

const operation = smoothUnion(ring, cube);

engine.scene.add(operation);

engine.tick.subscribe(({ elapsedTime, deltaTime }) => {
  ring.rotation.x += deltaTime * 0.6;
  ring.rotation.y += deltaTime * 0.6;
  ring.material.color.x = remap01(Math.sin(elapsedTime * 0.001));
  ring.material.color.y = 1 - remap01(Math.sin(elapsedTime * 0.001));

  cube.rotation.x -= deltaTime * 0.3;
  cube.rotation.y -= deltaTime * 0.3;
  cube.material.color.x = remap01(Math.sin(elapsedTime * 0.001));

  engine.render();
});
