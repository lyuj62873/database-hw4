import {Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Country} from "./Country";
import {Address} from "./Address";


@Entity({name: "city"})
export class City {
    @PrimaryGeneratedColumn({type: "smallint", unsigned: true})
    city_id!: number;
    @Column({type: "varchar", length: 50})
    city!: string;
    @Column({type: "smallint", unsigned: true})
    country_id!: number;

    @ManyToOne(() => Country, (country) => country.cities, {onDelete: "RESTRICT", onUpdate: "CASCADE"})
    @JoinColumn({name: "country_id"})
    country!: Country;

    @OneToMany(() => Address, (address) => address.city)
    addresses!: Address[];
}