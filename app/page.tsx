'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BrowserRouter, Link, MemoryRouter, NavLink, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowDownRight, ArrowUpRight, BarChart3, Bell, ChevronRight, CircleDollarSign, CreditCard, FileText, Filter, LayoutDashboard, LogOut, Menu, MoreHorizontal, Pencil, Plus, Search, Settings, ShieldCheck, Sparkles, Target, Trash2, TrendingDown, TrendingUp, UserRound, Wallet, X } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { categories, formatCurrency, formatDate, getCategoryTotals } from '../utils/finance'

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: FileText },
  { to: '/budgets', label: 'Budgets', icon: Target },
  { to: '/insights', label: 'Insights', icon: BarChart3 },
]

const defaultBudgets = [
  { id: 'food', category: 'Food', limit: 5000 },
  { id: 'shopping', category: 'Shopping', limit: 5000 },
  { id: 'transport', category: 'Transport', limit: 3000 },
  { id: 'entertainment', category: 'Entertainment', limit: 3000 },
]

function IconBadge({ category, type }) {
  const icons = { Food: 'F', Shopping: 'S', Transport: 'T', Bills: 'B', Entertainment: 'E', Education: 'E', Salary: '₹', Other: 'O' }
  return <span className={`icon-badge ${type === 'income' ? 'income' : category.toLowerCase()}`} aria-hidden="true">{type === 'income' ? <ArrowUpRight size={17} /> : icons[category] || 'O'}</span>
}

function Button({ children, variant = 'primary', onClick, type = 'button', className = '', disabled = false }) {
  return <button type={type} onClick={onClick} disabled={disabled} className={`button button-${variant} ${className}`}>{children}</button>
}

function SummaryCard({ title, value, icon, tone, note }) {
  return <article className="summary-card"><div className="summary-top"><span className={`summary-icon ${tone}`}>{icon}</span><span className="summary-note">{note}</span></div><p className="eyebrow">{title}</p><strong className="summary-value">{value}</strong></article>
}

function ProgressBar({ value, tone = 'primary' }) {
  return <div className="progress-track"><span className={`progress-fill ${tone}`} style={{ width: `${Math.min(value, 100)}%` }} /></div>
}

function TransactionRow({ transaction, onDelete, onEdit }) {
  return <article className="transaction-row"><div className="transaction-main"><IconBadge category={transaction.category} type={transaction.type} /><div><Link to={`/transactions/${transaction.id}`} className="transaction-name">{transaction.name}</Link><p>{transaction.description || transaction.category}</p></div></div><span className="transaction-category">{transaction.category}</span><span className="transaction-date">{formatDate(transaction.date)}</span><span className={`transaction-amount ${transaction.type}`}>{transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}</span><div className="row-actions"><button aria-label={`Edit ${transaction.name}`} onClick={() => onEdit(transaction)}><Pencil size={15} /></button><button aria-label={`Delete ${transaction.name}`} onClick={() => onDelete(transaction.id)}><Trash2 size={15} /></button></div></article>
}

function PageHeader({ title, subtitle, action }) {
  return <div className="page-header"><div><h1>{title}</h1><p>{subtitle}</p></div>{action}</div>
}

function Sidebar({ onLogout, onClose }) {
  return <aside className="sidebar"><div className="brand"><span className="brand-mark"><Wallet size={20} /></span><span>Fin<span>Track</span></span><button className="mobile-close" onClick={onClose} aria-label="Close menu"><X size={18} /></button></div><div className="workspace"><span className="avatar">TS</span><div><strong>Tushar Singh</strong><span>Personal account</span></div><ChevronRight size={15} /></div><nav className="side-nav" aria-label="Primary navigation"><p className="nav-label">Workspace</p>{navItems.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} onClick={onClose} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}><Icon size={18} /><span>{label}</span></NavLink>)}<p className="nav-label settings-label">Account</p><NavLink to="/profile" onClick={onClose} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}><UserRound size={18} /><span>Profile</span></NavLink><NavLink to="/settings" onClick={onClose} className="nav-item"><Settings size={18} /><span>Settings</span></NavLink></nav><div className="sidebar-bottom"><div className="upgrade-card"><Sparkles size={18} /><strong>Build better habits</strong><p>See your month at a glance.</p><Link to="/insights" onClick={onClose}>View insights <ArrowUpRight size={13} /></Link></div><button className="logout-button" onClick={onLogout}><LogOut size={17} /> Sign out</button></div></aside>
}

