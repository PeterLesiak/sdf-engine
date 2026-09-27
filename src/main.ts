import { createEngine } from '~/engine';
import { smoothUnion } from '~/operations';
import { torus } from '~/primitives/torus';
import { box } from './primitives/box';
import { material } from '~/materials';
import { vec3 } from '~/math/vec3';
import { remap01 } from '~/math/utils';

const engine = await createEngine();
document.body.append(engine.canvas);

const model = torus({ material: material({ color: vec3(0, 0.8, 0) }) });

const cube = box({
  size: vec3.fromScalar(0.7),
  material: material({ color: vec3(0, 0.5, 1) }),
});

const operation = smoothUnion(model, cube, 0.9);

engine.scene.add(operation);

engine.tick.subscribe(({ elapsedTime, deltaTime }) => {
  model.rotation.x += deltaTime * 0.6;
  model.rotation.y += deltaTime * 0.6;

  operation.param = remap01(Math.sin(elapsedTime * 0.001));
  model.material.color.x = remap01(Math.sin(elapsedTime * 0.001));
  model.material.color.y = 1 - remap01(Math.sin(elapsedTime * 0.001));
  cube.material.color.x = remap01(Math.sin(elapsedTime * 0.001));

  engine.render();
});
