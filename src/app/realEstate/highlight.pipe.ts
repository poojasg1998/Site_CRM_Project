import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlight'
})
export class HighlightPipe implements PipeTransform {
  transform(value: string, searchText: string,className: string = 'highlight-match'): string {
    if (!value || !searchText) return value;

    const escaped = searchText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(escaped, 'gi');

    // return value.replace(regex, match => `<mark>${match}</mark>`);
    return value.replace(regex, match =>`<mark class="${className}">${match}</mark>`);
  }
}