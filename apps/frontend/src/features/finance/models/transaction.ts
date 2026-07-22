export type FinanceType = 'income' | 'expense'

export interface FinanceCategory {
  id: string
  name: string
  glyph: string
  type: FinanceType
}

export interface LocalTransaction {
  id: string
  type: FinanceType
  amountCent: number
  categoryId: string
  categoryName: string
  categoryGlyph: string
  occurredAt: string
  remark: string
  createdAt: string
}

export const FINANCE_CATEGORIES: FinanceCategory[] = [
  { id: 'food', name: '餐饮', glyph: '餐', type: 'expense' },
  { id: 'transport', name: '交通', glyph: '行', type: 'expense' },
  { id: 'shopping', name: '购物', glyph: '购', type: 'expense' },
  { id: 'home', name: '居家', glyph: '居', type: 'expense' },
  { id: 'salary', name: '工资', glyph: '薪', type: 'income' },
  { id: 'part-time', name: '兼职', glyph: '兼', type: 'income' },
  { id: 'bonus', name: '奖金', glyph: '奖', type: 'income' },
  { id: 'other-income', name: '其他', glyph: '其', type: 'income' }
]

export function formatMoney(amountCent: number, withSign = false) {
  const prefix = withSign && amountCent > 0 ? '+' : ''
  const [integer = '0', decimal = '00'] = (amountCent / 100).toFixed(2).split('.')
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `${prefix}${grouped}.${decimal}`
}
