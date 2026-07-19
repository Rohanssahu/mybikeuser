import React, {memo} from 'react';
import Svg, {Circle, G, Path} from 'react-native-svg';

interface SupportIllustrationProps {
  size?: number;
}

// Abstract badge: concentric tonal rings behind a yellow disc with the
// wrench glyph — decorative header art, kept as one inline SVG (no new
// asset file needed) so it scales cleanly on any screen density.
const SupportIllustration: React.FC<SupportIllustrationProps> = ({
  size = 52,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 52 52">
      <Circle cx={26} cy={26} r={25} fill="#ffffff" fillOpacity={0.06} />
      <Circle cx={26} cy={26} r={18} fill="#ffffff" fillOpacity={0.08} />
      <Circle cx={26} cy={26} r={13} fill="#FED428" />
      <G transform="translate(18,18) scale(0.667)">
        <Path
          d="M14.5 6a4 4 0 0 0-5 5L4.8 15.7a1.8 1.8 0 0 0 2.5 2.5L12 13.5a4 4 0 0 0 5-5l-2.4 2.4-2-2Z"
          stroke="#081041"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </G>
    </Svg>
  );
};

export default memo(SupportIllustration);
