import { StorefrontSlider } from '../entities';

export type SliderWithExtras = StorefrontSlider & {
  url?: string | null;
};
