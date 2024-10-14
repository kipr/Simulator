declare namespace Blockly {
  interface Workspace {
    addChangeListener(listener: (event: any) => void): void;
    removeChangeListener(listener: (event: any) => void): void;
    clear();
  }

  function inject(container: Element, options: any): Workspace;

  function svgResize(workspace: Workspace);
  
  namespace Xml {
    function workspaceToDom(workspace: Workspace): XMLDocument;
    function domToWorkspace(dom: XMLDocument, workspace: unknown): void;
    function domToPrettyText(xml: XMLDocument): string;
    function textToDom(text: string): XMLDocument;
  }

  interface Toolbox {
    setVisible(visible: boolean): void;
  }

  interface MainWorkspace {
    getToolbox(): Toolbox;
  }

  function getMainWorkspace(): MainWorkspace;
    
}