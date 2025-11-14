import {SQLiteTarget} from "../../data-sources/SQLiteTarget";
import {MySQLSource} from "../../data-sources/MySQLSource";


export async function runInitETL() {
    console.log("Initializing analytics database...");
    await SQLiteTarget.initialize();
    await MySQLSource.initialize();
    console.log("MySQL & SQLite connections OK.");

    await SQLiteTarget.synchronize();
    console.log("Analytics tables created.");
}