import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'lineBreaks'
})
export class LineBreaksPipe implements PipeTransform {
transform(value: string): Array<{ text: string, isPhoneNumber: boolean }> {
  if (!value) return [];

  // Replace line breaks and tabs first
  let formatted = value
    .replace(/\n/g, '<br>')
    .replace(/\t/g, '&emsp;')
    .replace(/\*(.*?)\*/g, '<b>$1</b>');

  const regex = /\b(?:91)?\d{10}\b/g;

  let result: Array<{ text: string, isPhoneNumber: boolean }> = [];

  let lastIndex = 0;
  let match;

  while ((match = regex.exec(formatted)) !== null) {
    // Text before phone number
    if (match.index > lastIndex) {
      result.push({ text: formatted.substring(lastIndex, match.index), isPhoneNumber: false });
    }
    // Phone number
    result.push({ text: match[0], isPhoneNumber: true });

    lastIndex = regex.lastIndex;
  }
  // Remaining text after last match
  if (lastIndex < formatted.length) {
    result.push({ text: formatted.substring(lastIndex), isPhoneNumber: false });
  }
  return result;
}


 
}
