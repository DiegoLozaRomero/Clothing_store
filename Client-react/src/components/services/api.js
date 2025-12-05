const API_BASE_URL = import.meta.env.VITE_API_URL;

export const apiService = {
  async getProducts() {
    const response = await fetch(`${API_BASE_URL}/products`);
    const data = await response.json();
    return data;
  },

  async getCategories() {
    const response = await fetch(`${API_BASE_URL}/categories`);
    const data = await response.json();
    return data;
  },

  async getProductsByGender(gender) {
    const response = await fetch(`${API_BASE_URL}/products`);
    const data = await response.json();
    if (data.status === 'success') {
      return data.data.filter(product =>
        product.genero && product.genero.toLowerCase() === gender.toLowerCase()
      );
    }
    return [];
  },

  async getProductsByCategory(categoryId) {
    const response = await fetch(`${API_BASE_URL}/products`);
    const data = await response.json();
    if (data.status === 'success') {
      return data.data.filter(product =>
        product.categoria_id === categoryId
      );
    }
    return [];
  },

  async getProductsByGenderAndCategory(gender, categoryId) {
    const response = await fetch(`${API_BASE_URL}/products`);
    const data = await response.json();
    if (data.status === 'success') {
      return data.data.filter(product =>
        product.genero &&
        product.genero.toLowerCase() === gender.toLowerCase() &&
        product.categoria_id === categoryId
      );
    }
    return [];
  }
};
