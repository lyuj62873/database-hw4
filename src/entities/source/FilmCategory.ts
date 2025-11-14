import {Entity, Column, ManyToOne, JoinColumn, PrimaryColumn} from "typeorm";
import {Film} from "./Film";
import {Category} from "./Category";

// I don't know why HW skip this one.
@Entity({name: "film_category"})
export class FilmCategory {
    @PrimaryColumn({type: "smallint", unsigned: true})
    film_id!: number;

    @PrimaryColumn({type: "tinyint", unsigned: true})
    category_id!: number;

    @Column({type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP"})
    last_update!: Date;

    @ManyToOne(() => Film, (film) => film.filmCategories)
    @JoinColumn({name: "film_id"})
    film!: Film;

    @ManyToOne(() => Category, (category) => category.filmCategories)
    @JoinColumn({name: "category_id"})
    category!: Category;
}
