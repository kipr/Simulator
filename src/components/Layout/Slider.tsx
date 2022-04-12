import * as React from 'react';
import { styled } from 'styletron-react';

interface SliderState {
    height: string;
    width: string;
}

export enum Side {
    Bottom = 0,
    Top,
    Right,
    Left
}

const Container = styled('div', {
    display: "flex",
    alignItems: "stretch",
});
const BottomContainer = styled(Container, {
    flexDirection: "column",
    justifyContent: "flex-start",

});
const TopContainer = styled(Container, {
    flexDirection: "column-reverse",
    justifyContent: "flex-end",
});
const RightContainer = styled(Container, {
    flexDirection: "row",
    justifyContent: "flex-start",
});
const LeftContainer = styled(Container, {
    flexDirection: "row-reverse",
    justifyContent: "flex-end",
});


export interface SliderProps {
    side: Side,
    containerStyle: any;
    sliderStyle: any;
    children: any;
}

export default function Slider(props) {

    let { containerStyle, sliderStyle, side, children} = props;

    let ref = React.useRef<HTMLDivElement>();
    let childRef = React.useRef<React.ReactNode>();

    let [movesHorizontal, _] = React.useState(side === Side.Right || side === Side.Left);
    let [height, setHeight] = React.useState<string>(movesHorizontal? '' :'100px');
    let [width, setWidth] = React.useState<string>(movesHorizontal? '100px':'');
    let requestingFrame = false;
    let dragging = false;
    let dragDist = 0;
    let barPosition = null;
    let mouseIsOver = true;

    const onClick = (e) => {
        document.body.style.cursor = movesHorizontal ? "col-resize" : "row-resize";
        //if ((ref !== undefined) && (ref.current !== undefined)) ref.current.style.cursor = document.body.style.cursor
        barPosition = movesHorizontal ? e.clientX : e.clientY;
        dragging = true;
    };

    document.addEventListener("mousemove", e => {
        if (dragging && e[movesHorizontal ? "movementX" : "movementY"]) {
          dragDist += e[movesHorizontal ? "movementX" : "movementY"];
        }
        if (!requestingFrame && dragging && dragDist) {
          requestingFrame = true;
          requestAnimationFrame(() => {
            requestingFrame = false;
            dragDist = (side === "left" || side === "top")? -dragDist : dragDist;
            let dimension = childRef.current[movesHorizontal ? "clientWidth" : "clientHeight"] + dragDist;
            dimension = dimension > 0 ? dimension : 0;
            // let parentDimension = this.ref.current.parent.style[movesHorizontal ? "width" : "height"] > 
            // if(dimesion >)
            if (movesHorizontal) setWidth(dimension + "px");
            else setHeight(dimension + "px");
            
            dragDist = 0;
          });
        }
    });

    document.addEventListener("mouseup", e => {
        document.body.style.cursor = "auto";
        //ref.current.style.cursor = movesHorizontal ? "col-resize" : "row-resize"; //"pointer"
        dragging = false;
    });

    return (
    <BottomContainer>
        {React.cloneElement(children, {
            style: {
                ...children.props.style,
                height: height,
                width: width,
                // onResize
            },
            ref: childRef
        })}
        <div
            ref={ref}
            onMouseDown={onClick}
            style={{
                backgroundColor: "blue",
                [movesHorizontal ? "width" : "height"]:"10px",
                cursor: movesHorizontal ? "col-resize" : "row-resize", 
                //...sliderStyle
            }}
        />
    </BottomContainer>
    );
}

// class Slider extends React.PureComponent<SliderProps,SliderState>  {
//     private childRef: React.RefObject<any>;
//     private ref: React.RefObject<Slider>;
//     private style;

//     constructor(props) {
//       super(props);
//       this.childRef = React.createRef();
//       this.ref = React.createRef();
//       let { style } = props;
//       this.state = {
//         height: style.height || "500px",
//         width: style.width || "500px"
//       };
//     }
//     render() {
//       let side = this.props.side;
//       let movesHorizontal = side === "right" || side === "left";
//       let requestingFrame = false;
//       let dragging = false;
//       let dragDist = 0;
//       let barPosition = null;
//       let mouseIsOver = true;
  
//       const onClick = e => {
//         document.body.style.cursor = this.ref.current.style.cursor = movesHorizontal
//           ? "col-resize"
//           : "row-resize";
//         barPosition = movesHorizontal ? e.clientX : e.clientY;
//         dragging = true;
//       };
//       document.addEventListener("mousemove", e => {
//         if (dragging && e[movesHorizontal ? "movementX" : "movementY"]) {
//           dragDist += e[movesHorizontal ? "movementX" : "movementY"];
//         }
//         if (!requestingFrame && dragging && dragDist) {
//           requestingFrame = true;
//           requestAnimationFrame(() => {
//             requestingFrame = false;
//             dragDist = (side === "left" || side === "top")? -dragDist : dragDist;
//             let dimension =
//               this.childRef.current[
//                 movesHorizontal ? "clientWidth" : "clientHeight"
//               ] + dragDist;
//             dimension = dimension > 0 ? dimension : 0;
//             // let parentDimension = this.ref.current.parent.style[movesHorizontal ? "width" : "height"] > 
//             // if(dimesion >)
//             if (movesHorizontal) {
//                 this.setState({
//                     width: dimension + "px"
//                 });
//             } else {
//                 this.setState({
//                     height: dimension + "px"
//                 });
//             }
            
//             dragDist = 0;
//           });
//         }
//       });
//       document.addEventListener("mouseup", e => {
//         document.body.style.cursor = "auto";
//         this.ref.current.style.cursor = movesHorizontal
//           ? "col-resize"
//           : "row-resize"; //"pointer"
//         dragging = false;
//       });
  
//       let containerStyle = this.props.containerStyle || {}
//       let sliderStyle = this.props.sliderStyle || {}
//       return (
//         <div 
//           style={{ 
//             display: "flex", 
//               alignItems:"stretch",
//               flexDirection:(side==="bottom")?"column":(side==="top")?"column-reverse":(side==="left")?"row-reverse":"row" ,
//                 justifyContent: (side==="top" || side==="left") ? "flex-end" : "flex-start",
//                   ...containerStyle
//           }}>
//           {React.cloneElement(this.props.children, {
//             style: {
//               ...this.props.children.props.style,
//               height: this.state.height,
//               width: this.state.width,
//               // onResize
//             },
//             ref: this.childRef
//           })}
//           <div
//             ref={this.ref as RefObject<HTMLDivElement>}
//             onMouseDown={onClick}
//             style={{
//               backgroundColor: "blue",
//               [movesHorizontal ? "width" : "height"]:"20px",
//               cursor: movesHorizontal ? "col-resize" : "row-resize", 
//               ...sliderStyle
//             }}
//           />
//         </div>
//       );
//     }
//   }