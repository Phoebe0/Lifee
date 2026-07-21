import { IsEnum, IsInt, IsISO8601, IsOptional, IsString, MaxLength, Min } from 'class-validator'

export enum TransactionType {
  Income = 'income',
  Expense = 'expense'
}

export class CreateTransactionDto {
  @IsEnum(TransactionType)
  type!: TransactionType

  @IsInt()
  @Min(1)
  amountCent!: number

  @IsString()
  categoryId!: string

  @IsISO8601()
  occurredAt!: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  remark?: string
}
