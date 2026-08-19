export const categories = ['Food', 'Shopping', 'Transport', 'Bills', 'Entertainment', 'Education', 'Salary', 'Other']

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${date}T12:00:00`))
}

export function getCategoryTotals(transactions) {
  return transactions.filter((item) => item.type === 'expense').reduce((totals, item) => ({ ...totals, [item.category]: (totals[item.category] || 0) + item.amount }), {})
}
