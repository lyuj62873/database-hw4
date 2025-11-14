import {Entity, Column, ManyToOne, JoinColumn, PrimaryColumn} from "typeorm";
import {Actor} from "./Actor";
import {Film} from "./Film";

@Entity({name: "film_actor"})
export class FilmActor {
    @PrimaryColumn({type: "smallint", unsigned: true})
    actor_id!: number;

    @PrimaryColumn({type: "smallint", unsigned: true})
    film_id!: number;

    @Column({type: "timestamp", default: "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP"})
    last_update!: Date;

    @ManyToOne(() => Film, (film) => film.filmActors, {onDelete: "RESTRICT", onUpdate: "CASCADE"})
    @JoinColumn({name: "film_id"})
    film!: Film;

    @ManyToOne(() => Actor, (actor) => actor.filmActors, {onDelete: "RESTRICT", onUpdate: "CASCADE"})
    @JoinColumn({name: "film_id"})
    actor!: Film;
}