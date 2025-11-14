import {SQLiteTarget} from "../data-sources/SQLiteTarget";
import {runInitETL} from "../commands/etl/InitETL";
import {MySQLSource} from "../data-sources/MySQLSource";

describe("Init Command", () => {

    afterAll(async () => {
        if (SQLiteTarget.isInitialized) {
            await SQLiteTarget.destroy();
        }

        if (MySQLSource.isInitialized) {
            await MySQLSource.destroy();
        }
    });

    it("should create all analytics tables successfully", async () => {
        try {

            await runInitETL();

            const tableNames: { name: string }[] = await SQLiteTarget.manager.query(
                `SELECT name
                 FROM sqlite_master
                 WHERE type = 'table'`
            );

            const expectedTables = [
                "dim_date", "dim_film", "dim_actor", "dim_category", "dim_store",
                "dim_customer", "bridge_film_actor", "bridge_film_category",
                "fact_rental", "fact_payment", "sync_state"
            ];

            const createdTables = tableNames.map(t => t.name);

            expectedTables.forEach(table => {
                expect(createdTables).toContain(table);
            });
        } catch (err) {
            throw new Error(`Init failed: ${err}`);
        }
    });
});
