import * as CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';

export class CodeMirrorManager {

    public editor: CodeMirror.Editor;

    config: CodeMirror.EditorConfiguration = {
        lineNumbers: true,
        theme: 'kiss',
    };

    definition: HTMLTextAreaElement = 
    document.getElementById('code') as HTMLTextAreaElement;

    // CTOR
    constructor() {
        this.editor = CodeMirror.fromTextArea(this.definition, this.config);
    }
}