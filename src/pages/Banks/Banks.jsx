import { useState, useEffect } from "react";
import { Button } from "../../blocks/Button/Button";
import { Card } from "../../blocks/Card/Card";
import { Input } from "../../blocks/Input/Input";
import { Select } from "../../blocks/Select/Select";
import { accountService } from "../../scripts/services/accountService";
import { formatCurrency } from "../../scripts/utils/dateUtils";
import "./Banks.css";

export function Banks({ user }) {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "checking",
    balance: "0",
  });

  useEffect(() => {
    if (user?.uid) {
      loadBanks();
    } else {
      setBanks([]);
      setLoading(false);
    }
  }, [user?.uid]);

  const loadBanks = async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const banksList = await accountService.getAll(user.uid);
      setBanks(banksList);
    } catch (error) {
      console.error("Error loading banks:", error);
      setBanks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await accountService.create({
        ...formData,
        balance: parseFloat(formData.balance),
        uid: user.uid,
      });
      setShowForm(false);
      setFormData({ name: "", type: "checking", balance: "0" });
      loadBanks();
    } catch (error) {
      console.error("Error creating bank:", error);
      alert("Erro ao criar banco");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Tem certeza que deseja excluir este banco?")) return;
    try {
      await accountService.delete(id, user.uid);
      loadBanks();
    } catch (error) {
      console.error("Error deleting bank:", error);
      alert("Erro ao excluir banco");
    }
  };

  const handleSetPrimary = async (id) => {
    try {
      await accountService.setPrimaryAccount(id, user.uid);
      loadBanks();
      alert("Conta definida como principal com sucesso!");
    } catch (error) {
      console.error("Error setting primary account:", error);
      alert("Erro ao definir conta como principal");
    }
  };

  const handleRecalculateBalances = async () => {
    if (!confirm("Isso irá recalcular o saldo de todas as contas baseado nas transações existentes. Deseja continuar?")) return;
    
    setRecalculating(true);
    try {
      await accountService.recalculateAllBalances(user.uid);
      alert("Saldos recalculados com sucesso!");
      loadBanks();
    } catch (error) {
      console.error("Error recalculating balances:", error);
      alert("Erro ao recalcular saldos");
    } finally {
      setRecalculating(false);
    }
  };

  if (loading) {
    return <div className="banks__loading">Carregando...</div>;
  }

  return (
    <div className="banks">
      <div className="banks__header">
        <h1 className="banks__title">Bancos</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button 
            onClick={handleRecalculateBalances} 
            disabled={recalculating}
            variant="secondary"
          >
            {recalculating ? "Recalculando..." : "Recalcular Saldos"}
          </Button>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancelar" : "Novo Banco"}
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="banks__form-card">
          <h2 className="banks__form-title">Novo Banco</h2>
          <form onSubmit={handleSubmit} className="banks__form">
            <Input
              label="Nome do Banco"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Banco do Brasil, Nubank, etc."
              required
            />

            <Select
              label="Tipo de Conta"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={[
                { value: "checking", label: "Conta Corrente" },
                { value: "savings", label: "Poupança" },
                { value: "investment", label: "Investimento" },
                { value: "credit", label: "Cartão de Crédito" },
                { value: "other", label: "Outro" },
              ]}
              required
            />

            <Input
              label="Saldo Inicial"
              type="number"
              step="0.01"
              value={formData.balance}
              onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
            />

            <Button type="submit" variant="primary">
              Salvar
            </Button>
          </form>
        </Card>
      )}

      <div className="banks__grid">
        {banks.length === 0 ? (
          <Card>
            <p className="banks__empty">Nenhum banco cadastrado</p>
          </Card>
        ) : (
          banks.map((bank) => (
            <Card key={bank.id} className="banks__card">
              <div className="banks__card-header">
                <h3 className="banks__card-name">
                  {bank.name}
                  {bank.isPrimary && (
                    <span className="banks__primary-badge">Principal</span>
                  )}
                </h3>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(bank.id)}
                  className="banks__card-delete"
                >
                  Excluir
                </Button>
              </div>
              <div className="banks__card-type">{bank.type}</div>
              <div className="banks__card-balance">
                {formatCurrency(bank.balance || 0)}
              </div>
              <div className="banks__card-actions">
                {!bank.isPrimary && (
                  <Button
                    variant="secondary"
                    onClick={() => handleSetPrimary(bank.id)}
                    className="banks__card-primary"
                  >
                    Definir como Principal
                  </Button>
                )}
                {bank.isPrimary && (
                  <div className="banks__card-primary-info">
                    Esta conta será usada automaticamente para pagar despesas mensais
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
