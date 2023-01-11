import * as React from 'react';

import FileDocumentation from '../../state/State/Documentation/FileDocumentation';

const FileBrief = ({ file }: { file: FileDocumentation }) => (
  <div>{file.name}</div>
);

export default FileBrief;