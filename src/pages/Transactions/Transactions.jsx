import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "../../blocks/Button/Button";
import { Card } from "../../blocks/Card/Card";
import { Input } from "../../blocks/Input/Input";
import { Select } from "../../blocks/Select/Select";
import { Fab } from "../../blocks/Fab/Fab";
import { transactionService } from "../../scripts/services/transactionService";
import { accountService } from "../../scripts/services/accountService";
import { categoryService } from "../../scripts/services/categoryService";
import {
  formatCurrency,
  formatDate,
  getMonthKey,
} from "../../scripts/utils/dateUtils";
import "./Transactions.css";

export function Transactions({ user }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const monthFromUrl = searchParams.get("month");
  const openFormFromUrl = searchParams.get("openForm") === "true";
  const [transactions, setTransactions] = useState([]);
  const [banks, setBanks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(openFormFromUrl || false);
  const [editingId, setEditingId] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(
    monthFromUrl || getMonthKey(new Date())
  );

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "expense",
    accountId: "",
    categoryId: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    // Atualizar selectedMonth se mudou na URL
    if (monthFromUrl && monthFromUrl !== selectedMonth) {
      setSelectedMonth(monthFromUrl);
    }

    // Se veio da URL com openForm=true, abrir o formulário automaticamente
    if (openFormFromUrl && !showForm) {
      setShowForm(true);
      setEditingId(null);
      // Limpar os parâmetros da URL após abrir o formulário
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("openForm");
      if (monthFromUrl) {
        newParams.delete("month");
      }
      setSearchParams(newParams.toString() ? newParams : {});
      // Scroll para o topo para ver o formulário
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);
    }
  }, [monthFromUrl, openFormFromUrl]);

  useEffect(() => {
    loadData();
  }, [selectedMonth]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [trans, banksList, cats] = await Promise.all([
        transactionService.getByMonth(selectedMonth),
        accountService.getAll(user?.uid),
        categoryService.getAll(user?.uid),
      ]);
      setTransactions(trans);
      setBanks(banksList);
      setCategories(cats);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Atualizar transação existente
        await transactionService.update(editingId, {
          ...formData,
          amount: parseFloat(formData.amount),
        });
      } else {
        // Criar nova transação
        await transactionService.create({
          ...formData,
          amount: parseFloat(formData.amount),
          uid: user.uid,
        });
      }

      // Resetar formulário e estado
      setShowForm(false);
      setEditingId(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error("Error saving transaction:", error);
      alert(
        editingId ? "Erro ao atualizar transação" : "Erro ao criar transação"
      );
    }
  };

  const resetForm = () => {
    // Se tiver um mês selecionado, usar o primeiro dia desse mês
    // Senão usar a data atual
    let formDate = new Date().toISOString().split("T")[0];
    if (selectedMonth) {
      const [year, month] = selectedMonth.split("-");
      formDate = `${year}-${month}-01`; // Primeiro dia do mês selecionado
    }

    setFormData({
      description: "",
      amount: "",
      type: "expense",
      accountId: "",
      categoryId: "",
      date: formDate,
    });
  };

  const handleEdit = (transaction) => {
    setEditingId(transaction.id);

    // Formatar data para input type="date" (YYYY-MM-DD)
    let dateValue = "";
    if (transaction.date) {
      if (transaction.date.includes("T")) {
        // Se é ISO string, pegar apenas a parte da data
        dateValue = transaction.date.split("T")[0];
      } else if (transaction.date.includes("/")) {
        // Se está em formato brasileiro DD/MM/YYYY, converter
        const parts = transaction.date.split("/");
        if (parts.length === 3) {
          dateValue = `${parts[2]}-${parts[1]}-${parts[0]}`;
        } else {
          dateValue = new Date(transaction.date).toISOString().split("T")[0];
        }
      } else {
        dateValue = new Date(transaction.date).toISOString().split("T")[0];
      }
    } else {
      dateValue = new Date().toISOString().split("T")[0];
    }

    // Validar categoria: se a categoria não corresponder ao tipo, resetar
    let categoryId = transaction.categoryId || "";
    if (categoryId && categories.length > 0) {
      const category = categories.find((cat) => cat.id === categoryId);
      if (category && category.type !== transaction.type) {
        categoryId = ""; // Resetar se o tipo não corresponder
      }
    }

    setFormData({
      description: transaction.description || "",
      amount: String(transaction.amount || ""),
      type: transaction.type || "expense",
      accountId: transaction.accountId || "",
      categoryId: categoryId,
      date: dateValue,
    });
    setShowForm(true);
    // Scroll para o formulário
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    resetForm();
  };

  const handleDelete = async (id) => {
    if (!confirm("Tem certeza que deseja excluir esta transação?")) return;
    try {
      await transactionService.delete(id);
      loadData();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert("Erro ao excluir transação");
    }
  };

  const filteredCategories = categories.filter(
    (cat) => cat.type === formData.type
  );

  if (loading) {
    return <div className="transactions__loading">Carregando...</div>;
  }

  return (
    <div className="transactions">
      <div className="transactions__header">
        <h1 className="transactions__title">Transações</h1>
        <div className="transactions__controls">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="transactions__month-selector"
          />
          <Button
            onClick={() => {
              if (showForm) {
                handleCancel();
              } else {
                setShowForm(true);
                setEditingId(null);
                resetForm();
              }
            }}
          >
            {showForm ? "Cancelar" : "Nova Transação"}
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="transactions__form-card">
          <h2 className="transactions__form-title">
            {editingId ? "Editar Transação" : "Nova Transação"}
          </h2>
          <form onSubmit={handleSubmit} className="transactions__form">
            <Input
              label="Descrição"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />

            <Input
              label="Valor"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              required
            />

            <Select
              label="Tipo"
              value={formData.type}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  type: e.target.value,
                  categoryId: "",
                });
              }}
              options={[
                { value: "income", label: "Receita" },
                { value: "expense", label: "Despesa" },
              ]}
              required
            />

            <Select
              label="Banco"
              value={formData.accountId}
              onChange={(e) =>
                setFormData({ ...formData, accountId: e.target.value })
              }
              options={banks.map((bank) => ({
                value: bank.id,
                label: bank.name,
              }))}
              required
            />

            <Select
              label="Categoria"
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: e.target.value })
              }
              options={filteredCategories.map((cat) => ({
                value: cat.id,
                label: cat.name,
              }))}
              required
            />

            <Input
              label="Data"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
            />

            <div className="transactions__form-actions">
              <Button type="submit" variant="primary">
                {editingId ? "Atualizar" : "Salvar"}
              </Button>
              <Button type="button" variant="secondary" onClick={handleCancel}>
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        {transactions.length === 0 ? (
          <p className="transactions__empty">Nenhuma transação neste mês</p>
        ) : (
          <div className="transactions__list">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="transactions__item">
                <div className="transactions__item-main">
                  <div>
                    <strong>
                      {transaction.description || "Sem descrição"}
                    </strong>
                    <div className="transactions__item-meta">
                      {transaction.categoryName} •{" "}
                      {transaction.accountName || transaction.bankName} •{" "}
                      {formatDate(transaction.date)}
                    </div>
                  </div>
                  <div
                    className={`transactions__item-amount ${
                      transaction.type === "income"
                        ? "transactions__item-amount--income"
                        : "transactions__item-amount--expense"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(Math.abs(transaction.amount || 0))}
                  </div>
                </div>
                <div className="transactions__item-actions">
                  <Button
                    variant="outline"
                    onClick={() => handleEdit(transaction)}
                    className="transactions__item-edit"
                  >
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(transaction.id)}
                    className="transactions__item-delete"
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {!showForm && (
        <Fab
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            resetForm();
            // Scroll para o topo para ver o formulário
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          label="Nova Transação"
        />
      )}
    </div>
  );
}
