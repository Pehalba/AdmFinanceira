import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = join(__dirname, 'db');

/**
 * Sistema de armazenamento baseado em arquivos JSON
 * Simula um banco de dados simples
 */
class Storage {
  constructor() {
    // Criar diretório de forma síncrona para garantir que existe
    this.ensureDataDirSync();
  }

  ensureDataDirSync() {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  getFilePath(collection) {
    return join(DATA_DIR, `${collection}.json`);
  }

  /**
   * Carrega dados de uma collection
   */
  async load(collection) {
    try {
      const filePath = this.getFilePath(collection);
      if (!existsSync(filePath)) {
        return [];
      }
      const data = await readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error loading ${collection}:`, error);
      return [];
    }
  }

  /**
   * Salva dados em uma collection
   */
  async save(collection, data) {
    try {
      const filePath = this.getFilePath(collection);
      await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    } catch (error) {
      console.error(`Error saving ${collection}:`, error);
      throw error;
    }
  }

  /**
   * Busca por ID
   */
  async findById(collection, id) {
    const items = await this.load(collection);
    return items.find((item) => item.id === id) || null;
  }

  /**
   * Cria novo item
   */
  async create(collection, item) {
    const items = await this.load(collection);
    const newItem = {
      ...item,
      id: item.id || this.generateId(),
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    items.push(newItem);
    await this.save(collection, items);
    return newItem;
  }

  /**
   * Atualiza item
   */
  async update(collection, id, updates) {
    const items = await this.load(collection);
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error(`${collection} not found`);
    }
    items[index] = {
      ...items[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await this.save(collection, items);
    return items[index];
  }

  /**
   * Deleta item
   */
  async delete(collection, id) {
    const items = await this.load(collection);
    const filtered = items.filter((item) => item.id !== id);
    await this.save(collection, filtered);
    return true;
  }

  /**
   * Busca com filtros
   */
  async find(collection, filterFn) {
    const items = await this.load(collection);
    return items.filter(filterFn);
  }

  /**
   * Busca todos
   */
  async findAll(collection) {
    return await this.load(collection);
  }

  /**
   * Gera ID único
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }
}

export const storage = new Storage();
