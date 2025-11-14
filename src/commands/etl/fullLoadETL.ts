import {loadDimDate} from "./module/loadDimDate";
import {loadDimActor} from "./module/loadDimActor";
import {loadDimFilm} from "./module/loadDimFilm";
import {loadDimCategory} from "./module/loadDimCategory";
import {loadDimStore} from "./module/loadDimStore";
import {loadDimCustomer} from "./module/loadDimCustomer";
import {loadBridgeFilmActor} from "./module/loadBridgeFilmActor";
import {loadBridgeFilmCategory} from "./module/loadBridgeFilmCategory";
import {loadFactRental} from "./module/loadFactRental";
import {loadFactPayment} from "./module/loadFactPayment";
import {SQLiteTarget} from "../../data-sources/SQLiteTarget";
import {MySQLSource} from "../../data-sources/MySQLSource";

export async function fullLoadETL() {
    try {
        console.log("Starting ETL process...");
        if (!SQLiteTarget.isInitialized) await SQLiteTarget.initialize();
        if (!MySQLSource.isInitialized) await MySQLSource.initialize();


        await SQLiteTarget.transaction(async manager => {
            console.log("Loading dim_date...");
            await loadDimDate(manager);

            console.log("Loading dim_actor...");
            await loadDimActor(manager);

            console.log("Loading dim_film...");
            await loadDimFilm(manager);

            console.log("Loading dim_category...");
            await loadDimCategory(manager);

            console.log("Loading dim_store...");
            await loadDimStore(manager);

            console.log("Loading dim_customer...");
            await loadDimCustomer(manager);

            console.log("Loading bridge_film_actor...");
            await loadBridgeFilmActor(manager);

            console.log("Loading bridge_film_category...");
            await loadBridgeFilmCategory(manager);

            console.log("Loading fact_rental...");
            await loadFactRental(manager);

            console.log("Loading fact_payment...");
            await loadFactPayment(manager);
        })



        console.log("ETL process completed successfully.");
        if (SQLiteTarget.isInitialized) await SQLiteTarget.destroy();
        if (MySQLSource.isInitialized) await MySQLSource.destroy();
    } catch (error) {
        console.error("ETL process failed:", error);
    }
}