function Topbar({ onMenu }) {
  const location = useLocation()
  const current = navItems.find((item) => location.pathname.startsWith(item.to))
  return <header className="topbar"><button className="menu-button" onClick={onMenu} aria-label="Open menu"><Menu size={20} /></button><div className="breadcrumb"><span>Workspace</span><ChevronRight size={14} /><strong>{current?.label || (location.pathname === '/profile' ? 'Profile' : 'FinTrack')}</strong></div><div className="top-actions"><button className="icon-button" aria-label="Notifications"><Bell size={18} /><span className="notification-dot" /></button><div className="top-avatar">TS</div></div></header>
}

function ProtectedRoute({ isLoggedIn, children }) {
  return isLoggedIn ? children : <Navigate to="/login" replace />
}

function Layout({ onLogout, children }) {
  const [menuOpen, setMenuOpen] = useState(false)
  return <div className="app-shell"><div className={`sidebar-wrap ${menuOpen ? 'open' : ''}`}><Sidebar onLogout={onLogout} onClose={() => setMenuOpen(false)} /></div>{menuOpen && <button className="sidebar-overlay" onClick={() => setMenuOpen(false)} aria-label="Close navigation" /> }<div className="content-shell"><Topbar onMenu={() => setMenuOpen(true)} /><main className="main-content">{children}</main></div></div>
}

function Dashboard({ transactions, totals }) {
  const recent = transactions.slice(0, 5)
  const max = Math.max(totals.income, totals.expenses, 1)
  const categoryTotals = useMemo(() => getCategoryTotals(transactions), [transactions])
  const highest = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]
  return <div className="page-stack"><PageHeader title="Good morning, Tushar" subtitle="Here's your financial overview." action={<Link to="/add-transaction" className="button button-primary"><Plus size={17} /> Add transaction</Link>} /><section className="summary-grid"><SummaryCard title="Total balance" value={formatCurrency(totals.balance)} icon={<Wallet size={19} />} tone="blue" note="All time" /><SummaryCard title="Total income" value={formatCurrency(totals.income)} icon={<ArrowUpRight size={19} />} tone="green" note="This month" /><SummaryCard title="Total expenses" value={formatCurrency(totals.expenses)} icon={<ArrowDownRight size={19} />} tone="orange" note="This month" /><SummaryCard title="Savings rate" value={`${totals.income ? Math.round((totals.balance / totals.income) * 100) : 0}%`} icon={<TrendingUp size={19} />} tone="purple" note="Great progress" /></section><section className="dashboard-grid"><article className="panel overview-panel"><div className="panel-heading"><div><h2>Financial overview</h2><p>Income vs expenses across your activity</p></div><select aria-label="Time period"><option>This month</option><option>Last month</option></select></div><div className="legend"><span><i className="legend-dot income-dot" />Income</span><span><i className="legend-dot expense-dot" />Expenses</span></div><div className="bar-chart" aria-label="Income and expenses chart"><div className="chart-y"><span>₹60k</span><span>₹40k</span><span>₹20k</span><span>₹0</span></div><div className="chart-bars">{['May', 'Jun', 'Jul', 'Aug'].map((month, index) => <div className="chart-column" key={month}><div className="bars"><span className="bar income-bar" style={{ height: `${[58, 72, 51, Math.min(88, (totals.income / max) * 88)][index]}%` }} /><span className="bar expense-bar" style={{ height: `${[31, 42, 36, Math.min(61, (totals.expenses / max) * 100)][index]}%` }} /></div><small>{month}</small></div>)}</div></div></article><article className="panel spending-panel"><div className="panel-heading"><div><h2>Spending by category</h2><p>Where your money goes</p></div><Link to="/insights" className="text-link">See all <ArrowUpRight size={14} /></Link></div><div className="donut-wrap"><div className="donut"><div className="donut-center"><strong>{formatCurrency(totals.expenses)}</strong><span>expenses</span></div></div></div><div className="category-legend">{Object.entries(categoryTotals).slice(0, 4).map(([category, amount], index) => <div key={category}><span><i className={`legend-dot category-${index}`} />{category}</span><strong>{Math.round((amount / (totals.expenses || 1)) * 100)}%</strong></div>)}</div>{highest && <div className="insight-callout"><Sparkles size={16} /><span><strong>{highest[0]}</strong> is your top category this month.</span></div>}</article></section><section className="panel transactions-panel"><div className="panel-heading"><div><h2>Recent transactions</h2><p>Your latest income and expenses</p></div><Link to="/transactions" className="text-link">View all <ArrowUpRight size={14} /></Link></div><div className="transaction-list">{recent.length ? recent.map((transaction) => <TransactionRow key={transaction.id} transaction={transaction} onDelete={() => {}} onEdit={() => {}} />) : <EmptyState />}</div></section></div>
}

