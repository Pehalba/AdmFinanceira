import { useState, useEffect } from 'react';
import { Modal } from '../Modal/Modal';
import { Button } from '../Button/Button';
import { accountService } from '../../scripts/services/accountService';
import { formatCurrency } from '../../scripts/utils/dateUtils';
import './AccountSelectModal.css';

export function AccountSelectModal({ isOpen, onClose, onSelect, title = 'Selecione a conta bancária', uid }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccountId, setSelectedAccountId] = useState(null);

  useEffect(() => {
    if (isOpen && uid) {
      loadAccounts();
    }
  }, [isOpen, uid]);

  const loadAccounts = async () => {
    if (!uid) return;
    
    setLoading(true);
    try {
      const accountsList = await accountService.getAll(uid, true);
      setAccounts(accountsList || []);
      
      // Pré-selecionar banco principal se existir
      const primaryAccount = accountsList?.find(acc => acc.isPrimary);
      if (primaryAccount) {
        setSelectedAccountId(primaryAccount.id);
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (selectedAccountId) {
      const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);
      onSelect(selectedAccount);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      {loading ? (
        <div className="account-select-modal__loading">Carregando contas...</div>
      ) : accounts.length === 0 ? (
        <div className="account-select-modal__empty">
          <p>Nenhuma conta bancária cadastrada.</p>
          <p className="account-select-modal__empty-hint">
            Cadastre uma conta na página de Bancos primeiro.
          </p>
        </div>
      ) : (
        <>
          <div className="account-select-modal__list">
            {accounts.map((account) => (
              <div
                key={account.id}
                className={`account-select-modal__item ${
                  selectedAccountId === account.id ? 'account-select-modal__item--selected' : ''
                } ${account.isPrimary ? 'account-select-modal__item--primary' : ''}`}
                onClick={() => setSelectedAccountId(account.id)}
              >
                <div className="account-select-modal__item-content">
                  <div className="account-select-modal__item-name">
                    {account.name}
                    {account.isPrimary && (
                      <span className="account-select-modal__primary-badge">Principal</span>
                    )}
                  </div>
                  <div className="account-select-modal__item-meta">
                    {formatCurrency(account.balance || 0)} •{' '}
                    {account.type === 'checking' ? 'Conta Corrente' : 
                     account.type === 'savings' ? 'Poupança' : 
                     account.type || 'Outro'}
                  </div>
                </div>
                <div className="account-select-modal__item-radio">
                  <input
                    type="radio"
                    name="account"
                    checked={selectedAccountId === account.id}
                    onChange={() => setSelectedAccountId(account.id)}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="account-select-modal__actions">
            <Button onClick={onClose} variant="secondary">
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirm} 
              variant="primary"
              disabled={!selectedAccountId}
            >
              Confirmar
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
