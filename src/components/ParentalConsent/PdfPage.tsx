import * as React from 'react';
import { styled } from 'styletron-react';
import { GlobalWorkerOptions, PDFPageProxy } from 'pdfjs-dist';

GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs';

interface PdfPageProps {
  pdfPage: PDFPageProxy;
}

interface PdfPageState {
}

type Props = PdfPageProps;
type State = PdfPageState;

const PdfPageCanvas = styled('canvas', {
  // Ensures that the canvas is centered *without getting clipped when larger than the parent container*
  // Ideally we would use "justify-content: safe center" on the parent flex container, but it's not supported in Safari yet
  // See https://stackoverflow.com/questions/33454533/cant-scroll-to-top-of-flex-item-that-is-overflowing-container
  margin: 'auto',
});

class PdfPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {};
  }

  private canvasRef = React.createRef<HTMLCanvasElement>();
  private resizeObserver: ResizeObserver | null = null;

  private updateCanvas = (): Promise<void> => {
    const canvasRef = this.canvasRef;
    if (!canvasRef.current) {
      return;
    }
    
    const pdfPage = this.props.pdfPage;

    const PADDING = 20;
    const parentContainerWidth = canvasRef.current.parentElement.clientWidth - PADDING;
    const unscaledViewport = pdfPage.getViewport({ scale: 1.0, });
    const scaleFactorFit = parentContainerWidth / unscaledViewport.width;
    const scaleFactorClamped = Math.max(1.0, Math.min(1.5, scaleFactorFit));

    const viewport = pdfPage.getViewport({ scale: scaleFactorClamped, });
    // Support HiDPI-screens.
    const outputScale = window.devicePixelRatio || 1;

    const context = canvasRef.current.getContext('2d');

    canvasRef.current.width = Math.floor((viewport.width - PADDING) * outputScale);
    canvasRef.current.height = Math.floor(viewport.height * outputScale);
    canvasRef.current.style.width = Math.floor((viewport.width - PADDING)) + "px";
    canvasRef.current.style.height = Math.floor(viewport.height) + "px";

    const transform = outputScale !== 1
      ? [outputScale, 0, 0, outputScale, 0, 0]
      : null;
    
    const renderTask = pdfPage.render({
      canvasContext: context,
      transform: transform,
      viewport: viewport,
    });

    return renderTask.promise;
  };

  async componentDidMount(): Promise<void> {
    await this.updateCanvas();

    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver((entries) => {
        this.updateCanvas();
      });
      this.resizeObserver.observe(this.canvasRef.current.parentElement);
    }
  }

  componentWillUnmount(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  // Does NOT re-render the PDF page from props
  // Only re-renders when component is mounted
  // To re-render the PDF, use a React key to force re-mounting
  render() {
    return <PdfPageCanvas ref={this.canvasRef} />;
  }
}

export default PdfPage;