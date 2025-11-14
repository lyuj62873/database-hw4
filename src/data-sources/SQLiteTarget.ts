import {DataSource} from "typeorm";
import {BridgeFilmActor} from "../entities/target/BridgeFilmActor";
import {BridgeFilmCategory} from "../entities/target/BridgeFilmCategory";
import {DimActor} from "../entities/target/DimActor";
import {DimCategory} from "../entities/target/DimCategory";
import {DimCustomer} from "../entities/target/DimCustomer";
import {DimDate} from "../entities/target/DimDate";
import {DimFilm} from "../entities/target/DimFilm";
import {DimStore} from "../entities/target/DimStore";
import {FactPayment} from "../entities/target/FactPayment";
import {FactRental} from "../entities/target/FactRental";
import {SyncState} from "../entities/target/SyncState";

export const SQLiteTarget = new DataSource({
    type: "sqlite",
    database: "./analytics.sqlite",
    entities: [BridgeFilmActor, BridgeFilmCategory, DimActor, DimCategory, DimCustomer, DimDate, DimFilm, DimStore, FactPayment, FactRental, SyncState],
    synchronize: true,
});