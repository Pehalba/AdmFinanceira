import { formatCurrency } from "../../scripts/utils/dateUtils";
import "./BarChart.css";

/**
 * Componente de gráfico de barras verticais comparando receita e despesa
 * @param {Object} props
 * @param {number} props.income - Valor de receita
 * @param {number} props.expense - Valor de despesa
 */
export function BarChart({ income = 0, expense = 0 }) {
  // Calcular a maior valor para usar como base (100%)
  const maxValue = Math.max(income, expense, 1);
  
  // Calcular porcentagens relativas
  const incomePercentage = maxValue > 0 ? (income / maxValue) * 100 : 0;
  const expensePercentage = maxValue > 0 ? (expense / maxValue) * 100 : 0;

  return (
    <div className="bar-chart">
      <div className="bar-chart__container">
        <div className="bar-chart__bars">
          <div className="bar-chart__bar-group">
            <div className="bar-chart__bar-label">Receitas</div>
            <div className="bar-chart__bar-wrapper">
              {income > 0 ? (
                <div 
                  className={`bar-chart__bar bar-chart__bar--income ${incomePercentage < 10 ? 'bar-chart__bar--small' : ''}`}
                  style={{ height: `${incomePercentage}%` }}
                >
                  <span className="bar-chart__bar-value">
                    {formatCurrency(income)}
                  </span>
                </div>
              ) : (
                <div className="bar-chart__bar-empty">
                  {formatCurrency(0)}
                </div>
              )}
            </div>
          </div>
          
          <div className="bar-chart__bar-group">
            <div className="bar-chart__bar-label">Despesas</div>
            <div className="bar-chart__bar-wrapper">
              {expense > 0 ? (
                <div 
                  className={`bar-chart__bar bar-chart__bar--expense ${expensePercentage < 10 ? 'bar-chart__bar--small' : ''}`}
                  style={{ height: `${expensePercentage}%` }}
                >
                  <span className="bar-chart__bar-value">
                    {formatCurrency(expense)}
                  </span>
                </div>
              ) : (
                <div className="bar-chart__bar-empty">
                  {formatCurrency(0)}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Indicador de comparação */}
        {income > 0 && expense > 0 && (
          <div className="bar-chart__comparison">
            {income > expense ? (
              <div className="bar-chart__comparison-text bar-chart__comparison-text--positive">
                Receita é {((income / expense) * 100).toFixed(0)}% maior que despesa
              </div>
            ) : expense > income ? (
              <div className="bar-chart__comparison-text bar-chart__comparison-text--negative">
                Despesa é {((expense / income) * 100).toFixed(0)}% maior que receita
              </div>
            ) : (
              <div className="bar-chart__comparison-text">
                Receita e despesa estão equilibradas
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
