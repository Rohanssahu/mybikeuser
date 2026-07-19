import React from 'react';
import Svg, {Circle, Path, Rect} from 'react-native-svg';

// Quick Help / Help Center only draws icons for categories that have no
// matching asset in src/component/Image.tsx (wrench, tyre, battery, fuel,
// shield, card, clock, chat, paperclip, ticket). Kept as one line-icon set
// (react-native-svg is already an installed dependency) so the Quick Help
// grid reads as one consistent style instead of mixing PNG + SVG weights.
export type HelpIconName =
  | 'wrench'
  | 'tire'
  | 'battery'
  | 'fuel'
  | 'shield'
  | 'card'
  | 'clock'
  | 'chat'
  | 'paperclip'
  | 'ticket'
  | 'chevronDown'
  | 'closeCircle';

interface HelpIconProps {
  name: HelpIconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const HelpIcon: React.FC<HelpIconProps> = ({
  name,
  size = 20,
  color = '#081041',
  strokeWidth = 1.8,
}) => {
  const common = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none' as const,
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'wrench' && (
        <Path
          {...common}
          d="M14.5 6a4 4 0 0 0-5 5L4.8 15.7a1.8 1.8 0 0 0 2.5 2.5L12 13.5a4 4 0 0 0 5-5l-2.4 2.4-2-2Z"
        />
      )}
      {name === 'tire' && (
        <>
          <Circle cx={12} cy={12} r={7.3} {...common} />
          <Circle cx={12} cy={12} r={2.6} {...common} />
          <Path
            {...common}
            d="M12 5v2.4M12 16.6V19M5 12h2.4M16.6 12H19M7.2 7.2l1.7 1.7M15.1 15.1l1.7 1.7M7.2 16.8l1.7-1.7M15.1 8.9l1.7-1.7"
          />
        </>
      )}
      {name === 'battery' && (
        <>
          <Rect x={3} y={8} width={15.5} height={8} rx={2} {...common} />
          <Rect x={19} y={10.3} width={2} height={3.4} rx={0.6} {...common} />
          <Path
            d="M12 9.3 9 13h2.3l-.8 3.7L14 12.8h-2.3l.3-3.5Z"
            fill={color}
            stroke="none"
          />
        </>
      )}
      {name === 'fuel' && (
        <Path
          {...common}
          d="M6 20V6.5a1.5 1.5 0 0 1 1.5-1.5h4A1.5 1.5 0 0 1 13 6.5V20M5 20h9M13 10h1.6L17 12.4V17a1.4 1.4 0 0 1-2.8 0v-1.7"
        />
      )}
      {name === 'shield' && (
        <Path
          {...common}
          d="M12 3.3 18.5 6v5.2c0 4.3-2.8 7-6.5 8.5-3.7-1.5-6.5-4.2-6.5-8.5V6L12 3.3ZM12 8.3v4.4M12 15.7h.01"
        />
      )}
      {name === 'card' && (
        <Path
          {...common}
          d="M3 6.3h18v12H3v-12ZM3 10.3h18M6.5 15h3.5M15 14l3 3M18 14l-3 3"
        />
      )}
      {name === 'clock' && (
        <>
          <Circle cx={12} cy={12} r={7.7} {...common} />
          <Path {...common} d="M12 8v4.3l3 2" />
        </>
      )}
      {name === 'chat' && (
        <Path
          {...common}
          d="M4 5.5h16v10.5H9l-4 3.2V5.5Z"
        />
      )}
      {name === 'paperclip' && (
        <Path
          {...common}
          d="M8.3 12.8 15 6.1a3.3 3.3 0 0 1 4.7 4.7L11.4 19a4.7 4.7 0 0 1-6.6-6.6L13 4.2"
        />
      )}
      {name === 'ticket' && (
        <Path
          {...common}
          d="M4 9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1.6a1.7 1.7 0 0 0 0 3.4V16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1.6a1.7 1.7 0 0 0 0-3.4V9Z"
        />
      )}
      {name === 'chevronDown' && <Path {...common} d="M5 8.5l7 7 7-7" />}
      {name === 'closeCircle' && (
        <>
          <Circle cx={12} cy={12} r={9} {...common} />
          <Path {...common} d="M9 9l6 6M15 9l-6 6" />
        </>
      )}
    </Svg>
  );
};

export default HelpIcon;
