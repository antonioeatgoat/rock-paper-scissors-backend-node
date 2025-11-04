import { Transform } from 'class-transformer';
import type { Socket } from 'socket.io';

export const TransformSocketToId = () =>
  Transform(({ value }) => (value as Socket | undefined)?.id);
