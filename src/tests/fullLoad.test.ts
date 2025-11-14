import {SQLiteTarget} from "../data-sources/SQLiteTarget";
import {fullLoadETL} from "../commands/etl/fullLoadETL";

describe("Full-load Command", () => {

    it("should load all source data into SQLite", async () => {
        await fullLoadETL();

        if (!SQLiteTarget.isInitialized) await SQLiteTarget.initialize();

        const count = await SQLiteTarget.manager.query(
            `SELECT COUNT(*) as cnt
             FROM dim_customer`
        );
        expect(Number(count[0].cnt)).toBeGreaterThan(0);

        const filmCount = await SQLiteTarget.manager.query(
            `SELECT COUNT(*) as cnt
             FROM dim_film`
        );
        expect(Number(filmCount[0].cnt)).toBeGreaterThan(0);

        if (SQLiteTarget.isInitialized) await SQLiteTarget.destroy();
    }, 20000);
});
