import { MySQLSource } from "../../../data-sources/MySQLSource";
import { SQLiteTarget } from "../../../data-sources/SQLiteTarget";
import { Rental } from "../../../entities/source/Rental";
import { FactRental } from "../../../entities/target/FactRental";
import { EntityManager } from "typeorm";

function getDateKey(date: Date): number {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return parseInt(`${year}${month}${day}`);
}

export async function loadFactRental(manager?: EntityManager) {
    const rentalRepo = MySQLSource.getRepository(Rental);
    const factRentalRepo = manager
        ? manager.getRepository(FactRental)
        : SQLiteTarget.getRepository(FactRental);

    const rentals = await rentalRepo.find({
        relations: ["inventory", "inventory.film", "inventory.store", "customer", "staff"]
    });

    const factRentals = rentals.map(rental => {
        const rentedDateKey = getDateKey(rental.rental_date);
        const returnedDateKey = rental.return_date ? getDateKey(rental.return_date) : null;

        const durationDays = rental.return_date
            ? Math.ceil((rental.return_date.getTime() - rental.rental_date.getTime()) / (1000 * 60 * 60 * 24))
            : 0;

        return factRentalRepo.create({
            rental_id: rental.rental_id,
            date_key_rented: rentedDateKey,
            date_key_returned: returnedDateKey,
            film_key: rental.inventory.film.film_id + 10000,
            store_key: rental.inventory.store.store_id + 1000,
            customer_key: rental.customer.customer_id + 34000,
            staff_id: rental.staff.staff_id,
            rental_duration_days: durationDays
        });
    });

    await factRentalRepo.save(factRentals);
    console.log(`Loaded ${factRentals.length} rows into fact_rental.`);
}
