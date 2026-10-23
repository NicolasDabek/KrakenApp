export function cents(n: number): number {
  return Math.round(n * 100) / 100;
}

export function pushWarn(list: string[], text: string) {
  if (!list.includes(text)) list.push(text);
}
