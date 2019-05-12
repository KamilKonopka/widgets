import {Directive, ElementRef, Host, HostListener, Input, OnInit} from '@angular/core';
import {
  BACKSPACE,
  DELETE,
  LEFT_ARROW,
  overwriteCharAtPosition,
  RIGHT_ARROW,
  SPECIAL_CHARACTERS,
  TAB
} from './mask.utils';
import * as includes from 'lodash.includes';
import * as findLastIndex from 'lodash.findLastIndex';
import * as findIndex from 'lodash.findIndex';
import {maskDigitValidators, neverValidator} from './digit_validators';

@Directive({
  selector: '[au-mask]'
})
export class AuMaskDirective implements OnInit {

  @Input('au-mask')
  mask = '';

  input: HTMLInputElement;

  constructor(protected el: ElementRef) {
    this.input = el.nativeElement;
  }

  ngOnInit(): void {

    this.input.value = this.buildPlaceholder();
  }

  @HostListener('keydown', ['$event', '$event.keyCode'])
  onKeyDown($event: KeyboardEvent, keyCode) {
    if (keyCode !== TAB) {
      $event.preventDefault();
    }

    const key = String.fromCharCode(keyCode),
      cursorPos = this.input.selectionStart;

    switch (keyCode) {
      case LEFT_ARROW:
        this.handleLeftArrow(cursorPos);
        return;
      case RIGHT_ARROW:
        this.handleRightArrow(cursorPos);
        return;
      case BACKSPACE:
        this.handleBackspace(cursorPos);
        return;
      case DELETE:
        this.handleDelete(cursorPos);
        return;


    }
    const maskDigit = this.mask.charAt(cursorPos),
      digitValidator = maskDigitValidators[maskDigit] || neverValidator;

    if (digitValidator(key)) {
      overwriteCharAtPosition(this.input, cursorPos, key);
      this.handleRightArrow(cursorPos);
    }
  }

  handleRightArrow(cursorPos) {
    const valueAfterCursor = this.input.value.slice(cursorPos + 1);
    const nextPos = findIndex(valueAfterCursor, char => !includes(SPECIAL_CHARACTERS, char));
    if (nextPos >= 0) {
      const newCursorPos = cursorPos + nextPos + 1;
      this.input.setSelectionRange(newCursorPos, newCursorPos);
    }
  }

  handleLeftArrow(cursorPos) {
    const previousPos = this.calculatePreviousCursorPos(cursorPos);
    if (previousPos >= 0) {
      this.input.setSelectionRange(previousPos, previousPos);
    }
  }

  handleBackspace(cursorPos) {
    const previousPos = this.calculatePreviousCursorPos(cursorPos);
    if (previousPos >= 0) {
      overwriteCharAtPosition(this.input, previousPos, '_');
      this.input.setSelectionRange(previousPos, previousPos);
    }
  }

  handleDelete(cursorPos) {
    overwriteCharAtPosition(this.input, cursorPos, '_');
    this.input.setSelectionRange(cursorPos, cursorPos);
  }

  calculatePreviousCursorPos(cursorPos): number {
    const valueBeforeCursor = this.input.value.slice(0, cursorPos);
    return findLastIndex(valueBeforeCursor, char => !includes(SPECIAL_CHARACTERS, char));
  }

  buildPlaceholder(): string {
    const chars = this.mask.split('');
    return chars.reduce((result, character) => {
      return result += includes(SPECIAL_CHARACTERS, character) ? character : '_';
    }, '');
  }
}
