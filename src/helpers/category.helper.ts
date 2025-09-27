import { Category } from "../types/external";

export class CategoryManager {
    private selectedCategory: Category | null = null;
    private isCategoryMode: boolean = false;

    public setCategory(category: Category | string | null): void {
        if (category === null) {
            this.clearCategory();
            return;
        }

        if (typeof category === 'string') {
            this.selectedCategory = { category, label: category };
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
            category: cat.category,
            label: cat.label
        }));
    }

}
