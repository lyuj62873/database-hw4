import {MySQLSource} from "../../../data-sources/MySQLSource";
import {SQLiteTarget} from "../../../data-sources/SQLiteTarget";
import {FilmActor} from "../../../entities/source/FilmActor";
import {DimFilm} from "../../../entities/target/DimFilm";
import {DimActor} from "../../../entities/target/DimActor";
import {BridgeFilmActor} from "../../../entities/target/BridgeFilmActor";
import {EntityManager} from "typeorm";

export async function loadBridgeFilmActor(manager?: EntityManager) {
    const filmActorRepo = MySQLSource.getRepository(FilmActor);
    const dimFilmRepo = manager
        ? manager.getRepository(DimFilm)
        : SQLiteTarget.getRepository(DimFilm);
    const dimActorRepo = manager
        ? manager.getRepository(DimActor)
        : SQLiteTarget.getRepository(DimActor);
    const bridgeRepo = manager
        ? manager.getRepository(BridgeFilmActor)
        : SQLiteTarget.getRepository(BridgeFilmActor);

    const filmActors = await filmActorRepo.find();
    const dimFilms = await dimFilmRepo.find();
    const dimActors = await dimActorRepo.find();

    const bridgeData = filmActors.map(fa => {
        const filmSurrogate = dimFilms.find(df => df.film_id === fa.film_id);
        const actorSurrogate = dimActors.find(da => da.actor_id === fa.actor_id);

        if (!filmSurrogate || !actorSurrogate) {
            throw new Error(`Cannot find surrogate key for film_id=${fa.film_id} or actor_id=${fa.actor_id}`);
        }

        return bridgeRepo.create({
            film_key: filmSurrogate.film_key,
            actor_key: actorSurrogate.actor_key
        });
    });

    await bridgeRepo.save(bridgeData);

    console.log(`Loaded ${bridgeData.length} rows into bridge_film_actor.`);
}
