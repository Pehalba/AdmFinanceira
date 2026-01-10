import { useState, useEffect } from 'react';
import { Button } from '../../blocks/Button/Button';
import { Card } from '../../blocks/Card/Card';
import { Input } from '../../blocks/Input/Input';
import { Select } from '../../blocks/Select/Select';
import { categoryService } from '../../scripts/services/categoryService';
import './Categories.css';

export function Categories({ user }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
    color: '#2563eb',
  });

  useEffect(() => {
    if (user?.uid) {
      loadCategories();
    } else {
      setLoading(false);
    }
  }, [user?.uid]);

  const loadCategories = async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      console.log('[Categories] Loading categories for uid:', user.uid);
      const cats = await categoryService.getAll(user.uid);
      console.log('[Categories] Loaded categories:', cats.length, 'items');
      setCategories(cats);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await categoryService.create({
        ...formData,
        uid: user.uid,
      });
      setShowForm(false);
      setFormData({ name: '', type: 'expense', color: '#2563eb' });
      loadCategories();
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Erro ao criar categoria');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;
    try {
      await categoryService.delete(id, user.uid);
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Erro ao excluir categoria');
    }
  };

  if (loading) {
    return <div className="categories__loading">Carregando...</div>;
  }

  return (
    <div className="categories">
      <div className="categories__header">
        <h1 className="categories__title">Categorias</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : 'Nova Categoria'}
        </Button>
      </div>

      {showForm && (
        <Card className="categories__form-card">
          <h2 className="categories__form-title">Nova Categoria</h2>
          <form onSubmit={handleSubmit} className="categories__form">
            <Input
              label="Nome"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <Select
              label="Tipo"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={[
                { value: 'income', label: 'Receita' },
                { value: 'expense', label: 'Despesa' },
              ]}
              required
            />

            <Input
              label="Cor"
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            />

            <Button type="submit" variant="primary">
              Salvar
            </Button>
          </form>
        </Card>
      )}

      <div className="categories__grid">
        {categories.length === 0 ? (
          <Card>
            <p className="categories__empty">Nenhuma categoria cadastrada</p>
          </Card>
        ) : (
          categories.map((category) => (
            <Card key={category.id} className="categories__card">
              <div className="categories__card-header">
                <div
                  className="categories__card-color"
                  style={{ backgroundColor: category.color }}
                />
                <h3 className="categories__card-name">{category.name}</h3>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(category.id)}
                  className="categories__card-delete"
                >
                  Excluir
                </Button>
              </div>
              <div className="categories__card-type">
                {category.type === 'income' ? 'Receita' : 'Despesa'}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
