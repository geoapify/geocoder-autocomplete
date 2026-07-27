export class CategoryManager {
    selectedCategory = null;
    isCategoryMode = false;
    setCategory(category) {
        if (category === null) {
            this.clearCategory();
            return;
        }
        if (typeof category === 'string') {
            // Convert single string to array
            this.selectedCategory = { keys: [category], label: category };
        }
        else if (Array.isArray(category)) {
            // Convert array of strings to Category with joined label
            this.selectedCategory = { keys: category, label: category.join(', ') };
        }
        else {
            this.selectedCategory = category;
        }
        this.isCategoryMode = true;
    }
    getCategory() {
        return this.selectedCategory;
    }
    isCategoryModeActive() {
        return this.isCategoryMode && this.selectedCategory !== null;
    }
    clearCategory() {
        this.selectedCategory = null;
        this.isCategoryMode = false;
    }
    extractCategoriesFromResponse(data) {
        if (!data?.query?.categories) {
            return [];
        }
        return data.query.categories.map((cat) => ({
            // Normalize category to always be an array
            keys: cat.keys,
            label: cat.label
        }));
    }
}