function EmptyState() { return <div className="empty-state"><CircleDollarSign size={30} /><h3>No transactions yet</h3><p>Add your first transaction to start tracking your finances.</p><Link className="button button-primary" to="/add-transaction"><Plus size={16} /> Add transaction</Link></div> }

function Transactions({ transactions, onDelete, onEdit }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All categories')
  const [type, setType] = useState('All types')
  const [sort, setSort] = useState('newest')
  const filtered = useMemo(() => transactions.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()) && (category === 'All categories' || item.category === category) && (type === 'All types' || item.type === type)).sort((a, b) => sort === 'newest' ? new Date(b.date) - new Date(a.date) : b.amount - a.amount), [transactions, search, category, type, sort])
  return <div className="page-stack"><PageHeader title="Transactions" subtitle="Track where your money comes from and where it goes." action={<Link to="/add-transaction" className="button button-primary"><Plus size={17} /> Add transaction</Link>} /><section className="panel filters-panel"><div className="search-box"><Search size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search transactions" aria-label="Search transactions" /></div><div className="filter-selects"><select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category"><option>All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select><select value={type} onChange={(e) => setType(e.target.value)} aria-label="Filter by type"><option>All types</option><option value="income">Income</option><option value="expense">Expense</option></select><select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort transactions"><option value="newest">Newest first</option><option value="amount">Highest amount</option></select></div><span className="filter-count"><Filter size={15} /> {filtered.length} results</span></section><section className="panel transactions-panel"><div className="transaction-list table-list"><div className="transaction-head"><span>Transaction</span><span>Category</span><span>Date</span><span>Amount</span><span>Actions</span></div>{filtered.length ? filtered.map((transaction) => <TransactionRow key={transaction.id} transaction={transaction} onDelete={onDelete} onEdit={onEdit} />) : <EmptyState />}</div></section></div>
}

function AddTransaction({ onAdd, editing, onCancel }) {
  const nameRef = useRef(null)
  const [form, setForm] = useState(editing || { name: '', amount: '', type: 'expense', category: 'Food', date: new Date().toISOString().slice(0, 10), description: '' })
  const [error, setError] = useState('')
  useEffect(() => { nameRef.current?.focus() }, [])
  const submit = (event) => { event.preventDefault(); if (!form.name.trim() || !form.amount || Number(form.amount) <= 0 || !form.date) return setError('Please complete the name, amount, and date with valid values.'); onAdd({ ...form, amount: Number(form.amount), id: editing?.id || crypto.randomUUID() }); setForm({ name: '', amount: '', type: 'expense', category: 'Food', date: new Date().toISOString().slice(0, 10), description: '' }); }
  return <div className="page-stack narrow-page"><PageHeader title={editing ? 'Edit transaction' : 'Add transaction'} subtitle={editing ? 'Update the details of this transaction.' : 'Capture a new income or expense in your account.'} /><form className="panel form-panel" onSubmit={submit}><div className="form-section-title"><span className="step-number">01</span><div><h2>Transaction details</h2><p>Keep your records clear and organized.</p></div></div><div className="form-grid"><label>Transaction name<input ref={nameRef} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Grocery shopping" /></label><label>Amount<input type="number" min="1" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0" /></label><label>Type<select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="expense">Expense</option><option value="income">Income</option></select></label><label>Category<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label><label>Date<input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label><label className="full-field">Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Add a note about this transaction" rows="4" /></label></div>{error && <p className="form-error">{error}</p>}<div className="form-actions"><Link to={editing ? `/transactions/${editing.id}` : '/dashboard'} className="button button-secondary" onClick={onCancel}>Cancel</Link><Button type="submit"><Plus size={16} /> {editing ? 'Save changes' : 'Save transaction'}</Button></div></form></div>
}

