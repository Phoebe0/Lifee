import { useRef, type ReactNode } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import Swipeable from 'react-native-gesture-handler/Swipeable'
import { theme } from '../../design/theme'

export interface SwipeRowAction {
  key: string
  accessibilityLabel: string
  icon: ReactNode
  backgroundColor: string
  onPress: () => void
  disabled?: boolean
}

export interface SwipeActionRowProps {
  children: ReactNode
  actions: SwipeRowAction[]
  actionWidth?: number
  borderRadius?: number
}

export function SwipeActionRow({
  children,
  actions,
  actionWidth = 72,
  borderRadius = theme.radius.md
}: SwipeActionRowProps) {
  const swipeableRef = useRef<Swipeable>(null)

  return (
    <View style={[styles.clip, { borderRadius }]}>
      <Swipeable
        ref={swipeableRef}
        dragOffsetFromRightEdge={12}
        friction={2}
        overshootRight={false}
        rightThreshold={36}
        renderRightActions={() => (
          <View style={styles.actions}>
            {actions.map(action => (
              <Pressable
                key={action.key}
                accessibilityRole="button"
                accessibilityLabel={action.accessibilityLabel}
                disabled={action.disabled}
                style={({ pressed }) => [
                  styles.action,
                  { width: actionWidth, backgroundColor: action.backgroundColor },
                  action.disabled && styles.disabled,
                  pressed && styles.pressed
                ]}
                onPress={() => {
                  swipeableRef.current?.close()
                  action.onPress()
                }}
              >
                {action.icon}
              </Pressable>
            ))}
          </View>
        )}
      >
        {children}
      </Swipeable>
    </View>
  )
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden', borderRadius: theme.radius.md },
  actions: { flexDirection: 'row' },
  action: { minHeight: 72, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: theme.opacity.disabled },
  pressed: { opacity: theme.opacity.pressed }
})
