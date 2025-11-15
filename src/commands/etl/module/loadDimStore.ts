import {MySQLSource} from "../../../data-sources/MySQLSource";
import {Store} from "../../../entities/source/Store";
import {DimStore} from "../../../entities/target/DimStore";
import {EntityManager} from "typeorm";

export async function loadDimStore(manager?: EntityManager) {
    const storeRepo = MySQLSource.getRepository(Store);

    const dimStoreRepo = manager
        ? manager.getRepository(DimStore)
        : (await import("../../../data-sources/SQLiteTarget")).SQLiteTarget.getRepository(DimStore);

    const stores = await storeRepo.find({relations: ["address", "address.city", "address.city.country"]});

    const offset = 1000;

    const dimStores = stores.map(store =>
        dimStoreRepo.create({
            store_key: store.store_id + offset,
            store_id: store.store_id,
            city: store.address.city.city,
            country: store.address.city.country.country,
            last_update: store.last_update.toISOString()
        })
    );

    await dimStoreRepo.save(dimStores);

    console.log(`Loaded ${dimStores.length} stores into dim_store.`);
}
