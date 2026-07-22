import Svg, { Defs, LinearGradient, Stop, Rect, Path } from 'react-native-svg';

type LogoMarkProps = {
    size?: number;
};

export default function LogoMark({ size = 96 }: LogoMarkProps) {
    return (
        <Svg width={size} height={size} viewBox="0 0 200 200">
            <Defs>
                <LinearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#2DD4BF" />
                    <Stop offset="100%" stopColor="#1B4FD8" />
                </LinearGradient>
                <LinearGradient id="lGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#2DD4BF" />
                    <Stop offset="100%" stopColor="#1B4FD8" />
                </LinearGradient>
                <LinearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#2DD4BF" stopOpacity={0.35} />
                    <Stop offset="100%" stopColor="#2DD4BF" stopOpacity={0} />
                </LinearGradient>
            </Defs>

            <Rect
                x="50" y="40" width="100" height="130" rx="16"
                fill="none" stroke="#2A4470" strokeWidth="3"
                transform="rotate(-10 100 100)"
            />

            <Rect
                x="58" y="42" width="100" height="130" rx="16"
                fill="#132240" stroke="url(#edgeGrad)" strokeWidth="3"
            />

            <Path d="M 58 90 L 158 55 L 158 90 L 58 125 Z" fill="url(#beamGrad)" />

            <Path d="M 138 42 L 158 42 L 158 62 Z" fill="url(#edgeGrad)" />

            <Rect x="80" y="78" width="14" height="58" rx="7" fill="url(#lGrad)" />
            <Rect x="80" y="122" width="46" height="14" rx="7" fill="url(#lGrad)" />
        </Svg>
    );
}