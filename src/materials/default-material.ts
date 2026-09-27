import { material } from './material';
import { vec3 } from '~/math/vec3';

export const defaultMaterial = material({
  color: vec3(0.1, 0.1, 0.1),
});
