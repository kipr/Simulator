interface ResizeState {
  isVertical: boolean,
  resizing: boolean,
  refs?: [React.MutableRefObject<HTMLDivElement>, React.MutableRefObject<HTMLDivElement>],
  grows?: number[],
  minSizes: number[],
  scaledMinSizes?: number[],
  startGrows?: number[],
  startPos?: number,
}

export enum Actions {
  MouseDown,
  MouseUp,
  MouseMove,
}
interface ResizeAction {
  actionType: Actions,
  x?: number,
  y?: number,
}
export function resizeOnPointerMove(state: ResizeState, action: ResizeAction): ResizeState {
  const { isVertical, refs, minSizes, scaledMinSizes, grows, startGrows, startPos, resizing } = state;
  const { actionType, x, y } = action;
  const pos = (isVertical) ? x : y;

  // check that our refs are loaded
  if (refs[0].current === null || refs[1].current === null) return state;

  // get the current size of each panel
  const currSizes = refs.map((ref) => (isVertical ? ref.current.offsetWidth : ref.current.offsetHeight));
  const sumSize = currSizes[0] + currSizes[1];
  const sumGrow = grows[0] + grows[1];
  
  // When we start our resize, store the size of each element and the mouse
  if (actionType === Actions.MouseDown) {
    // scale the min sizes
    const scaledMinSizes = minSizes.map(x => sumGrow * x / sumSize);

    return {
      ...state,
      startGrows: grows,
      startPos: pos,
      resizing: true,
      scaledMinSizes: scaledMinSizes,
    };
  }
  if (!resizing) return state;

  // resizing!
  
  // resize the panels, respecting their mininmum sizes

  const diff = pos - startPos;
  // scale the diff, since flex units != size units
  let currGrows = [sumGrow * (diff / sumSize),  sumGrow * (-diff / sumSize)];
  // add to grows
  currGrows = [startGrows[0] + currGrows[0], startGrows[1] + currGrows[1]];

  // respect minimum sizes
  if (currGrows[0] < scaledMinSizes[0]) {
    currGrows[1] += currGrows[0] - scaledMinSizes[0];
    // pos -= currSizes[0] - minSizes[0];
    currGrows[0] = scaledMinSizes[0];
  }
  if (currGrows[1] < scaledMinSizes[1]) {
    currGrows[0] += currGrows[1] - scaledMinSizes[1];
    // pos += currSizes[1] - minSizes[1];
    currGrows[1] = scaledMinSizes[1];
  }
    
  // stop the resize on mouseup
  // update the state to triger a re-render
  if (actionType === Actions.MouseUp) {
    return { 
      ...state, 
      grows: currGrows,
      resizing: false
    };
  }
  return {
    ...state,
    grows: currGrows,
  };
}
  