import {MySQLSource} from "../../../data-sources/MySQLSource";
import {DimDate} from "../../../entities/target/DimDate";
import {Rental} from "../../../entities/source/Rental";
import {Payment} from "../../../entities/source/Payment";
import {EntityManager} from "typeorm";

function getDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}${month}${day}`;
}

function isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6;
}

export async function loadDimDate(manager?: EntityManager) {
    const rentalRepo = MySQLSource.getRepository(Rental);
    const paymentRepo = MySQLSource.getRepository(Payment);

    const dimDateRepo = manager
        ? manager.getRepository(DimDate)
        : (await import("../../../data-sources/SQLiteTarget")).SQLiteTarget.getRepository(DimDate);

    const rentals = await rentalRepo.find({select: ["rental_date", "return_date"]});
    const payments = await paymentRepo.find({select: ["payment_date"]});

    const dates = new Set<string>();

    rentals.forEach(rental => {
        dates.add(getDateKey(rental.rental_date));
        if (rental.return_date) dates.add(getDateKey(rental.return_date));
    });

    payments.forEach(payment => dates.add(getDateKey(payment.payment_date)));

    const dimDates = Array.from(dates).map(dateKey => {
        const date = new Date(`${dateKey.slice(0, 4)}-${dateKey.slice(4, 6)}-${dateKey.slice(6, 8)}`);
        return dimDateRepo.create({
            date_key: dateKey,
            date: date.toISOString().slice(0, 10),
            year: date.getFullYear(),
            quarter: Math.floor(date.getMonth() / 3) + 1,
            month: date.getMonth() + 1,
            day_of_month: date.getDate(),
            day_of_week: date.getDay() + 1,
            is_weekend: isWeekend(date)
        });
    });

    await dimDateRepo.save(dimDates);
    console.log(`Loaded ${dimDates.length} dim_date rows.`);
}
