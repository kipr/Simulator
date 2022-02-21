import { Vector2 } from "../math";

export type ResizeCallback = (size: Vector2, element: Element) => void;

export interface ResizeListener {
  observe(element: Element);
  unobserve(element: Element);
  disconnect();
}

class Polled implements ResizeListener {
  private callback_: ResizeCallback;
  private elements_ = new Map<Element, Vector2>();
  private running_ = false;

  private tick_ = () => {
    if (!this.running_) return;

    for (const key of this.elements_.keys()) {
      const next = key.getBoundingClientRect();
      const last = this.elements_.get(key);

      if (last.x === next.width && last.y === next.height) continue;

      last.x = next.width;
      last.y = next.height;
      this.callback_(last, key);
    }

    requestAnimationFrame(this.tick_);
  };

  private updateTick_ = () => {
    if (!this.running_ && this.elements_.size > 0) {
      this.running_ = true;
      requestAnimationFrame(this.tick_);
    }

    if (this.running_ && this.elements_.size === 0) {
      this.running_ = false;
    }
  };

  constructor(callback: ResizeCallback) {
    this.callback_ = callback;
  }
  
  observe(element: Element) {
    this.elements_.set(element, { x: 0, y: 0 });
    this.updateTick_();
  }

  unobserve(element: Element) {
    this.elements_.delete(element);
    this.updateTick_();
  }

  disconnect() {
    this.updateTick_();
  }
}

class Evented implements ResizeListener {
  private callback_: ResizeCallback;
  private observer_: ResizeObserver;

  private onResize_ = (entries: ResizeObserverEntry[]) => {
    for (const entry of entries) {
      this.callback_(Evented.getResizeObserverEntrySize(entry), entry.target);
    }
  };

  private static getResizeObserverEntrySize(entry: ResizeObserverEntry): Vector2 {
    if (entry.borderBoxSize) {
      // Firefox implements borderBoxSize as an object instead of an array, so check for either
      const borderBoxSize = entry.borderBoxSize as unknown;
      const borderBox: ResizeObserverSize = Array.isArray(borderBoxSize)
        ? borderBoxSize[0] as ResizeObserverSize
        : borderBoxSize as ResizeObserverSize;
      return { x: borderBox.inlineSize, y: borderBox.blockSize };
    } else if (entry.contentRect) {
      // Safari doesn't return borderBoxSize, so fall back to contentRect
      return { x: entry.contentRect.width, y: entry.contentRect.height };
    }
    
    console.error('failed to get size of ResizeObserverEntry');
    return { x: 0, y: 0 };
  }
  
  constructor(callback: ResizeCallback) {
    this.callback_ = callback;
    this.observer_ = new ResizeObserver(this.onResize_);
  }

  observe(element: Element) {
    this.observer_.observe(element);
  }

  unobserve(element: Element) {
    this.observer_.unobserve(element);
  }

  disconnect() {
    this.observer_.disconnect();
  }
}

export default (callback: ResizeCallback): ResizeListener => ('ResizeObserver' in window ? new Evented(callback) : new Polled(callback));