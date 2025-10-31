declare module 'asciichart' {
  interface PlotConfig {
    height?: number;
    colors?: string[];
    offset?: number;
    padding?: string;
    min?: number;
    max?: number;
  }

  export function plot(series: number[] | number[][], config?: PlotConfig): string;
}
