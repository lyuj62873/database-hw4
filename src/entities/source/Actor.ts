import {Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn} from "typeorm";
import {FilmActor} from "./FilmActor";

@Entity({name: "actor"})
export class Actor {
    @PrimaryGeneratedColumn({type: "smallint", unsigned: true})
    actor_id!: number;
    @Column({type: "varchar", length: 45})
    first_name!: string;
    @Column({type: "varchar", length: 45})
    last_name!: string;
    @Column({type: "timestamp", default: "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP"})
    last_update!: Date;
    @OneToMany(() => FilmActor, (filmActor) => filmActor.actor)
    filmActors!: FilmActor[];
}