import { styled } from 'styletron-react';
import * as React from "react";
import { ThemeProps } from './theme';

export const Spacer = styled('div', {
  flex: '1 1'
});


export const SummaryCardSVG = ({
  theme
}: ThemeProps): React.ReactElement => {

  const { summaryCard } = theme;
  return (
    <svg
      viewBox="0 0 620 167"
      preserveAspectRatio="none"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <defs>
        <linearGradient
          id="summaryGreyGradient"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop
            offset="0%"
            stopColor={summaryCard.backgroundStart}
          />
          <stop
            offset="55%"
            stopColor={summaryCard.backgroundMiddle}
          />
          <stop
            offset="100%"
            stopColor={summaryCard.backgroundEnd}
          />
        </linearGradient>

        <linearGradient
          id="summaryHighlight"
          x1="0"
          y1="0"
          x2="1"
          y2="0"
        >
          <stop
            offset="0%"
            stopColor={summaryCard.trace}
            stopOpacity="0.10"
          />
          <stop
            offset="65%"
            stopColor={summaryCard.trace}
            stopOpacity="0.02"
          />
          <stop
            offset="100%"
            stopColor={summaryCard.trace}
            stopOpacity="0"
          />
        </linearGradient>q

        <pattern
          id="summaryDotPattern"
          width="12"
          height="12"
          patternUnits="userSpaceOnUse"
        >
          <circle
            cx="3"
            cy="3"
            r="1.2"
            fill={summaryCard.dot}
            opacity="0.07"
          />
        </pattern>
      </defs>

      <rect
        x="0"
        y="0"
        width="620"
        height="167"
        rx="8"
        fill="url(#summaryGreyGradient)"
      />

      <path
        d="M 0 2 H 620"
        fill="none"
        stroke="url(#summaryHighlight)"
        strokeWidth="2"
      />

      <g
        fill="none"
        stroke={summaryCard.trace}
        strokeWidth="1"
        opacity="0.07"
      >
        <path d="M 0 48 H 75 L 92 65 H 150" />
        <path d="M 20 77 H 110 L 132 99 H 205" />
        <path d="M 0 125 H 60 L 78 143 H 165" />
      </g>

      <g
        fill="none"
        stroke={summaryCard.trace}
        strokeWidth="1"
        opacity="0.055"
      >
        <path d="M 230 25 H 285 L 305 45 H 365" />
        <path d="M 270 120 H 330 L 350 140 H 420" />
      </g>

      <g
        fill="none"
        stroke={summaryCard.trace}
        strokeWidth="1"
        opacity="0.07"
      >
        <path d="M 420 48 H 485 L 505 68 H 590" />
        <path d="M 465 91 H 520 L 542 113 H 620" />
      </g>

      <g
        fill={summaryCard.nodeFill}
        stroke={summaryCard.nodeStroke}
        strokeWidth="1"
        opacity="0.15"
      >
        <circle cx="150" cy="65" r="3" />
        <circle cx="205" cy="99" r="3" />
        <circle cx="365" cy="45" r="3" />
        <circle cx="420" cy="140" r="3" />
        <circle cx="590" cy="68" r="3" />
      </g>

      <path
        d="
          M 470 100
          Q 530 78 620 92
          L 620 167
          L 485 167
          Q 455 140 470 100
          Z
        "
        fill="url(#summaryDotPattern)"
        opacity="0.75"
      />

      <path
        d="
          M 0 140
          Q 130 128 250 145
          Q 390 160 620 130
          L 620 167
          L 0 167
          Z
        "
        fill={summaryCard.depth}
        opacity="0.07"
      />
    </svg>
  );
};