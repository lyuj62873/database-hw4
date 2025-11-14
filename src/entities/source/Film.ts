import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany} from "typeorm";
import {Language} from "./Language";
import {FilmActor} from "./FilmActor";
import {Inventory} from "./Inventory";
import {FilmCategory} from "./FilmCategory";

@Entity({name: "film"})
export class Film {
    @PrimaryGeneratedColumn({type: "smallint", unsigned: true})
    film_id!: number;

    @Column({type: "varchar", length: 128})
    title!: string;

    @Column({type: "text", nullable: true})
    description?: string;

    @Column({type: "year", nullable: true})
    release_year?: number;

    @ManyToOne(() => Language)
    @JoinColumn({name: "language_id"})
    language!: Language;

    @ManyToOne(() => Language)
    @JoinColumn({name: "original_language_id"})
    original_language?: Language;

    @Column({type: "tinyint", unsigned: true, default: 3})
    rental_duration!: number;

    @Column({type: "decimal", precision: 4, scale: 2, default: 4.99})
    rental_rate!: string;

    @Column({type: "smallint", unsigned: true, nullable: true})
    length?: number;

    @Column({type: "decimal", precision: 5, scale: 2, default: 19.99})
    replacement_cost!: string;

    @Column({
        type: "enum",
        enum: ["G", "PG", "PG-13", "R", "NC-17"],
        default: "G"
    })
    rating?: string;

    @Column({
        type: "set",
        enum: ["Trailers", "Commentaries", "Deleted Scenes", "Behind the Scenes"],
        nullable: true
    })
    special_features?: string[];

    @Column({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP"
    })
    last_update!: Date;

    @Column({type: "decimal", precision: 10, scale: 2, nullable: true})
    total_sales?: string;

    @OneToMany(() => FilmActor, (filmActor) => filmActor.film)
    filmActors!: FilmActor[];


    @OneToMany(() => Inventory, (inventory) => inventory.film)
    inventories!: Inventory[];

    @OneToMany(() => FilmCategory, (fc) => fc.film)
    filmCategories!: FilmCategory[];

}
