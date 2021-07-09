/**
 * GlobalEvents allows components to easily register callbacks for window-wide events, such
 * as mouse move or mouse up.
 * 
 * This is useful when a drag action, for example, shouldn't end when the cursor leaves the
 * component (e.g. scroll bars).
 * 
 * The component must remember to remove itself once the callback is no longer needed
 * or the component will unmount.
 */
export class GlobalEvents {
  private types_: GlobalEvents.EventTypes = {
    onMouseMove: new GlobalEvents.EventType(),
    onMouseUp: new GlobalEvents.EventType()
  };

  constructor() {
    window.onmousemove = this.types_.onMouseMove.trigger;
    window.onmouseup = this.types_.onMouseUp.trigger;
  }

  private handles_ = new Map<number, [keyof GlobalEvents.EventTypes, number]>();
  private iter_ = 0;

  add<T>(type: keyof GlobalEvents.EventTypes, callback: GlobalEvents.EventCallback<T>): GlobalEvents.Handle {
    const id = this.types_[type].add(callback as GlobalEvents.EventCallback);
    const ret = this.iter_;
    this.handles_.set(this.iter_++, [type, id]);
    return ret;
  }

  remove(id: number) {
    const [type, innerId] = this.handles_.get(id);
    this.types_[type].remove(innerId);
    this.handles_.delete(id);
  }
}

export namespace GlobalEvents {
  export type EventCallback<T = unknown> = (event: T) => boolean;

  export class EventType<T> {
    private callbacks_ = new Map<number, EventCallback<T>>();
    private iter_ = 0;

    add(callback: EventCallback<T>) {
      const ret = this.iter_;
      this.callbacks_.set(this.iter_++, callback);
      return ret;
    }

    remove(id: number) {
      this.callbacks_.delete(id);
    }

    trigger = (event: T) => {
      for (const callback of this.callbacks_.values()) {
        if (callback(event)) return true;
      }

      return false;
    };
  }

  export interface EventTypes {
    onMouseMove: EventType<MouseEvent>,
    onMouseUp: EventType<MouseEvent>
  }

  export type Handle = number;
}

export const GLOBAL_EVENTS = new GlobalEvents();