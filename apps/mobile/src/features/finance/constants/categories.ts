import type { ComponentType } from 'react'
import type { SvgProps } from 'react-native-svg'
import BonusIcon from '../../../../assets/icons/transaction/bonus.svg'
import EducationIcon from '../../../../assets/icons/transaction/education.svg'
import EntertainmentIcon from '../../../../assets/icons/transaction/entertainment.svg'
import FoodIcon from '../../../../assets/icons/transaction/food.svg'
import HomeIcon from '../../../../assets/icons/transaction/home.svg'
import InvestmentIcon from '../../../../assets/icons/transaction/investment.svg'
import MedicalIcon from '../../../../assets/icons/transaction/medical.svg'
import MoreIcon from '../../../../assets/icons/transaction/more.svg'
import PartTimeIcon from '../../../../assets/icons/transaction/part-time.svg'
import RedPacketIcon from '../../../../assets/icons/transaction/red-packet.svg'
import RefundIcon from '../../../../assets/icons/transaction/refund.svg'
import ReimbursementIcon from '../../../../assets/icons/transaction/reimbursement.svg'
import SalaryIcon from '../../../../assets/icons/transaction/salary.svg'
import ShoppingIcon from '../../../../assets/icons/transaction/shopping.svg'
import TransportIcon from '../../../../assets/icons/transaction/transport.svg'
import type { TransactionType } from '../models/transaction'

export interface TransactionCategory {
  id: string
  name: string
  type: TransactionType
  icon: ComponentType<SvgProps>
}

export const transactionCategories: Record<TransactionType, TransactionCategory[]> = {
  expense: [
    { id: 'default-expense-food', name: '餐饮', type: 'expense', icon: FoodIcon },
    { id: 'default-expense-shopping', name: '购物', type: 'expense', icon: ShoppingIcon },
    { id: 'default-expense-transport', name: '交通', type: 'expense', icon: TransportIcon },
    { id: 'default-expense-home', name: '居住', type: 'expense', icon: HomeIcon },
    { id: 'default-expense-entertainment', name: '娱乐', type: 'expense', icon: EntertainmentIcon },
    { id: 'default-expense-medical', name: '医疗', type: 'expense', icon: MedicalIcon },
    { id: 'default-expense-education', name: '教育', type: 'expense', icon: EducationIcon },
    { id: 'default-expense-other', name: '其他', type: 'expense', icon: MoreIcon }
  ],
  income: [
    { id: 'default-income-salary', name: '工资', type: 'income', icon: SalaryIcon },
    { id: 'default-income-bonus', name: '奖金', type: 'income', icon: BonusIcon },
    { id: 'default-income-investment', name: '理财', type: 'income', icon: InvestmentIcon },
    { id: 'default-income-part-time', name: '兼职', type: 'income', icon: PartTimeIcon },
    { id: 'default-income-red-packet', name: '红包', type: 'income', icon: RedPacketIcon },
    { id: 'default-income-reimbursement', name: '报销', type: 'income', icon: ReimbursementIcon },
    { id: 'default-income-refund', name: '退款', type: 'income', icon: RefundIcon },
    { id: 'default-income-other', name: '其他', type: 'income', icon: MoreIcon }
  ]
}
