/* eslint-disable @typescript-eslint/no-empty-object-type -- Required JSX augmentation for @react-three/fiber */
import type { ThreeElements } from '@react-three/fiber';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}