function Budgets({ transactions, budgets, setBudgets }) {
  const [showForm, setShowForm] = useState(false)
  const [draft, setDraft] = useState({ category: 'Food', limit: '' })
  const categoryTotals = useMemo(() => getCategoryTotals(transactions), [transactions])
  const saveBudget = (event) => { event.preventDefault(); if (draft.limit > 0) { setBudgets([...budgets.filter((item) => item.category !== draft.category), { id: draft.category.toLowerCase(), category: draft.category, limit: Number(draft.limit) }]); setDraft({ category: 'Food', limit: '' }); setShowForm(false) } }
  return <div className="page-stack"><PageHeader title="Budget management" subtitle="Set limits that keep your spending intentional." action={<Button onClick={() => setShowForm(!showForm)}><Plus size={17} /> Set budget</Button>} />{showForm && <form className="panel budget-form" onSubmit={saveBudget}><label>Category<select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>{categories.filter((item) => item !== 'Salary').map((item) => <option key={item}>{item}</option>)}</select></label><label>Monthly limit<input type="number" min="1" value={draft.limit} onChange={(e) => setDraft({ ...draft, limit: e.target.value })} placeholder="5000" /></label><Button type="submit">Save budget</Button></form>}<section className="budget-grid">{budgets.map((budget) => { const spent = categoryTotals[budget.category] || 0; const percent = Math.round((spent / budget.limit) * 100); const tone = percent >= 90 ? 'danger' : percent >= 70 ? 'warning' : 'success'; return <article className="panel budget-card" key={budget.id}><div className="budget-top"><div className="budget-label"><IconBadge category={budget.category} type="expense" /><div><h2>{budget.category}</h2><p>Monthly spending</p></div></div><span className={`status-pill ${tone}`}>{percent >= 90 ? 'Almost reached' : percent >= 70 ? 'Be careful' : 'On track'}</span></div><div className="budget-amount"><strong>{formatCurrency(spent)}</strong><span>of {formatCurrency(budget.limit)}</span></div><ProgressBar value={percent} tone={tone} /><div className="budget-footer"><span>{formatCurrency(Math.max(budget.limit - spent, 0))} remaining</span><strong>{percent}%</strong></div></article> })}</section></div>
}

function Insights({ transactions, totals }) {
  const categoryTotals = useMemo(() => getCategoryTotals(transactions), [transactions])
  const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])
  const top = sorted[0]
  return <div className="page-stack"><PageHeader title="Spending insights" subtitle="A clearer view of the habits behind your numbers." /><section className="insights-grid"><article className="panel featured-insight"><div className="insight-icon"><TrendingUp size={21} /></div><p className="eyebrow">Savings rate</p><strong>{totals.income ? Math.round((totals.balance / totals.income) * 100) : 0}%</strong><p>You&apos;re keeping a healthy share of your income. Consistency is the key to long-term progress.</p><div className="mini-line"><span style={{ width: `${Math.min(100, totals.income ? (totals.balance / totals.income) * 100 : 0)}%` }} /></div></article><article className="panel insight-card"><div className="insight-heading"><span className="insight-icon orange"><TrendingDown size={19} /></span><span>Top spending category</span></div><h2>{top?.[0] || 'No data'}</h2><p>{top ? `${formatCurrency(top[1])} spent this month` : 'Add expenses to see your patterns.'}</p><Link to="/transactions" className="text-link">Review transactions <ArrowUpRight size={14} /></Link></article><article className="panel insight-card"><div className="insight-heading"><span className="insight-icon green"><ShieldCheck size={19} /></span><span>Monthly comparison</span></div><h2>{formatCurrency(2450)}</h2><p>less spent than your previous month</p><span className="positive-label"><ArrowDownRight size={14} /> 12.4% lower</span></article></section><section className="panel category-panel"><div className="panel-heading"><div><h2>Category breakdown</h2><p>Expense distribution from your transaction history</p></div></div><div className="breakdown-list">{sorted.map(([category, amount], index) => <div className="breakdown-row" key={category}><div className="breakdown-name"><i className={`legend-dot category-${index % 4}`} />{category}</div><div className="breakdown-bar"><span style={{ width: `${(amount / (top?.[1] || 1)) * 100}%` }} /></div><strong>{formatCurrency(amount)}</strong><span>{Math.round((amount / (totals.expenses || 1)) * 100)}%</span></div>)}</div></section><section className="insight-banner"><Sparkles size={20} /><div><strong>Small changes add up.</strong><p>Try setting a weekly limit for {top?.[0] || 'your top category'} to keep your goals on track.</p></div><Link to="/budgets" className="button button-light">Manage budgets</Link></section></div>
}

