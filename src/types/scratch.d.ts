declare namespace Blockly {
  function inject(container: Element, options: any): unknown;
  namespace Xml {
    function workspaceToDom(workspace: unknown): XMLDocument;
    function domToWorkspace(dom: XMLDocument, workspace: unknown): void;
    function domToPrettyText(xml: XMLDocument): string;
  }
}