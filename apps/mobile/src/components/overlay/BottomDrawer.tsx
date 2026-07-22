import { useEffect, useRef, type ReactNode } from 'react'
import {
  Animated,
  BackHandler,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle
} from 'react-native'
import { theme } from '../../design/theme'

export interface BottomDrawerProps {
  visible: boolean
  children: ReactNode
  onRequestClose?: () => void
  showBackdrop?: boolean
  dismissOnBackdropPress?: boolean
  accessibilityLabel?: string
  panelStyle?: StyleProp<ViewStyle>
  testID?: string
}

export function BottomDrawer({
  visible,
  children,
  onRequestClose,
  showBackdrop = true,
  dismissOnBackdropPress = true,
  accessibilityLabel = '底部抽屉',
  panelStyle,
  testID
}: BottomDrawerProps) {
  const { height } = useWindowDimensions()
  const progress = useRef(new Animated.Value(visible ? 1 : 0)).current

  useEffect(() => {
    Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: theme.duration.normal,
      useNativeDriver: true
    }).start()
  }, [progress, visible])

  useEffect(() => {
    if (!visible || !onRequestClose) return
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onRequestClose()
      return true
    })
    return () => subscription.remove()
  }, [onRequestClose, visible])

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [height, 0] })

  return (
    <Animated.View
      accessibilityElementsHidden={!visible}
      importantForAccessibility={visible ? 'yes' : 'no-hide-descendants'}
      pointerEvents={visible ? 'box-none' : 'none'}
      style={styles.root}
      testID={testID}
    >
      {showBackdrop && (
        <Animated.View style={[styles.backdrop, { opacity: progress }]}>
          <Pressable
            accessibilityLabel="关闭抽屉"
            disabled={!dismissOnBackdropPress}
            style={StyleSheet.absoluteFill}
            onPress={onRequestClose}
          />
        </Animated.View>
      )}
      <Animated.View
        accessibilityLabel={accessibilityLabel}
        accessibilityViewIsModal={showBackdrop}
        style={[styles.panel, panelStyle, { transform: [{ translateY }] }]}
      >
        {children}
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, zIndex: theme.zIndex.floating },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: theme.color.backdrop },
  panel: { position: 'absolute', left: 0, right: 0, bottom: 0 }
})
