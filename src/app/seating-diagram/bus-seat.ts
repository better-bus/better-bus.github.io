import { AsyncPipe } from "@angular/common";
import { Pipe, Component, input, computed } from "@angular/core";

@Pipe({ name: 'labelFontSize', pure: true })
export class LabelFontSizePipe {
  async transform(label: string, containerSize: number): Promise<number> {
    const trialFontSize = 100;
    const span = document.createElement('span');
    const style = span.style;
    style.setProperty('color', 'transparent');
    style.setProperty('position', 'fixed');
    style.setProperty('bottom', '0');
    style.setProperty('right', '0');
    style.fontSize = `${trialFontSize}px`;
    style.whiteSpace = 'pre';
    span.textContent = label.replaceAll(/\s/g, '\n');
    document.body.appendChild(span);
    await new Promise(resolve => setTimeout(resolve, 0));
    const bounds = span.getBoundingClientRect();
    const largestSize = Math.max(bounds.width, bounds.height);
    const maxSize = containerSize / largestSize * trialFontSize;
    // since this will be displayed inside of a circle,
    // we don't want the text cut off by the circle edges
    const correctSize = maxSize * .9;
    return correctSize;
  }
}

@Component({
  selector: ':svg:g[busSeat]',
  template: `
    <svg:circle
      [attr.r]="size() / 2"
      stroke="black" fill="none" />

    @let fontSize = (label() | labelFontSize : size());
    @for(fragment of labelFragments(); track $index) {
      @let lineNum = $index;
      @if (fontSize | async; as fontSize) {
        <svg:text
          text-anchor="middle"
          alignment-baseline="middle"
          [attr.font-size]="fontSize + 'px'"
          [attr.y]="(labelFragments().length - 1) * lineNum * fontSize - (labelFragments().length - 1) * fontSize / 3"
        >
          {{ fragment }}
        </svg:text>
      }
    }
  `,
  imports: [LabelFontSizePipe, AsyncPipe]
})
export class BusSeat {
  readonly label = input.required<string>();
  readonly size = input.required<number>();
  readonly labelFragments = computed(() => this.label().split(/\s|\n/g));
}
