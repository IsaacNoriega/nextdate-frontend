import React from 'react';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';

export interface IconProps {
  size?: number;
  color?: string;
  fill?: string;
  strokeWidth?: number;
  style?: any;
}

export const HeartIcon: React.FC<IconProps> = ({
  size = 20,
  color = '#000000',
  fill = 'none',
  strokeWidth = 2,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={strokeWidth} style={style}>
    <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </Svg>
);

export const StarIcon: React.FC<IconProps> = ({
  size = 16,
  color = '#FFD700',
  fill = '#FFD700',
  strokeWidth = 1,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={strokeWidth} style={style}>
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </Svg>
);

export const MapPinIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#000000',
  fill = 'none',
  strokeWidth = 2,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={strokeWidth} style={style}>
    <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <Circle cx="12" cy="10" r="3" />
  </Svg>
);

export const SearchIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#000000',
  fill = 'none',
  strokeWidth = 2,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={strokeWidth} style={style}>
    <Path d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" />
  </Svg>
);

export const CloseIcon: React.FC<IconProps> = ({
  size = 16,
  color = '#000000',
  fill = 'none',
  strokeWidth = 2,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={strokeWidth} style={style}>
    <Path d="M18 6L6 18M6 6l12 12" />
  </Svg>
);

export const BookmarkIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#000000',
  fill = 'none',
  strokeWidth = 2,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={strokeWidth} style={style}>
    <Path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </Svg>
);

export const PlusIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#000000',
  fill = 'none',
  strokeWidth = 2,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={strokeWidth} style={style}>
    <Path d="M12 5v14M5 12h14" />
  </Svg>
);

export const WandIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#000000',
  fill = 'none',
  strokeWidth = 2,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={strokeWidth} style={style}>
    <Path d="M15 4V2m0 16v-2m8-8h-2M6 10H4m14.5-5.5l-1.5 1.5m-9 9l-1.5 1.5m12 0l-1.5-1.5m-9-9l-1.5-1.5" />
    <Path d="M9 15L2 22" />
    <Path d="M14 10l7.5-7.5" />
  </Svg>
);

export const UtensilsIcon: React.FC<IconProps> = ({
  size = 16,
  color = '#000000',
  fill = 'none',
  strokeWidth = 2,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={strokeWidth} style={style}>
    <Path d="M18 2v8a2 2 0 0 1-2 2h-1v10h-2V12h-1a2 2 0 0 1-2-2V2" />
    <Path d="M11 2v4" />
    <Path d="M15 2v4" />
    <Path d="M5 2v20" />
    <Path d="M2 5a3 3 0 0 0 6 0V2H2v3z" />
  </Svg>
);

export const TreeIcon: React.FC<IconProps> = ({
  size = 16,
  color = '#000000',
  fill = 'none',
  strokeWidth = 2,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={strokeWidth} style={style}>
    <Path d="M12 19V22" />
    <Path d="M12 2L5 12h3l-4 7h16l-4-7h3L12 2z" />
  </Svg>
);

export const TheaterIcon: React.FC<IconProps> = ({
  size = 16,
  color = '#000000',
  fill = 'none',
  strokeWidth = 2,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={strokeWidth} style={style}>
    <Path d="M2 10s3-3 10-3 10 3 10 3-1 8-10 8-10-8-10-8z" />
    <Circle cx="9" cy="11" r="1.5" />
    <Circle cx="15" cy="11" r="1.5" />
    <Path d="M10 14c.5.5 1.5.5 2 0" />
  </Svg>
);

export const CompassIcon: React.FC<IconProps> = ({
  size = 20,
  color = '#000000',
  fill = 'none',
  strokeWidth = 2,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={strokeWidth} style={style}>
    <Circle cx="12" cy="12" r="10" />
    <Path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
  </Svg>
);

export const SparklesIcon: React.FC<IconProps> = ({
  size = 16,
  color = '#000000',
  fill = 'none',
  strokeWidth = 2,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={strokeWidth} style={style}>
    <Path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
  </Svg>
);

export const FilterIcon: React.FC<IconProps> = ({
  size = 16,
  color = '#000000',
  fill = 'none',
  strokeWidth = 2,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={strokeWidth} style={style}>
    <Path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
  </Svg>
);

export const CheckIcon: React.FC<IconProps> = ({
  size = 16,
  color = '#000000',
  fill = 'none',
  strokeWidth = 2,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={strokeWidth} style={style}>
    <Path d="M20 6L9 17l-5-5" />
  </Svg>
);

export const RefreshIcon: React.FC<IconProps> = ({
  size = 16,
  color = '#000000',
  fill = 'none',
  strokeWidth = 2,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={strokeWidth} style={style}>
    <Path d="M23 4v6h-6" />
    <Path d="M1 20v-6h6" />
    <Path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </Svg>
);

export const MessageSquareIcon: React.FC<IconProps> = ({
  size = 16,
  color = '#000000',
  fill = 'none',
  strokeWidth = 2,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={strokeWidth} style={style}>
    <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </Svg>
);

export const TagIcon: React.FC<IconProps> = ({
  size = 14,
  color = '#000000',
  fill = 'none',
  strokeWidth = 2,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={strokeWidth} style={style}>
    <Path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <Circle cx="7" cy="7" r="1.5" />
  </Svg>
);

export const CameraIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#000000',
  fill = 'none',
  strokeWidth = 2,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={strokeWidth} style={style}>
    <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <Circle cx="12" cy="13" r="4" />
  </Svg>
);

export const PhotoIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#000000',
  fill = 'none',
  strokeWidth = 2,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={strokeWidth} style={style}>
    <Rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <Circle cx="8.5" cy="8.5" r="1.5" />
    <Path d="M21 15l-5-5L5 21" />
  </Svg>
);

export const UploadIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#000000',
  fill = 'none',
  strokeWidth = 2,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={strokeWidth} style={style}>
    <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <Path d="M17 8l-5-5-5 5" />
    <Path d="M12 3v12" />
  </Svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({
  size = 16,
  color = '#000000',
  strokeWidth = 2,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} style={style}>
    <Path d="M6 9l6 6 6-6" />
  </Svg>
);

export const ChevronRightIcon: React.FC<IconProps> = ({
  size = 16,
  color = '#000000',
  strokeWidth = 2,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} style={style}>
    <Path d="M9 18l6-6-6-6" />
  </Svg>
);

