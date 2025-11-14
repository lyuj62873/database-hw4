import {MySQLSource} from "../data-sources/MySQLSource";
import {SQLiteTarget} from "../data-sources/SQLiteTarget";
import {Rental} from "../entities/source/Rental";
import {runIncrementalETL} from "../commands/etl/incrementalETL";

describe("Incremental Command (New Records)", () => {

    it("should load newly added records from Sakila into SQLite", async () => {
        if (!MySQLSource.isInitialized) await MySQLSource.initialize();

        const rentalRepo = MySQLSource.getRepository(Rental);
        const newRental = rentalRepo.create({
            rental_date: new Date(),
            inventory_id: 1,
            customer_id: 1,
            staff_id: 1
        });
        await rentalRepo.save(newRental);

        if (MySQLSource.isInitialized) await MySQLSource.destroy();

        await runIncrementalETL();

        if (!SQLiteTarget.isInitialized) await SQLiteTarget.initialize();

        const result = await SQLiteTarget.manager.query(
            `SELECT COUNT(*) as cnt
             FROM fact_rental
             WHERE rental_id = ?`,
            [newRental.rental_id]
        );
        expect(Number(result[0].cnt)).toBe(1);

        if (SQLiteTarget.isInitialized) await SQLiteTarget.destroy();
    }, 30000);
});
