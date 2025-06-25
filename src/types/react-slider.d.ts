declare module 'react-slider' {
  import { Component } from 'react';

  interface SliderProps {
    value?: number | number[];
    onChange?: (value: number | number[]) => void;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    className?: string;
    thumbClassName?: string;
    trackClassName?: string;
    orientation?: 'horizontal' | 'vertical';
    withTracks?: boolean;
    pearling?: boolean;
    minDistance?: number;
    renderThumb?: (props: any, state: any) => React.ReactNode;
    renderTrack?: (props: any, state: any) => React.ReactNode;
    renderMark?: (props: any) => React.ReactNode;
    marks?: number[] | boolean;
    markClassName?: string;
    thumbActiveClassName?: string;
    trackActiveClassName?: string;
    ariaLabel?: string | string[];
    ariaLabelledby?: string | string[];
    ariaValuetext?: string | string[];
    pageFn?: (value: number) => number;
    snapDragDisabled?: boolean;
    invert?: boolean;
  }

  export default class Slider extends Component<SliderProps> {}
}
