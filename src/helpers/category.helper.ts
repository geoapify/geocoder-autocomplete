import { Category } from "../types/external";

export class CategoryManager {
    private selectedCategory: Category | null = null;
    private isCategoryMode: boolean = false;

    public setCategory(category: Category | string | string[] | null): void {
        if (category === null) {
            this.clearCategory();
            return;
        }

        if (typeof category === 'string') {
            // Convert single string to array
            this.selectedCategory = { category: [category], label: category };
        } else if (Array.isArray(category)) {
            // Convert array of strings to Category with joined label
            this.selectedCategory = { category, label: category.join(', ') };
        } else {
            this.selectedCategory = category;
        }

        this.isCategoryMode = true;
    }

    public getCategory(): Category | null {
        return this.selectedCategory;
    }

    public isCategoryModeActive(): boolean {
        return this.isCategoryMode && this.selectedCategory !== null;
    }

    public clearCategory(): void {
        this.selectedCategory = null;
        this.isCategoryMode = false;
    }

    public extractCategoriesFromResponse(data: any): Category[] {
        if (!data?.query?.categories) {
            return [];
        }

        return data.query.categories.map((cat: any) => ({
            // Normalize category to always be an array
            category: Array.isArray(cat.category) ? cat.category : [cat.category],
            label: cat.label
        }));
    }

}
