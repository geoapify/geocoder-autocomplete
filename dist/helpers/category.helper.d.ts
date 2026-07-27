import { Category } from "../types/external";
export declare class CategoryManager {
    private selectedCategory;
    private isCategoryMode;
    setCategory(category: Category | string | string[] | null): void;
    getCategory(): Category | null;
    isCategoryModeActive(): boolean;
    clearCategory(): void;
    extractCategoriesFromResponse(data: any): Category[];
}
