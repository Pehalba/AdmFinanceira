import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../blocks/Card/Card';
import { Fab } from '../../blocks/Fab/Fab';
import { DonutChart } from '../../blocks/DonutChart/DonutChart';
import { BarChart } from '../../blocks/BarChart/BarChart';
import { dashboardService } from '../../scripts/services/dashboardService';
import { payableService } from '../../scripts/services/payableService';
import { formatCurrency, formatDate, getMonthKey } from '../../scripts/utils/dateUtils';
import './Dashboard.css';

export function Dashboard({ user }) {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(getMonthKey(new Date()));

  useEffect(() => {
    if (user?.uid) {
      loadDashboard();
    } else {
      setData(null);
      setLoading(false);
    }
  }, [selectedMonth, user?.uid]);

  // Recarregar dashboard quando a página ganhar foco (usuário volta da página de transações)
  useEffect(() => {
    const handleFocus = () => {
      console.log('[Dashboard] Page gained focus, reloading dashboard');
      loadDashboard();
    };
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('[Dashboard] Page became visible, reloading dashboard');
        loadDashboard();
      }
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [selectedMonth, user?.uid]);

  const loadDashboard = async () => {
    if (!user?.uid) {
      console.log('[Dashboard] loadDashboard - No user, skipping');
      return;
    }
    console.log('[Dashboard] loadDashboard - Loading for month:', selectedMonth, 'uid:', user.uid);
    setLoading(true);
    try {
      const [dashboardData, upcomingPayables] = await Promise.all([
        dashboardService.getDashboardData(selectedMonth),
        payableService.getUpcoming(15, 10, user?.uid),
      ]);
      console.log('[Dashboard] loadDashboard - Data loaded:', {
        totalIncome: dashboardData.monthlySummary?.totalIncome,
        totalExpense: dashboardData.monthlySummary?.totalExpense,
        balance: dashboardData.monthlySummary?.balance
      });
      setData({ ...dashboardData, upcomingPayables });
    } catch (error) {
      console.error('[Dashboard] loadDashboard - Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const summary = data?.monthlySummary || {};
  const recurringBills = data?.recurringBills || [];
  const recentTransactions = data?.recentTransactions || [];
  const upcomingPayables = data?.upcomingPayables || [];
  
  // Valores para gráficos (convertendo para números)
  const totalIncome = summary.totalIncome || 0;
  const totalExpense = summary.totalExpense || 0;
  const maxValue = Math.max(totalIncome, totalExpense, 1);
  
  // Dados para gráfico de categorias (APENAS despesas)
  // Usar byCategoryExpense que já separa apenas despesas
  const categoryData = summary.byCategoryExpense 
    ? Object.values(summary.byCategoryExpense).sort((a, b) => b.total - a.total)
    : [];

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard__loading">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1 className="dashboard__title">Dashboard</h1>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="dashboard__month-selector"
        />
      </div>

      {/* Mobile: Saldo em cima, depois Receitas/Despesas lado a lado */}
      <div className="dashboard__top">
        <Card className="dashboard__card dashboard__card--balance">
          <div className="dashboard__card-label">Saldo</div>
          <div className="dashboard__card-value">
            {formatCurrency(summary.balance || 0)}
          </div>
        </Card>

        <div className="dashboard__income-expense">
          <Card className="dashboard__card dashboard__card--income">
            <div className="dashboard__card-label">Receitas</div>
            <div className="dashboard__card-value">
              {formatCurrency(summary.totalIncome || 0)}
            </div>
          </Card>

          <Card className="dashboard__card dashboard__card--expense">
            <div className="dashboard__card-label">Despesas</div>
            <div className="dashboard__card-value">
              {formatCurrency(summary.totalExpense || 0)}
            </div>
          </Card>
        </div>
      </div>

      <div className="dashboard__charts">
        <Card title="Despesas por Categoria" className="dashboard__chart-card">
          <DonutChart data={categoryData.slice(0, 8)} total={summary.totalExpense || 0} />
        </Card>

        <Card title="Receitas vs Despesas" className="dashboard__chart-card">
          <div className="dashboard__chart-container">
            <div className="dashboard__chart-bar-group">
              <div className="dashboard__chart-label">Receitas</div>
              <div className="dashboard__chart-bar-wrapper">
                {totalIncome > 0 ? (
                  <div 
                    className="dashboard__chart-bar dashboard__chart-bar--income"
                    style={{ width: `${(totalIncome / maxValue) * 100}%` }}
                  >
                    <span className="dashboard__chart-bar-value">
                      {formatCurrency(totalIncome)}
                    </span>
                  </div>
                ) : (
                  <div className="dashboard__chart-bar-empty">
                    {formatCurrency(0)}
                  </div>
                )}
              </div>
            </div>
            <div className="dashboard__chart-bar-group">
              <div className="dashboard__chart-label">Despesas</div>
              <div className="dashboard__chart-bar-wrapper">
                {totalExpense > 0 ? (
                  <div 
                    className="dashboard__chart-bar dashboard__chart-bar--expense"
                    style={{ width: `${(totalExpense / maxValue) * 100}%` }}
                  >
                    <span className="dashboard__chart-bar-value">
                      {formatCurrency(totalExpense)}
                    </span>
                  </div>
                ) : (
                  <div className="dashboard__chart-bar-empty">
                    {formatCurrency(0)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card title="Comparação Receitas vs Despesas" className="dashboard__chart-card">
          <BarChart income={totalIncome} expense={totalExpense} />
        </Card>
      </div>

      <div className="dashboard__content">
        <Card title="Próximas Despesas Mensais">
          {upcomingPayables.length === 0 ? (
            <p className="dashboard__empty">Nenhuma despesa nos próximos 15 dias</p>
          ) : (
            <ul className="dashboard__list">
              {upcomingPayables.map((payable) => (
                <li key={payable.id} className="dashboard__list-item">
                  <div>
                    <strong>{payable.title || 'Sem título'}</strong>
                    <div className="dashboard__list-meta">
                      Vencimento: {formatDate(payable.dueDate)} • {payable.categoryName || 'Sem categoria'} • {formatCurrency(payable.amount || 0)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Contas Recorrentes">
          {recurringBills.length === 0 ? (
            <p className="dashboard__empty">Nenhuma conta recorrente ativa</p>
          ) : (
            <ul className="dashboard__list">
              {recurringBills.map((bill) => (
                <li key={bill.id} className="dashboard__list-item">
                  <div>
                    <strong>{bill.name}</strong>
                    <div className="dashboard__list-meta">
                      {formatCurrency(bill.amount)} - {bill.description || 'Sem descrição'}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Transações Recentes">
          {recentTransactions.length === 0 ? (
            <p className="dashboard__empty">Nenhuma transação recente</p>
          ) : (
            <ul className="dashboard__list">
              {recentTransactions.map((transaction) => (
                <li key={transaction.id} className="dashboard__list-item">
                  <div>
                    <strong>{transaction.description || 'Sem descrição'}</strong>
                    <div className="dashboard__list-meta">
                      {transaction.categoryName} • {formatDate(transaction.date)} •{' '}
                      <span className={transaction.type === 'income' ? 'dashboard__amount-income' : 'dashboard__amount-expense'}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(Math.abs(transaction.amount || 0))}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Fab
        onClick={() => {
          navigate(`/transactions?month=${selectedMonth}&openForm=true`);
        }}
        label="Nova Transação"
      />
    </div>
  );
}
