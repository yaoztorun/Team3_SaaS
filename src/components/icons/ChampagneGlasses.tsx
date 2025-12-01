import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ChampagneGlassesProps {
    size?: number;
    color?: string;
}

export const ChampagneGlasses: React.FC<ChampagneGlassesProps> = ({ 
    size = 24, 
    color = '#000' 
}) => {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Left glass */}
            <Path
                d="M6 2L4 8C4 9.5 5 10.5 6 11V14C6 14.5 5.5 15 5 15H4V16H8V15H7C6.5 15 6 14.5 6 14V11C7 10.5 8 9.5 8 8L6 2Z"
                stroke={color}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
            {/* Right glass */}
            <Path
                d="M18 2L16 8C16 9.5 17 10.5 18 11V14C18 14.5 17.5 15 17 15H16V16H20V15H19C18.5 15 18 14.5 18 14V11C19 10.5 20 9.5 20 8L18 2Z"
                stroke={color}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
            {/* Celebration sparkles/bubbles */}
            <Path
                d="M10 6L11 4M13 6L14 4M11.5 8.5L12.5 7"
                stroke={color}
                strokeWidth={1.5}
                strokeLinecap="round"
            />
            {/* Glasses clinking point */}
            <Path
                d="M8 8L10 6L14 6L16 8"
                stroke={color}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
};
