import { useCallback } from 'react'
import {
  ActivityIndicator,
  SectionList,
  StyleSheet,
  Text,
  View,
  type SectionListProps
} from 'react-native'
import { theme } from '../../design/theme'

interface ScrollListProps<
  ItemT,
  SectionT extends object = Record<string, unknown>
> extends Omit<
    SectionListProps<ItemT, SectionT>,
    'ListFooterComponent' | 'onEndReached'
  > {
  hasMore?: boolean
  isLoadingMore?: boolean
  loadingText?: string
  onLoadMore?: () => void
}

/**
 * 纯 UI 滚动列表。
 * 数据分页、请求与合并由业务层处理，组件仅负责触底通知和加载反馈。
 */
export function ScrollList<
  ItemT,
  SectionT extends object = Record<string, unknown>
>({
  hasMore = false,
  isLoadingMore = false,
  loadingText = '正在为您努力加载...',
  onLoadMore,
  onEndReachedThreshold = 0.08,
  style,
  ...listProps
}: ScrollListProps<ItemT, SectionT>) {
  const handleEndReached = useCallback(() => {
    if (!hasMore || isLoadingMore) return
    onLoadMore?.()
  }, [hasMore, isLoadingMore, onLoadMore])

  return (
    <SectionList<ItemT, SectionT>
      {...listProps}
      style={[styles.container, style]}
      onEndReached={handleEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      ListFooterComponent={
        isLoadingMore ? (
          <View
            accessible
            accessibilityLabel={loadingText}
            accessibilityLiveRegion="polite"
            style={styles.loading}
          >
            <ActivityIndicator color={theme.color.brand} size="small" />
            <Text style={styles.loadingText}>{loadingText}</Text>
          </View>
        ) : null
      }
    />
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
    paddingVertical: theme.spacing[5]
  },
  loadingText: {
    color: theme.color.textTertiary,
    fontFamily: theme.typography.fontFamily.ui,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: 0.24
  }
})
