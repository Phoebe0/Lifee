import { useEffect, useRef, useState } from 'react'
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleSheet,
  View
} from 'react-native'
import { theme } from '../../../design/theme'

export function AuthBackground() {
  const flow = useRef(new Animated.Value(0)).current
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion)
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion)
    return () => subscription.remove()
  }, [])

  useEffect(() => {
    if (reduceMotion) {
      flow.stopAnimation()
      flow.setValue(0)
      return
    }

    // 只让背景光团做低频运动，既体现“现金流”概念，也避免干扰表单输入。
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(flow, {
          toValue: 1,
          duration: 7000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        }),
        Animated.timing(flow, {
          toValue: 0,
          duration: 7000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        })
      ])
    )
    animation.start()
    return () => animation.stop()
  }, [flow, reduceMotion])

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={styles.base} />
      <Animated.View
        style={[
          styles.orb,
          styles.orbPrimary,
          {
            transform: [
              { translateX: flow.interpolate({ inputRange: [0, 1], outputRange: [-12, 34] }) },
              { translateY: flow.interpolate({ inputRange: [0, 1], outputRange: [-18, 30] }) },
              { scale: flow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) }
            ]
          }
        ]}
      />
      <Animated.View
        style={[
          styles.orb,
          styles.orbAccent,
          {
            transform: [
              { translateX: flow.interpolate({ inputRange: [0, 1], outputRange: [18, -28] }) },
              { translateY: flow.interpolate({ inputRange: [0, 1], outputRange: [22, -20] }) }
            ]
          }
        ]}
      />
      <View style={styles.flowRing}>
        <View style={[styles.flowDot, styles.flowDotStart]} />
        <View style={[styles.flowDot, styles.flowDotEnd]} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.color.background
  },
  orb: {
    position: 'absolute',
    borderRadius: theme.radius.full
  },
  orbPrimary: {
    top: -80,
    right: -80,
    width: 280,
    height: 280,
    backgroundColor: theme.auth.brandGlow
  },
  orbAccent: {
    bottom: 80,
    left: -120,
    width: 300,
    height: 300,
    backgroundColor: theme.auth.accentGlow
  },
  flowRing: {
    position: 'absolute',
    top: 88,
    right: -86,
    width: 250,
    height: 250,
    borderWidth: 1,
    borderColor: theme.auth.flowRing,
    borderRadius: theme.radius.full,
    transform: [{ rotate: '-18deg' }]
  },
  flowDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: theme.color.brand,
    borderRadius: theme.radius.full
  },
  flowDotStart: { top: 24, left: 42 },
  flowDotEnd: { right: 12, bottom: 72, backgroundColor: theme.color.accent }
})
