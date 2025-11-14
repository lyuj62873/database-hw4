import { MySQLSource } from "../../../data-sources/MySQLSource";
import { DimCategory } from "../../../entities/target/DimCategory";
import { Category } from "../../../entities/source/Category";
import { EntityManager } from "typeorm";

export async function loadDimCategory(manager?: EntityManager) {
    const categoryRepo = MySQLSource.getRepository(Category);

    const dimCategoryRepo = manager
        ? manager.getRepository(DimCategory)
        : (await import("../../../data-sources/SQLiteTarget")).SQLiteTarget.getRepository(DimCategory);

    const categories = await categoryRepo.find();
    const offset = 30000;

    const dimCategories = categories.map(category =>
        dimCategoryRepo.create({
            category_key: category.category_id + offset,
            category_id: category.category_id,
            name: category.name,
            last_update: category.last_update.toISOString()
        })
    );

    await dimCategoryRepo.save(dimCategories);

    console.log(`Loaded ${dimCategories.length} categories into dim_category.`);
}
