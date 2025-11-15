import {MySQLSource} from "../../data-sources/MySQLSource";
import {SQLiteTarget} from "../../data-sources/SQLiteTarget";
import {SyncState} from "../../entities/target/SyncState";
import {Rental} from "../../entities/source/Rental";
import {Payment} from "../../entities/source/Payment";
import {DimDate} from "../../entities/target/DimDate";
import {MoreThan} from "typeorm";
import {Actor} from "../../entities/source/Actor";
import {DimActor} from "../../entities/target/DimActor";
import {Film} from "../../entities/source/Film";
import {DimFilm} from "../../entities/target/DimFilm";
import {Category} from "../../entities/source/Category";
import {DimCategory} from "../../entities/target/DimCategory";
import {Store} from "../../entities/source/Store";
import {DimStore} from "../../entities/target/DimStore";
import {Customer} from "../../entities/source/Customer";
import {DimCustomer} from "../../entities/target/DimCustomer";
import {FilmActor} from "../../entities/source/FilmActor";
import {BridgeFilmActor} from "../../entities/target/BridgeFilmActor";
import {FilmCategory} from "../../entities/source/FilmCategory";
import {BridgeFilmCategory} from "../../entities/target/BridgeFilmCategory";
import {FactRental} from "../../entities/target/FactRental";
import {FactPayment} from "../../entities/target/FactPayment";

function getDateKey(date: Date) {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const d = date.getDate().toString().padStart(2, "0");
    return `${y}${m}${d}`;
}

function isWeekend(date: Date) {
    const day = date.getDay();
    return day === 0 || day === 6;
}

