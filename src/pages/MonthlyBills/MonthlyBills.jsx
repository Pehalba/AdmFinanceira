import { useState, useEffect } from "react";
import { Button } from "../../blocks/Button/Button";
import { Card } from "../../blocks/Card/Card";
import { Input } from "../../blocks/Input/Input";
import { Select } from "../../blocks/Select/Select";
import { Fab } from "../../blocks/Fab/Fab";
import { AccountSelectModal } from "../../blocks/AccountSelectModal/AccountSelectModal";
import { payableService } from "../../scripts/services/payableService";
import { categoryService } from "../../scripts/services/categoryService";
import { accountService } from "../../scripts/services/accountService";
import { formatCurrency, formatDate, getMonthKey } from "../../scripts/utils/dateUtils";
import "./MonthlyBills.css";

export function MonthlyBills({ user }) {
  const [payables, setPayables] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(getMonthKey(new Date()));
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [editingAmountId, setEditingAmountId] = useState(null);
  const [editingAmountValue, setEditingAmountValue] = useState("");
  const [togglingStatusId, setTogglingStatusId] = useState(null); // Para loading por item
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [pendingStatusId, setPendingStatusId] = useState(null);
  const [pendingMonthKey, setPendingMonthKey] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    dueDay: "10", // Padrão dia 10
    categoryId: "",
    notes: "",
  });

  useEffect(() => {
    if (user?.uid) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [selectedMonth, user]);

  // Recarregar categorias quando a página ganha foco (útil quando volta de outra página)
  useEffect(() => {
    if (!user?.uid) return; // Não fazer nada se user não estiver disponível
    
    const handleFocus = () => {
      // Verificar novamente se user está disponível quando o evento dispara
      if (!user?.uid) {
        console.warn('[MonthlyBills] User not available, skipping category reload');
        return;
      }
      
      if (document.visibilityState === 'visible') {
        console.log('[MonthlyBills] Page visible, reloading categories for uid:', user.uid);
        // Recarregar apenas categorias (forçar reload para pegar novas categorias)
        categoryService.getAll(user.uid, true).then(categoriesList => {
          const expenseCategories = (categoriesList || []).filter(cat => cat.type === 'expense');
          console.log('[MonthlyBills] Reloaded expense categories on focus:', expenseCategories.length, 'items');
          setCategories(expenseCategories);
        }).catch(err => {
          console.error('[MonthlyBills] Error reloading categories on focus:', err);
        });
      }
    };

    // Recarregar quando a página fica visível novamente
    document.addEventListener('visibilitychange', handleFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [user?.uid]);

  const loadData = async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      console.log('[MonthlyBills] Loading data for month:', selectedMonth, 'uid:', user.uid);
      const [payablesList, categoriesList] = await Promise.all([
        payableService.getByMonth(selectedMonth, user.uid).catch(err => {
          console.error('[MonthlyBills] Error in getByMonth:', err);
          return []; // Retornar array vazio em caso de erro
        }),
        categoryService.getAll(user.uid).catch(err => {
          console.error('[MonthlyBills] Error in getAll categories:', err);
          console.error('[MonthlyBills] Error details:', err.message, err.stack);
          return []; // Retornar array vazio em caso de erro
        }),
      ]);
      console.log('[MonthlyBills] Loaded payables:', payablesList?.length || 0, 'items');
      console.log('[MonthlyBills] Loaded categories (all):', categoriesList?.length || 0, 'total');
      console.log('[MonthlyBills] All categories details:', categoriesList?.map(c => ({ id: c.id, name: c.name, type: c.type, uid: c.uid })) || []);
      const expenseCategories = (categoriesList || []).filter(cat => cat.type === 'expense');
      console.log('[MonthlyBills] Expense categories:', expenseCategories.length, 'items');
      console.log('[MonthlyBills] Expense categories names:', expenseCategories.map(c => c.name));
      setPayables(payablesList || []);
      setCategories(expenseCategories);
    } catch (error) {
      console.error("[MonthlyBills] Error loading data:", error);
      console.error("[MonthlyBills] Error stack:", error.stack);
      alert("Erro ao carregar despesas mensais: " + (error.message || "Erro desconhecido"));
      setPayables([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.uid) return;
    
    try {
      if (editingTemplateId) {
        // Editar template existente
        await payableService.updateTemplate(editingTemplateId, {
          title: formData.title,
          amount: parseFloat(formData.amount),
          dueDay: parseInt(formData.dueDay, 10) || 10,
          categoryId: formData.categoryId,
          notes: formData.notes || '',
        });
        alert("Template atualizado com sucesso!");
      } else {
        // Criar novo template
        await payableService.createTemplate({
          title: formData.title,
          amount: parseFloat(formData.amount),
          dueDay: parseInt(formData.dueDay, 10) || 10,
          categoryId: formData.categoryId,
          notes: formData.notes || '',
          uid: user.uid,
          initialMonthKey: selectedMonth, // Garantir que aparece no mês selecionado
        });
        alert("Despesa mensal criada com sucesso! Ela aparecerá em todos os meses.");
      }
      
      setShowForm(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error("Error creating/updating template:", error);
      alert("Erro ao salvar despesa mensal: " + (error.message || "Erro desconhecido"));
    }
  };

  const handleToggleStatus = async (statusId, monthKey) => {
    if (!user?.uid) return;
    if (togglingStatusId === statusId) return; // Evitar cliques duplos
    
    const currentPayable = payables.find(p => p.id === statusId);
    if (!currentPayable) return;
    
    // Se está marcando como pago, verificar se precisa selecionar conta
    if (currentPayable.status === 'open') {
      // Buscar banco principal
      try {
        const primaryAccount = await accountService.getPrimaryAccount(user.uid);
        console.log('[MonthlyBills] handleToggleStatus - Primary account:', primaryAccount);
        
        if (primaryAccount && primaryAccount.id) {
          // Tem banco principal, usar automaticamente
          console.log('[MonthlyBills] handleToggleStatus - Using primary account:', {
            id: primaryAccount.id,
            name: primaryAccount.name,
            balance: primaryAccount.balance
          });
          await executeToggleStatus(statusId, monthKey, primaryAccount.id);
        } else {
          // Não tem banco principal, mostrar modal para selecionar
          console.log('[MonthlyBills] handleToggleStatus - No primary account, showing modal');
          setPendingStatusId(statusId);
          setPendingMonthKey(monthKey);
          setShowAccountModal(true);
        }
      } catch (error) {
        console.error('[MonthlyBills] handleToggleStatus - Error fetching primary account:', error);
        // Em caso de erro, mostrar modal para selecionar
        setPendingStatusId(statusId);
        setPendingMonthKey(monthKey);
        setShowAccountModal(true);
      }
    } else {
      // Está desmarcando (marcando como não pago), não precisa de conta
      await executeToggleStatus(statusId, monthKey, null);
    }
  };

  const executeToggleStatus = async (statusId, monthKey, accountId) => {
    if (!user?.uid) return;
    
    // Salvar estado anterior para rollback se necessário
    const previousPayables = [...payables];
    
    // Encontrar o item atual para fazer rollback se necessário
    const currentPayable = payables.find(p => p.id === statusId);
    if (!currentPayable) return;
    
    // Atualização otimista: atualizar estado local imediatamente
    const newStatus = currentPayable.status === 'paid' ? 'open' : 'paid';
    const updatedPayables = payables.map(p => 
      p.id === statusId 
        ? { 
            ...p, 
            status: newStatus,
            paidAtISO: newStatus === 'paid' ? new Date().toISOString() : null,
          }
        : p
    );
    setPayables(updatedPayables);
    setTogglingStatusId(statusId);
    
    try {
      // Fazer a chamada à API em background
      console.log('[MonthlyBills] executeToggleStatus - Calling toggleStatus with accountId:', accountId);
      await payableService.toggleStatus(statusId, monthKey, user.uid, accountId);
      console.log('[MonthlyBills] executeToggleStatus - Status toggled successfully');
      // Não precisa recarregar tudo, apenas atualizar o item se necessário
      // O dashboard será recalculado automaticamente pela criação/deleção da transação
    } catch (error) {
      console.error("Error toggling status:", error);
      // Reverter para o estado anterior em caso de erro
      setPayables(previousPayables);
      alert("Erro ao atualizar status: " + (error.message || "Erro desconhecido"));
    } finally {
      setTogglingStatusId(null);
    }
  };

  const handleAccountSelect = async (account) => {
    if (pendingStatusId && pendingMonthKey) {
      await executeToggleStatus(pendingStatusId, pendingMonthKey, account.id);
      setPendingStatusId(null);
      setPendingMonthKey(null);
    }
    setShowAccountModal(false);
  };

  const handleDelete = async (templateId) => {
    if (!confirm("Tem certeza que deseja excluir esta despesa mensal?\n\nIsso removerá a despesa de todos os meses futuros e passados.")) return;
    
    try {
      await payableService.deleteTemplate(templateId);
      alert("Despesa mensal excluída com sucesso!");
      loadData();
    } catch (error) {
      console.error("Error deleting template:", error);
      alert("Erro ao excluir despesa mensal: " + (error.message || "Erro desconhecido"));
    }
  };

  const handleStartEditAmount = (payable) => {
    setEditingAmountId(payable.id);
    setEditingAmountValue(payable.amount?.toString() || "0");
  };

  const handleCancelEditAmount = () => {
    setEditingAmountId(null);
    setEditingAmountValue("");
  };

  const handleSaveAmount = async (payable) => {
    if (!user?.uid) return;
    
    const newAmount = parseFloat(editingAmountValue);
    if (isNaN(newAmount) || newAmount < 0) {
      alert("Valor inválido");
      return;
    }

    try {
      await payableService.updateAmount(payable.id, newAmount, payable.monthKey, user.uid);
      setEditingAmountId(null);
      setEditingAmountValue("");
      loadData(); // Recarregar para atualizar a lista
    } catch (error) {
      console.error("Error updating amount:", error);
      alert("Erro ao atualizar valor: " + (error.message || "Erro desconhecido"));
    }
  };

  const handleEdit = (payable) => {
    setEditingTemplateId(payable.templateId);
    setFormData({
      title: payable.title || "",
      amount: payable.amount?.toString() || "",
      dueDay: payable.dueDay?.toString() || "10",
      categoryId: payable.categoryId || "",
      notes: payable.notes || "",
    });
    setShowForm(true);
    // Scroll para o topo para ver o formulário
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTemplateId(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      amount: "",
      dueDay: "10",
      categoryId: "",
      notes: "",
    });
    setEditingTemplateId(null);
  };

  if (loading) {
    return <div className="monthly-bills__loading">Carregando...</div>;
  }

  // Debug: verificar estado do showForm
  console.log('[MonthlyBills] Render - showForm:', showForm, 'Fab should render:', !showForm, 'user?.uid:', user?.uid);

  return (
    <div className="monthly-bills">
      <div className="monthly-bills__header">
        <h1 className="monthly-bills__title">Despesas Mensais</h1>
        <div className="monthly-bills__controls">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="monthly-bills__month-selector"
          />
          <Button onClick={async () => {
            if (!showForm) {
              // Quando abrir o formulário, recarregar categorias para garantir que estão atualizadas
              if (!user?.uid) {
                alert('Usuário não encontrado. Por favor, faça login novamente.');
                return;
              }
              
              console.log('[MonthlyBills] Opening form, reloading categories for uid:', user.uid);
              try {
                const categoriesList = await categoryService.getAll(user.uid, true);
                const expenseCategories = (categoriesList || []).filter(cat => cat.type === 'expense');
                console.log('[MonthlyBills] Reloaded expense categories for form:', expenseCategories.length, 'items');
                setCategories(expenseCategories);
              } catch (err) {
                console.error('[MonthlyBills] Error reloading categories when opening form:', err);
                alert('Erro ao carregar categorias. Por favor, tente novamente.');
              }
            }
            resetForm();
            setShowForm(!showForm);
          }}>
            {showForm ? "Cancelar" : "Nova Despesa Mensal"}
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="monthly-bills__form-card">
          <h2 className="monthly-bills__form-title">
            {editingTemplateId ? "Editar Despesa Mensal" : "Nova Despesa Mensal"}
          </h2>
          <p className="monthly-bills__form-hint">
            {editingTemplateId 
              ? "Alterações afetarão todos os meses futuros." 
              : "Esta despesa aparecerá automaticamente em todos os meses futuros e no mês atual."}
          </p>
          <form onSubmit={handleSubmit} className="monthly-bills__form">
            <Input
              label="Título"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />

            <Input
              label="Valor"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />

            <Input
              label="Dia de Vencimento (1-31)"
              type="number"
              min="1"
              max="31"
              value={formData.dueDay}
              onChange={(e) => {
                const day = e.target.value;
                if (day === '' || (day >= 1 && day <= 31)) {
                  setFormData({ ...formData, dueDay: day });
                }
              }}
              required
              placeholder="10"
            />

            <Select
              label="Categoria"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              options={categories.map((cat) => ({ value: cat.id, label: cat.name }))}
              required
              placeholder={categories.length === 0 ? "Nenhuma categoria de despesa cadastrada" : "Selecione uma categoria"}
            />

            <Input
              label="Notas (opcional)"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />

            <div className="monthly-bills__form-actions">
              <Button type="submit" variant="primary">
                {editingTemplateId ? "Atualizar" : "Criar"}
              </Button>
              <Button type="button" variant="secondary" onClick={handleCancel}>
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        {payables.length === 0 ? (
          <p className="monthly-bills__empty">
            Nenhuma despesa mensal cadastrada para este mês.
            <br />
            <small>As despesas mensais aparecem automaticamente em todos os meses.</small>
          </p>
        ) : (
          <div className="monthly-bills__list">
            {payables.map((payable) => (
              <div
                key={payable.templateId}
                className={`monthly-bills__item ${
                  payable.status === "paid" ? "monthly-bills__item--paid" : ""
                }`}
              >
                <div className="monthly-bills__item-checkbox">
                  <input
                    type="checkbox"
                    checked={payable.status === "paid"}
                    onChange={() => handleToggleStatus(payable.id, payable.monthKey)}
                    disabled={togglingStatusId === payable.id}
                    className="monthly-bills__checkbox"
                    title={payable.status === "paid" 
                      ? "Marcar como não pago (remove transação automática)" 
                      : "Marcar como pago (cria transação automática)"}
                  />
                  {togglingStatusId === payable.id && (
                    <span className="monthly-bills__checkbox-loading">⏳</span>
                  )}
                </div>
                <div className="monthly-bills__item-content">
                  <div className="monthly-bills__item-header">
                    <strong className="monthly-bills__item-title">
                      {payable.title || "Sem título"}
                    </strong>
                    {editingAmountId === payable.id ? (
                      <div className="monthly-bills__item-amount-edit">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editingAmountValue}
                          onChange={(e) => setEditingAmountValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveAmount(payable);
                            } else if (e.key === 'Escape') {
                              handleCancelEditAmount();
                            }
                          }}
                          autoFocus
                          className="monthly-bills__amount-input"
                        />
                        <div className="monthly-bills__amount-actions">
                          <button
                            type="button"
                            onClick={() => handleSaveAmount(payable)}
                            className="monthly-bills__amount-save"
                            title="Salvar (Enter)"
                          >
                            ✓
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEditAmount}
                            className="monthly-bills__amount-cancel"
                            title="Cancelar (Esc)"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="monthly-bills__item-amount monthly-bills__item-amount--editable"
                        onClick={() => handleStartEditAmount(payable)}
                        title="Clique para editar o valor"
                      >
                        <span className="monthly-bills__amount-value">
                          {formatCurrency(payable.amount || 0)}
                          {payable.amountOverride !== undefined && payable.amountOverride !== null && (
                            <span className="monthly-bills__amount-override-indicator" title="Valor personalizado para este mês">
                              *
                            </span>
                          )}
                        </span>
                        <span className="monthly-bills__amount-edit-icon" title="Editar valor">
                          ✏️
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="monthly-bills__item-meta">
                    <span>Vencimento: dia {payable.dueDay || 10}</span>
                    <span>•</span>
                    <span>{formatDate(payable.dueDate)}</span>
                    <span>•</span>
                    <span>{payable.categoryName || "Sem categoria"}</span>
                    {payable.notes && (
                      <>
                        <span>•</span>
                        <span className="monthly-bills__item-notes">{payable.notes}</span>
                      </>
                    )}
                    {payable.status === "paid" && payable.paidAtISO && (
                      <>
                        <span>•</span>
                        <span className="monthly-bills__item-paid">
                          Pago em {formatDate(payable.paidAtISO)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="monthly-bills__item-actions">
                  <Button
                    variant="secondary"
                    onClick={() => handleEdit(payable)}
                    className="monthly-bills__item-edit"
                  >
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(payable.templateId)}
                    className="monthly-bills__item-delete"
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <AccountSelectModal
        isOpen={showAccountModal}
        onClose={() => {
          setShowAccountModal(false);
          setPendingStatusId(null);
          setPendingMonthKey(null);
        }}
        onSelect={handleAccountSelect}
        title="Selecione a conta bancária para pagar esta despesa"
        uid={user?.uid}
      />

      {/* FAB: sempre visível quando o formulário não está aberto */}
      {!showForm ? (
        <Fab
          onClick={async () => {
            console.log('[MonthlyBills] FAB button clicked!');
            if (!user?.uid) {
              alert('Usuário não encontrado. Por favor, faça login novamente.');
              return;
            }
            
            console.log('[MonthlyBills] FAB clicked, opening form, reloading categories for uid:', user.uid);
            try {
              const categoriesList = await categoryService.getAll(user.uid, true);
              const expenseCategories = (categoriesList || []).filter(cat => cat.type === 'expense');
              console.log('[MonthlyBills] Reloaded expense categories for FAB:', expenseCategories.length, 'items');
              setCategories(expenseCategories);
              
              // Abrir formulário
              resetForm();
              setShowForm(true);
              // Scroll para o topo para ver o formulário
              setTimeout(() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }, 100);
            } catch (err) {
              console.error('[MonthlyBills] Error reloading categories when FAB clicked:', err);
              alert('Erro ao carregar categorias. Por favor, tente novamente.');
            }
          }}
          label="Nova Despesa Mensal"
        />
      ) : null}
    </div>
  );
}
