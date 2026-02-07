import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
  Renderer2
} from '@angular/core';

@Directive({
  selector: '[appLongPress]'
})
export class LongPressDirective {
  @Output() longPress = new EventEmitter<boolean>();
  private timeoutId: any;
  private readonly pressDuration = 500; // Long press duration
  private isPressing = false;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('mousedown')
  @HostListener('touchstart')
  onPressStart() {
    this.isPressing = true;
    this.timeoutId = setTimeout(() => {
      if (this.isPressing) {
        this.longPress.emit(true); // 🔥 Emit only after long press
      }
    }, this.pressDuration);
  }

  @HostListener('mouseup')
  @HostListener('mouseleave')
  @HostListener('touchend')
  @HostListener('touchcancel')
  onPressEnd() {
    this.isPressing = false;
    clearTimeout(this.timeoutId);
  }

  @HostListener('press', ['$event'])
onPress(event: Event) {
  event.stopPropagation();
  this.longPress.emit();
}
}


