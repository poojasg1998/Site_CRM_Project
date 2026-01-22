import {
  Directive,
  ElementRef,
  Input,
  Renderer2,
  OnChanges,
  AfterViewInit,
} from '@angular/core';

@Directive({
  selector: '[appCenterActiveButton]',
})
export class CenterActiveButtonDirective implements OnChanges, AfterViewInit {
  @Input('appCenterActiveButton') activeButtonId!: string;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.activeButtonId) {
        this.centerActiveButton();
      }
    }, 500);

    this.renderer.listen(this.el.nativeElement, 'click', () => {
      this.centerActiveButton();
    });
  }

  ngOnChanges() {
    this.centerActiveButton();
  }

  private centerActiveButton() {
    setTimeout(() => {
      const container = this.el.nativeElement;
      const elements = container.querySelectorAll('.custom-col');

      // ✅ Define equivalent ID groups
      const missedGroup = ['id-missed', 'id-reconnected', 'id-missedF'];

      // Determine which ID(s) should be treated as active
      let element: HTMLElement | null = null;

      // ✅ Handle group logic
      if (['missed', 'reconnected', 'missedF'].includes(this.activeButtonId)) {
        for (const id of missedGroup) {
          element = container.querySelector(`#${id}`);
          if (element) break;
        }
      } else {
        element = container.querySelector(`#id-${this.activeButtonId}`);
      }

      // Remove previous highlighting
      elements.forEach((el: HTMLElement) => {
        el.classList.remove('active_text_borederColor');
      });

      // Highlight and center the current one
      if (container && element) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();

        const scrollLeft =
          container.scrollLeft +
          (elementRect.left - containerRect.left) -
          container.clientWidth / 2 +
          element.clientWidth / 2;

        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        element.classList.add('active_text_borederColor');
      }
    }, 200);
  }
}
