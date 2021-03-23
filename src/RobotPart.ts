export class RobotPart {
  height: string;
  href: string;
  transform: string;
  xOff: number;
  yOff: number;
  
  public updatePart(heightIn: string, hrefIn: string, transformIn: string, xOffIn: number, yOffIn: number): void {
    this.height = heightIn;
    this.href = hrefIn;
    this.transform = transformIn;
    this.xOff = xOffIn;
    this.yOff = yOffIn;
  }
}