import * as React from 'react';
import { styled } from 'styletron-react';
import { PDFPageProxy, PixelsPerInch } from 'pdfjs-dist';
import { EventBus, LinkTarget, PDFPageView, SimpleLinkService } from 'pdfjs-dist/web/pdf_viewer.mjs';
import 'pdfjs-dist/web/pdf_viewer.css';

// Zero-configuration setup for PDF.js worker with webpack
import 'pdfjs-dist/webpack.mjs';

interface PdfPageProps {
  pdfPage: PDFPageProxy;
  pdfPageNum: number;
}

interface PdfPageState {
}

type Props = PdfPageProps;
type State = PdfPageState;

const PdfPageContainer = styled('div', {
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

  private divContainerRef = React.createRef<HTMLDivElement>();
  private pdfPageView: PDFPageView = null;
  private resizeObserver: ResizeObserver | null = null;
  private scaleFactor = 0;

  private calculateScaleFactor = (): number => {    
    const parentElement = this.divContainerRef.current.parentElement;
    const parentComputedStyle = getComputedStyle(parentElement);
    const parentHorizontalPadding = parseFloat(parentComputedStyle.paddingLeft) + parseFloat(parentComputedStyle.paddingRight);
    const parentContainerWidth = parentElement.clientWidth - parentHorizontalPadding;
    const unscaledPdfViewport = this.props.pdfPage.getViewport({ scale: 1.0, });
    const scaleFactorFit = parentContainerWidth / (unscaledPdfViewport.width * PixelsPerInch.PDF_TO_CSS_UNITS);

    // Clamp the scale factor to avoid zooming in/out too much
    const scaleFactorClamped = Math.max(1.0, Math.min(1.5, scaleFactorFit));

    // Round down to 2 decimal places to avoid horizontal scrollbars at some ratios
    return Math.floor(scaleFactorClamped * 100) / 100;
  };

  private initialRenderPdf = (): Promise<unknown> => {
    const pdfPage = this.props.pdfPage;
    const viewport = pdfPage.getViewport({ scale: 1.0, });
    this.scaleFactor = this.calculateScaleFactor();

    const eventBus = new EventBus();
    this.pdfPageView = new PDFPageView({
      container: this.divContainerRef.current,
      id: this.props.pdfPageNum,
      scale: this.scaleFactor,
      defaultViewport: viewport,
      eventBus,
      layerProperties: {
        // Ensure that links in the PDF open in a new tab
        linkService: new SimpleLinkService({
          eventBus,
          externalLinkTarget: LinkTarget.BLANK,
        }),
      },
    });

    this.pdfPageView.setPdfPage(pdfPage);

    return this.pdfPageView.draw();
  };

  private rescalePdf = (): Promise<unknown> => {
    if (!this.pdfPageView) {
      console.error('rescale failed, pdfPageView not ready');
      return;
    }

    const newScaleFactor = this.calculateScaleFactor();
    if (newScaleFactor === this.scaleFactor) {
      return;
    }

    this.scaleFactor = newScaleFactor;

    this.pdfPageView.update({ scale: this.scaleFactor });
    return this.pdfPageView.draw();
  };

  async componentDidMount(): Promise<void> {
    await this.initialRenderPdf();

    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver((entries) => {
        void this.rescalePdf();
      });
      this.resizeObserver.observe(this.divContainerRef.current.parentElement);
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
    return <PdfPageContainer ref={this.divContainerRef} className="pdfViewer singlePageView" />;
  }
}

export default PdfPage;