export async function runIncrementalETL() {
    await MySQLSource.initialize();
    await SQLiteTarget.initialize();

    try {
        await SQLiteTarget.manager.transaction(async manager => {
            const syncRepo = manager.getRepository(SyncState);

            // MySQL repos
            const rentalRepo = MySQLSource.getRepository(Rental);
            const paymentRepo = MySQLSource.getRepository(Payment);
            const actorRepo = MySQLSource.getRepository(Actor);
            const filmRepo = MySQLSource.getRepository(Film);
            const categoryRepo = MySQLSource.getRepository(Category);
            const storeRepo = MySQLSource.getRepository(Store);
            const customerRepo = MySQLSource.getRepository(Customer);
            const filmActorRepo = MySQLSource.getRepository(FilmActor);
            const filmCategoryRepo = MySQLSource.getRepository(FilmCategory);

            // SQLite repos via transaction
            const dimDateRepo = manager.getRepository(DimDate);
            const dimActorRepo = manager.getRepository(DimActor);
            const dimFilmRepo = manager.getRepository(DimFilm);
            const dimCategoryRepo = manager.getRepository(DimCategory);
            const dimStoreRepo = manager.getRepository(DimStore);
            const dimCustomerRepo = manager.getRepository(DimCustomer);
            const bridgeFARepo = manager.getRepository(BridgeFilmActor);
            const bridgeFCRepo = manager.getRepository(BridgeFilmCategory);
            const factRentalRepo = manager.getRepository(FactRental);
            const factPaymentRepo = manager.getRepository(FactPayment);

            // dim_date
            const dateState = await syncRepo.findOne({where: {table_name: "dim_date"}});
            const lastDateSync = new Date(dateState?.last_sync ?? "1970-01-01");

            const rentals = await rentalRepo.find({
                where: {rental_date: MoreThan(lastDateSync)},
                select: ["rental_date", "return_date"]
            });
            const payments = await paymentRepo.find({
                where: {payment_date: MoreThan(lastDateSync)},
                select: ["payment_date"]
            });

            const dateSet = new Set<string>();
            rentals.forEach(r => {
                dateSet.add(getDateKey(r.rental_date));
                if (r.return_date) dateSet.add(getDateKey(r.return_date));
            });
            payments.forEach(p => dateSet.add(getDateKey(p.payment_date)));

            const dimDates = Array.from(dateSet).map(dateKey => {
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
            if (dimDates.length) {
                await dimDateRepo.upsert(dimDates, ["date_key"]);
                await syncRepo.upsert({table_name: "dim_date", last_sync: new Date().toISOString()}, ["table_name"]);
            }

            // dim_actor
            const actorState = await syncRepo.findOne({where: {table_name: "dim_actor"}});
            const lastActorSync = new Date(actorState?.last_sync ?? "1970-01-01");

            const actors = await actorRepo.find({where: {last_update: MoreThan(lastActorSync)}});
            const dimActors = actors.map(a => dimActorRepo.create({
                actor_id: a.actor_id,
                first_name: a.first_name,
                last_name: a.last_name,
                last_update: a.last_update.toISOString()
            }));
            if (dimActors.length) {
                await dimActorRepo.upsert(dimActors, ["actor_id"]);
                await syncRepo.upsert({table_name: "dim_actor", last_sync: new Date().toISOString()}, ["table_name"]);
            }

            // dim_film
            const filmState = await syncRepo.findOne({where: {table_name: "dim_film"}});
            const lastFilmSync = new Date(filmState?.last_sync ?? "1970-01-01");

            const films = await filmRepo.find({where: {last_update: MoreThan(lastFilmSync)}, relations: ["language"]});
            const offsetFilm = 10000;
            const dimFilms = films.map(f => dimFilmRepo.create({
                film_key: f.film_id + offsetFilm,
                film_id: f.film_id,
                title: f.title,
                rating: f.rating ?? "",
                length: f.length ?? 0,
                language: f.language.name,
                release_year: f.release_year ?? 0,
                last_update: f.last_update.toISOString()
            }));
            if (dimFilms.length) {
                await dimFilmRepo.upsert(dimFilms, ["film_id"]);
                await syncRepo.upsert({table_name: "dim_film", last_sync: new Date().toISOString()}, ["table_name"]);
            }

            // dim_category
            const catState = await syncRepo.findOne({where: {table_name: "dim_category"}});
            const lastCatSync = new Date(catState?.last_sync ?? "1970-01-01");

            const categories = await categoryRepo.find({where: {last_update: MoreThan(lastCatSync)}});
            const dimCategories = categories.map(c => dimCategoryRepo.create({
                category_id: c.category_id,
                name: c.name,
                last_update: c.last_update.toISOString()
            }));
            if (dimCategories.length) {
                await dimCategoryRepo.upsert(dimCategories, ["category_id"]);
                await syncRepo.upsert({
                    table_name: "dim_category",
                    last_sync: new Date().toISOString()
                }, ["table_name"]);
            }

            // dim_store
            const storeState = await syncRepo.findOne({where: {table_name: "dim_store"}});
            const lastStoreSync = new Date(storeState?.last_sync ?? "1970-01-01");

            const stores = await storeRepo.find({
                where: {last_update: MoreThan(lastStoreSync)},
                relations: ["address", "address.city", "address.city.country"]
            });
            const dimStores = stores.map(s => dimStoreRepo.create({
                store_id: s.store_id,
                city: s.address.city.city,
                country: s.address.city.country.country,
                last_update: s.last_update.toISOString()
            }));
            if (dimStores.length) {
                await dimStoreRepo.upsert(dimStores, ["store_id"]);
                await syncRepo.upsert({table_name: "dim_store", last_sync: new Date().toISOString()}, ["table_name"]);
            }

            // dim_customer
            const custState = await syncRepo.findOne({where: {table_name: "dim_customer"}});
            const lastCustSync = new Date(custState?.last_sync ?? "1970-01-01");

            const customers = await customerRepo.find({
                where: {last_update: MoreThan(lastCustSync)},
                relations: ["address", "address.city", "address.city.country"]
            });
            const dimCustomers = customers.map(c => dimCustomerRepo.create({
                customer_key: c.customer_id + 34000,
                customer_id: c.customer_id,
                first_name: c.first_name,
                last_name: c.last_name,
                active: c.active,
                city: c.address.city.city,
                country: c.address.city.country.country,
                last_update: c.last_update ? c.last_update.toISOString() : new Date().toISOString()
            }));
            if (dimCustomers.length) {
                await dimCustomerRepo.upsert(dimCustomers, ["customer_id"]);
                await syncRepo.upsert({
                    table_name: "dim_customer",
                    last_sync: new Date().toISOString()
                }, ["table_name"]);
            }

            // bridge_film_actor
            const faState = await syncRepo.findOne({where: {table_name: "bridge_film_actor"}});
            const lastFASync = new Date(faState?.last_sync ?? "1970-01-01");

            const filmActors = await filmActorRepo.find({where: {last_update: MoreThan(lastFASync)}});
            const bridgeFA = filmActors.map(fa => bridgeFARepo.create({
                film_key: fa.film_id + 10000,
                actor_key: fa.actor_id + 50000
            }));
            if (bridgeFA.length) {
                await bridgeFARepo.upsert(bridgeFA, ["id"]);
                await syncRepo.upsert({
                    table_name: "bridge_film_actor",
                    last_sync: new Date().toISOString()
                }, ["table_name"]);
            }

            // bridge_film_category
            const fcState = await syncRepo.findOne({where: {table_name: "bridge_film_category"}});
            const lastFCSync = new Date(fcState?.last_sync ?? "1970-01-01");

            const filmCategories = await filmCategoryRepo.find({where: {last_update: MoreThan(lastFCSync)}});
            const bridgeFC = filmCategories.map(fc => bridgeFCRepo.create({
                film_key: fc.film_id + 10000,
                category_key: fc.category_id + 20000
            }));
            if (bridgeFC.length) {
                await bridgeFCRepo.upsert(bridgeFC, ["id"]);
                await syncRepo.upsert({
                    table_name: "bridge_film_category",
                    last_sync: new Date().toISOString()
                }, ["table_name"]);
            }

            // fact_rental
            const rentalState = await syncRepo.findOne({where: {table_name: "fact_rental"}});
            const lastRentalSync = new Date(rentalState?.last_sync ?? "1970-01-01");

            const newRentals = await rentalRepo.find({
                where: {last_update: MoreThan(lastRentalSync)},
                relations: ["inventory", "inventory.film", "customer", "staff"]
            });
            const factsRental = newRentals.map(r => factRentalRepo.create({
                rental_id: r.rental_id,
                date_key_rented: parseInt(getDateKey(r.rental_date)),
                date_key_returned: r.return_date ? parseInt(getDateKey(r.return_date)) : null,
                film_key: r.inventory.film.film_id + 10000,
                store_key: r.inventory.store_id + 1,
                customer_key: r.customer.customer_id + 34000,
                staff_id: r.staff.staff_id,
                rental_duration_days: r.return_date ? Math.ceil((r.return_date.getTime() - r.rental_date.getTime()) / (1000 * 3600 * 24)) : 0
            }));
            if (factsRental.length) {
                await factRentalRepo.upsert(factsRental, ["rental_id"]);
                await syncRepo.upsert({table_name: "fact_rental", last_sync: new Date().toISOString()}, ["table_name"]);
            }

            // fact_payment
            const paymentState = await syncRepo.findOne({where: {table_name: "fact_payment"}});
            const lastPaymentSync = new Date(paymentState?.last_sync ?? "1970-01-01");

            const newPayments = await paymentRepo.find({
                where: {last_update: MoreThan(lastPaymentSync)},
                relations: ["customer", "staff"]
            });
            const factsPayment = newPayments.map(p => factPaymentRepo.create({
                payment_id: p.payment_id,
                date_key_paid: parseInt(getDateKey(p.payment_date)),
                customer_key: p.customer.customer_id + 34000,
                store_key: p.staff.store_id + 1,
                staff_id: p.staff.staff_id,
                amount: p.amount
            }));
            if (factsPayment.length) {
                await factPaymentRepo.upsert(factsPayment, ["payment_id"]);
                await syncRepo.upsert({
                    table_name: "fact_payment",
                    last_sync: new Date().toISOString()
                }, ["table_name"]);
            }
        });

        console.log("Incremental ETL completed successfully.");
    } catch (error) {
        console.error("Incremental ETL failed, rolling back:", error);
        throw error;
    } finally {
        await MySQLSource.destroy();
        await SQLiteTarget.destroy();
    }
}