function Profile({ profile, setProfile }) {
  const [form, setForm] = useState(profile)
  const [saved, setSaved] = useState(false)
  const submit = (event) => { event.preventDefault(); setProfile(form); setSaved(true); setTimeout(() => setSaved(false), 2500) }
  return <div className="page-stack narrow-page"><PageHeader title="Profile" subtitle="Manage your personal details and preferences." /><section className="profile-grid"><article className="panel profile-card"><div className="large-avatar">TS</div><h2>{form.name || 'Tushar Singh'}</h2><p>{form.email || 'tushar@example.com'}</p><span className="member-badge">Personal account</span></article><form className="panel form-panel profile-form" onSubmit={submit}><div className="form-section-title"><span className="step-number">01</span><div><h2>Personal information</h2><p>This information stays on this device.</p></div></div><div className="form-grid"><label>Full name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label>Email address<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label><label>College<input value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} placeholder="Your college" /></label><label>Course<input value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} placeholder="Your course" /></label><label>Semester<select value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })}><option>Semester 1</option><option>Semester 2</option><option>Semester 3</option><option>Semester 4</option><option>Semester 5</option><option>Semester 6</option></select></label></div><div className="form-actions"><Button type="submit">Save profile</Button>{saved && <span className="saved-message">Profile saved</span>}</div></form></section></div>
}

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  return <main className="login-page"><section className="login-visual"><div className="brand login-brand"><span className="brand-mark"><Wallet size={20} /></span><span>Fin<span>Track</span></span></div><div className="login-copy"><span className="overline">YOUR MONEY, CLEARER</span><h1>Take control of<br /><em>your money.</em></h1><p>Track your income, manage expenses, set budgets, and understand your spending habits with FinTrack.</p><div className="login-proof"><div className="proof-avatars"><span>TS</span><span>AK</span><span>RM</span></div><span>Join thousands building better money habits</span></div></div><div className="login-orbit orbit-one" /><div className="login-orbit orbit-two" /></section><section className="login-form-side"><form className="login-form" onSubmit={(e) => { e.preventDefault(); onLogin() }}><div className="mobile-login-brand brand"><span className="brand-mark"><Wallet size={20} /></span><span>Fin<span>Track</span></span></div><div className="login-heading"><h2>Welcome back</h2><p>Sign in to continue to your dashboard.</p></div><label>Email address<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></label><label>Password<div className="password-wrap"><input type="password" placeholder="Enter your password" required /><span>Forgot?</span></div></label><Button type="submit" className="login-submit">Sign in <ArrowUpRight size={17} /></Button><div className="or-divider"><span>or</span></div><Button variant="secondary" type="button" onClick={onLogin}>Continue with demo account</Button><p className="signup-copy">Don&apos;t have an account? <button type="button" onClick={onLogin}>Create account</button></p></form></section></main>
}

