import {
  categoryRepository,
  userMetaRepository,
} from "../repositories/index.js";
import { cacheManager } from "../cache/cacheManager.js";

/**
 * Serviço de categorias
 */
class CategoryService {
  /**
   * Cria nova categoria
   */
  async create(categoryData) {
    const category = await categoryRepository.create(categoryData);
    // Invalidar cache para forçar reload
    await this.invalidateCache(categoryData.uid);
    return category;
  }

  /**
   * Atualiza categoria
   */
  async update(id, updates) {
    const category = await categoryRepository.update(id, updates);
    await this.invalidateCache(updates.uid);
    return category;
  }

  /**
   * Deleta categoria
   */
  async delete(id, uid) {
    await categoryRepository.delete(id);
    await this.invalidateCache(uid);
  }

  /**
   * Obtém todas as categorias (usa cache se disponível)
   * Filtra por uid se fornecido
   */
  async getAll(uid, forceReload = false) {
    // Validar uid primeiro
    if (!uid || uid === "undefined" || uid === "null") {
      console.warn(
        "[CategoryService] Invalid uid provided:",
        uid,
        "- returning empty array"
      );
      return [];
    }

    // Se forceReload, limpar cache primeiro
    if (forceReload) {
      console.log("[CategoryService] Force reload requested, clearing cache");
      cacheManager.clearCategories();
    }

    // Sempre buscar do repositório (cache pode ter categorias de outros usuários)
    // Em produção, o cache seria por usuário, mas aqui vamos garantir que está correto
    console.log(
      "[CategoryService] Loading categories from repository, uid:",
      uid,
      "forceReload:",
      forceReload
    );
    const allCategories = await categoryRepository.getAll();
    console.log(
      "[CategoryService] All categories from repository:",
      allCategories?.length || 0
    );

    // Filtrar por uid se fornecido (categorias sem uid não são incluídas)
    let categories = [];
    if (uid) {
      // Debug: ver todas as categorias e seus uids
      console.log(
        "[CategoryService] All categories with uids:",
        allCategories?.map((c) => ({
          id: c.id,
          name: c.name,
          type: c.type,
          uid: c.uid,
        })) || []
      );
      categories = (allCategories || []).filter((cat) => cat.uid === uid);
      console.log(
        "[CategoryService] Filtered categories by uid:",
        categories.length,
        "items (from",
        allCategories?.length || 0,
        "total)"
      );
      console.log(
        "[CategoryService] Filtered categories details:",
        categories.map((c) => ({
          id: c.id,
          name: c.name,
          type: c.type,
          uid: c.uid,
        }))
      );
    } else {
      // Se uid não foi fornecido, retornar array vazio (não retornar todas)
      // Isso evita problemas quando user ainda não está carregado
      console.warn(
        "[CategoryService] No uid provided, returning empty array (user may not be loaded yet)"
      );
      categories = [];
    }

    // Salvar no cache (apenas as categorias filtradas deste usuário)
    // Nota: em um sistema multi-usuário real, o cache deveria ser por usuário
    if (uid && categories.length > 0) {
      const version = Date.now();
      cacheManager.saveCategories(categories, version);

      // Atualizar versão no meta
      await this.updateMetaVersion(uid, version, "categories").catch((err) => {
        console.error("[CategoryService] Error updating meta version:", err);
      });
    }

    console.log(
      "[CategoryService] Returning categories:",
      categories.length,
      "items"
    );
    return categories;
  }

  /**
   * Obtém categoria por ID
   */
  async getById(id) {
    return await categoryRepository.getById(id);
  }

  /**
   * Invalida cache de categories
   */
  async invalidateCache(uid) {
    cacheManager.clearCategories();
    const version = Date.now();
    await this.updateMetaVersion(uid, version, "categories");
  }

  /**
   * Atualiza versão no meta
   */
  async updateMetaVersion(uid, version, type) {
    const appMeta = (await userMetaRepository.getAppMeta(uid)) || {};
    const fieldName = `${type}Version`;
    await userMetaRepository.updateAppMeta(uid, {
      ...appMeta,
      [fieldName]: version,
    });
  }
}

export const categoryService = new CategoryService();
