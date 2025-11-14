import {DataSource} from "typeorm";
import {Actor} from "../entities/source/Actor";
import {Address} from "../entities/source/Address";
import {Category} from "../entities/source/Category";
import {City} from "../entities/source/City";
import {Country} from "../entities/source/Country";
import {Customer} from "../entities/source/Customer";
import {Film} from "../entities/source/Film";
import {FilmActor} from "../entities/source/FilmActor";
import {Inventory} from "../entities/source/Inventory";
import {Language} from "../entities/source/Language";
import {Payment} from "../entities/source/Payment";
import {Rental} from "../entities/source/Rental";
import {Staff} from "../entities/source/Staff";
import {Store} from "../entities/source/Store";
import {FilmCategory} from "../entities/source/FilmCategory";

export const MySQLSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "abc123",
    database: "sakila",
    entities: [Actor, Address, Category, City, Country, Customer, Film, FilmActor, Inventory, Language, Payment, Rental, Staff, Store, FilmCategory],
    synchronize: false,
});