function TransactionDetails({ transaction, onDelete }) {
  const navigate = useNavigate()
  if (!transaction) return <NotFound />
  return <div className="page-stack narrow-page"><button className="back-link" onClick={() => navigate('/transactions')}>← Back to transactions</button><section className="panel detail-card"><div className="detail-header"><IconBadge category={transaction.category} type={transaction.type} /><span className={`status-pill ${transaction.type === 'income' ? 'success' : 'warning'}`}>{transaction.type}</span></div><p className="eyebrow">{transaction.category}</p><h1>{transaction.name}</h1><strong className={`detail-amount ${transaction.type}`}>{transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}</strong><div className="detail-meta"><div><span>Date</span><strong>{formatDate(transaction.date)}</strong></div><div><span>Description</span><strong>{transaction.description || 'No description added'}</strong></div></div><div className="form-actions"><Link to={`/add-transaction?edit=${transaction.id}`} className="button button-secondary"><Pencil size={16} /> Edit transaction</Link><Button variant="danger" onClick={() => { onDelete(transaction.id); navigate('/transactions') }}><Trash2 size={16} /> Delete transaction</Button></div></section></div>
}

function TransactionRoute({ transactions, onDelete }) {
  const { id } = useParams()
  return <TransactionDetails transaction={transactions.find((item) => item.id === id)} onDelete={onDelete} />
}

function NotFound() { return <main className="not-found"><span className="not-found-number">404</span><h1>Page not found</h1><p>The page you&apos;re looking for doesn&apos;t exist.</p><Link to="/dashboard" className="button button-primary">Back to dashboard</Link></main> }

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage('fintrack-logged-in', false)
  const [transactions, setTransactions] = useLocalStorage('fintrack-transactions', [])
  const [budgets, setBudgets] = useLocalStorage('fintrack-budgets', defaultBudgets)
  const [profile, setProfile] = useLocalStorage('fintrack-profile', { name: 'Tushar Singh', email: 'tushar@example.com', college: 'VIT University', course: 'Computer Science', semester: 'Semester 5' })
  const [editing, setEditing] = useState(null)
  useEffect(() => { if (!transactions.length) fetch('/data/demo-transactions.json').then((response) => response.json()).then(setTransactions).catch(() => setTransactions([])) }, [transactions.length, setTransactions])
  const totals = useMemo(() => transactions.reduce((summary, item) => { if (item.type === 'income') summary.income += item.amount; else summary.expenses += item.amount; summary.balance = summary.income - summary.expenses; return summary }, { income: 0, expenses: 0, balance: 0 }), [transactions])
  const addTransaction = useCallback((transaction) => { setTransactions((current) => transaction.id && current.some((item) => item.id === transaction.id) ? current.map((item) => item.id === transaction.id ? transaction : item) : [transaction, ...current]); setEditing(null) }, [setTransactions])
  const deleteTransaction = useCallback((id) => { if (window.confirm('Delete this transaction?')) setTransactions((current) => current.filter((item) => item.id !== id)) }, [setTransactions])
  const editTransaction = useCallback((transaction) => setEditing(transaction), [])
  const transactionRoute = ({ children }) => <ProtectedRoute isLoggedIn={isLoggedIn}><Layout onLogout={() => setIsLoggedIn(false)}>{children}</Layout></ProtectedRoute>
  const Router = typeof document === 'undefined' ? MemoryRouter : BrowserRouter
  return <Router><Routes><Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login onLogin={() => setIsLoggedIn(true)} />} /><Route path="/" element={<Navigate to={isLoggedIn ? '/dashboard' : '/login'} replace />} /><Route path="/dashboard" element={transactionRoute({ children: <Dashboard transactions={transactions} totals={totals} /> })} /><Route path="/transactions" element={transactionRoute({ children: <Transactions transactions={transactions} onDelete={deleteTransaction} onEdit={editTransaction} /> })} /><Route path="/transactions/:id" element={transactionRoute({ children: <TransactionRoute transactions={transactions} onDelete={deleteTransaction} /> })} /><Route path="/add-transaction" element={transactionRoute({ children: <AddTransaction onAdd={addTransaction} editing={editing} onCancel={() => setEditing(null)} /> })} /><Route path="/budgets" element={transactionRoute({ children: <Budgets transactions={transactions} budgets={budgets} setBudgets={setBudgets} /> })} /><Route path="/insights" element={transactionRoute({ children: <Insights transactions={transactions} totals={totals} /> })} /><Route path="/profile" element={transactionRoute({ children: <Profile profile={profile} setProfile={setProfile} /> })} /><Route path="*" element={<NotFound />} /></Routes></Router>
}
