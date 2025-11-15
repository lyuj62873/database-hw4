import {MySQLSource} from "../../../data-sources/MySQLSource";
import {DimFilm} from "../../../entities/target/DimFilm";
import {Film} from "../../../entities/source/Film";
import {EntityManager} from "typeorm";

export async function loadDimFilm(manager?: EntityManager) {
    const filmRepo = MySQLSource.getRepository(Film);

    const dimFilmRepo = manager
        ? manager.getRepository(DimFilm)
        : (await import("../../../data-sources/SQLiteTarget")).SQLiteTarget.getRepository(DimFilm);

    const films = await filmRepo.find({relations: ["language"]});

    let offset = 10000;

    const dimFilms = films.map(film => dimFilmRepo.create({
        film_key: film.film_id + offset,
        film_id: film.film_id,
        title: film.title,
        rating: film.rating ?? "",
        length: film.length ?? 0,
        language: film.language?.name ?? "",
        release_year: film.release_year ?? 0,
        last_update: film.last_update.toISOString()
    }));

    await dimFilmRepo.save(dimFilms);

    console.log(`Loaded ${dimFilms.length} films into dim_film.`);
}
