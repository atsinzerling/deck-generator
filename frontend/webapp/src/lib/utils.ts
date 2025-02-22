import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function downloadFile(dataStr: string, fileName: string, mimeType: string) {
  const a = document.createElement("a");
  a.setAttribute("href", `data:${mimeType};charset=utf-8,` + encodeURIComponent(dataStr));
  a.setAttribute("download", fileName);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}