import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany} from "typeorm";
import {Film} from "./Film";
import {Store} from "./Store";
import {Rental} from "./Rental";

@Entity({name: "inventory"})
export class Inventory {
    @PrimaryGeneratedColumn({type: "mediumint", unsigned: true})
    inventory_id!: number;

    @Column({type: "smallint", unsigned: true})
    film_id!: number;

    @Column({type: "tinyint", unsigned: true})
    store_id!: number;

    @Column({type: "timestamp", default: "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP"})
    last_update!: Date;

    @ManyToOne(() => Film, (film) => film.inventories)
    @JoinColumn({name: "film_id"})
    film!: Film;

    @ManyToOne(() => Store, (store) => store.inventories)
    @JoinColumn({name: "store_id"})
    store!: Store;

    @OneToMany(() => Rental, (rental) => rental.inventory)
    rentals!: Rental[];

}
