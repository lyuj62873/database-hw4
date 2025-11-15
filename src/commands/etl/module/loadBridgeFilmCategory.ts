import {MySQLSource} from "../../../data-sources/MySQLSource";
import {SQLiteTarget} from "../../../data-sources/SQLiteTarget";
import {DimFilm} from "../../../entities/target/DimFilm";
import {DimCategory} from "../../../entities/target/DimCategory";
import {BridgeFilmCategory} from "../../../entities/target/BridgeFilmCategory";
import {FilmCategory} from "../../../entities/source/FilmCategory";
import {EntityManager} from "typeorm";

export async function loadBridgeFilmCategory(manager?: EntityManager) {
    const filmCategoryRepo = MySQLSource.getRepository(FilmCategory);
    const dimFilmRepo = manager
        ? manager.getRepository(DimFilm)
        : SQLiteTarget.getRepository(DimFilm);
    const dimCategoryRepo = manager
        ? manager.getRepository(DimCategory)
        : SQLiteTarget.getRepository(DimCategory);
    const bridgeRepo = manager
        ? manager.getRepository(BridgeFilmCategory)
        : SQLiteTarget.getRepository(BridgeFilmCategory);

    const filmCategories = await filmCategoryRepo.find();
    const dimFilms = await dimFilmRepo.find();
    const dimCategories = await dimCategoryRepo.find();

    const bridgeData = filmCategories.map(fc => {
        const filmSurrogate = dimFilms.find(df => df.film_id === fc.film_id);
        const categorySurrogate = dimCategories.find(dc => dc.category_id === fc.category_id);

        if (!filmSurrogate || !categorySurrogate) {
            throw new Error(`Cannot find surrogate key for film_id=${fc.film_id} or category_id=${fc.category_id}`);
        }

        return bridgeRepo.create({
            film_key: filmSurrogate.film_key,
            category_key: categorySurrogate.category_key
        });
    });

    await bridgeRepo.save(bridgeData);

    console.log(`Loaded ${bridgeData.length} rows into bridge_film_category.`);
}
