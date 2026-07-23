import Svg, { Circle, Path } from 'react-native-svg'

interface IconProps {
  color: string
  size?: number
}

export function PhoneIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7.1 3.5 9.4 8l-2.2 1.8c1.2 2.8 3.2 4.8 6 6l1.8-2.2 4.5 2.3-.8 3.6c-.2.8-.9 1.4-1.8 1.4C9.3 20.9 3.1 14.7 3.1 7.1c0-.9.6-1.6 1.4-1.8l2.6-.8Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export function MailIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 6.5h16v11H4z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="m4.7 7.2 7.3 5.6 7.3-5.6" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

export function WechatIcon({ color, size = 25 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <Path d="M3 11.2c0-4.2 4-7.6 8.9-7.6s8.9 3.4 8.9 7.6-4 7.6-8.9 7.6c-1 0-2-.1-2.9-.4l-3.7 2 .9-3.5C4.2 15.5 3 13.5 3 11.2Z" fill={color} />
      <Path d="M12.2 17.1c0-3.5 3.3-6.3 7.4-6.3s7.4 2.8 7.4 6.3c0 1.9-1 3.7-2.7 4.8l.7 2.9-3.1-1.7c-.7.2-1.5.3-2.3.3-4.1 0-7.4-2.8-7.4-6.3Z" fill={color} stroke="#F8F9FF" strokeWidth={1.1} />
      <Circle cx={8.8} cy={9.8} r={1} fill="#F8F9FF" />
      <Circle cx={14.6} cy={9.8} r={1} fill="#F8F9FF" />
      <Circle cx={17.2} cy={16.1} r={0.9} fill="#F8F9FF" />
      <Circle cx={22.1} cy={16.1} r={0.9} fill="#F8F9FF" />
    </Svg>
  )
}

export function GitHubIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.49v-1.9c-2.78.62-3.37-1.2-3.37-1.2-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.34 1.12 2.91.86.09-.66.35-1.12.64-1.38-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.36 9.36 0 0 1 12 6.96c.85 0 1.69.12 2.49.34 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.35 4.8-4.58 5.05.36.32.68.95.68 1.92v2.76c0 .27.18.59.69.49A10.22 10.22 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z" />
    </Svg>
  )
}
