import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getHSLColor(variable: string, opacity: number = 1): string {
  const root = document.documentElement;
  const style = getComputedStyle(root);
  const value = style.getPropertyValue(variable).trim();
  const [h, s, l] = value.split(' ').map(v => parseFloat(v.replace('%', '')));
  return opacity === 1 
    ? `hsl(${h}, ${s}%, ${l}%)`
    : `hsla(${h}, ${s}%, ${l}%, ${opacity})`;
}