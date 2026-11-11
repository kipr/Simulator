export class TourRegistry {
  private map = new Map<string, HTMLElement>();
  private tourID: string;

  constructor(tourId: string) {
    this.tourID = tourId;
  }

  getTourID(): string {
    return this.tourID;
  }
  register(key: string, el: HTMLElement | null) {
    if (!key) return;
    if (el) this.map.set(key, el);
    else this.map.delete(key);
  }

  get(key: string): HTMLElement | null {
    return this.map.get(key) ?? null;
  }
}