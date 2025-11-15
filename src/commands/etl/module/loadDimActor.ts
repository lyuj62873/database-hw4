import {MySQLSource} from "../../../data-sources/MySQLSource";
import {DimActor} from "../../../entities/target/DimActor";
import {Actor} from "../../../entities/source/Actor";
import {EntityManager} from "typeorm";

export async function loadDimActor(manager?: EntityManager) {
    const actorRepo = MySQLSource.getRepository(Actor);

    const dimActorRepo = manager
        ? manager.getRepository(DimActor)
        : (await import("../../../data-sources/SQLiteTarget")).SQLiteTarget.getRepository(DimActor);

    const actors = await actorRepo.find();

    const dimActors = actors.map(actor => {
        return dimActorRepo.create({
            actor_key: actor.actor_id + 50000,
            actor_id: actor.actor_id,
            first_name: actor.first_name,
            last_name: actor.last_name,
            last_update: actor.last_update.toISOString().slice(0, 10)
        });
    });

    await dimActorRepo.save(dimActors);

    console.log(`Loaded ${dimActors.length} dim_actor rows.`);
}
