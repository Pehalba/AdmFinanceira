import {
  monthlySummaryRepository,
  recurringBillRepository,
  transactionRepository,
} from "../repositories/index.js";
import { getMonthKey } from "../utils/dateUtils.js";

/**
 * Serviço do Dashboard
 * Otimizado para baixo custo no Firestore:
 * - Máximo 3 leituras: monthlySummary, recurringBills (limit 10), transactions recentes (limit 10)
 */
class DashboardService {
  /**
   * Carrega dados do dashboard para um mês
   * @param {string} monthKey - YYYY-MM ou null para mês atual
   * @returns {Object} Dados do dashboard
   */
  async getDashboardData(monthKey = null) {
    const targetMonth = monthKey || getMonthKey(new Date());

    // 1) Ler monthlySummary (1 leitura)
    let monthlySummary = await monthlySummaryRepository.getByMonth(targetMonth);

    // Se não existe resumo ou não tem byCategoryExpense/byCategoryIncome (resumo antigo), recalcular
    if (!monthlySummary || !monthlySummary.byCategoryExpense) {
      monthlySummary = await this.calculateMonthlySummary(targetMonth);
    }

    // 2) Ler recurringBills ativas (1 leitura, limit 10)
    const recurringBills = await recurringBillRepository.getActive(10);

    // 3) Opcional: últimas transações (1 leitura, limit 10)
    const recentTransactions = await transactionRepository.getRecent(10);

    return {
      monthKey: targetMonth,
      monthlySummary,
      recurringBills,
      recentTransactions,
    };
  }

  /**
   * Calcula e salva resumo mensal
   * Chamado após criar/atualizar/deletar transações
   */
  async calculateMonthlySummary(monthKey) {
    const transactions = await transactionRepository.getByMonth(monthKey, 1000);

    const summary = {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      transactionCount: transactions.length,
      byCategory: {},
      byCategoryExpense: {}, // Apenas despesas
      byCategoryIncome: {}, // Apenas receitas
    };

    transactions.forEach((transaction) => {
      const amount = transaction.amount || 0;
      const catId = transaction.categoryId || "unknown";
      const categoryName = transaction.categoryName || "";

      if (transaction.type === "income") {
        // Receitas: valores positivos
        summary.totalIncome += Math.abs(amount);

        // Agrupar receitas por categoria
        if (!summary.byCategoryIncome[catId]) {
          summary.byCategoryIncome[catId] = {
            categoryId: catId,
            categoryName: categoryName,
            total: 0,
            count: 0,
          };
        }
        summary.byCategoryIncome[catId].total += Math.abs(amount);
        summary.byCategoryIncome[catId].count += 1;
      } else {
        // Despesas: valores negativos, usar valor absoluto para somar
        summary.totalExpense += Math.abs(amount);

        // Agrupar despesas por categoria
        if (!summary.byCategoryExpense[catId]) {
          summary.byCategoryExpense[catId] = {
            categoryId: catId,
            categoryName: categoryName,
            total: 0,
            count: 0,
          };
        }
        summary.byCategoryExpense[catId].total += Math.abs(amount);
        summary.byCategoryExpense[catId].count += 1;
      }

      // Agrupar todas por categoria (mantido para compatibilidade)
      if (!summary.byCategory[catId]) {
        summary.byCategory[catId] = {
          categoryId: catId,
          categoryName: categoryName,
          total: 0,
          count: 0,
        };
      }
      summary.byCategory[catId].total += Math.abs(amount);
      summary.byCategory[catId].count += 1;
    });

    summary.balance = summary.totalIncome - summary.totalExpense;

    // Salvar resumo
    await monthlySummaryRepository.upsert(monthKey, summary);

    return summary;
  }
}

export const dashboardService = new DashboardService();
