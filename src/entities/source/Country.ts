import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {City} from "./City";


@Entity({name: "country"})
export class Country {
    @PrimaryGeneratedColumn({type: "smallint", unsigned: true})
    country_id!: number;
    @Column({type: "varchar", length: 50})
    country!: string;
    @Column({type: "timestamp", default: "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP"})
    last_update!: Date;

    @OneToMany(() => City, (city) => city.country)
    cities!: City[];
}