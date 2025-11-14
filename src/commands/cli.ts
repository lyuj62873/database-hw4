#!/usr/bin/env ts-node

import {SQLiteTarget} from "../data-sources/SQLiteTarget";
import {MySQLSource} from "../data-sources/MySQLSource";
import {optimizeAndValidate} from "./etl/optimizeValidateETL";
import {runIncrementalETL} from "./etl/incrementalETL";
import {runInitETL} from "./etl/InitETL";
import {fullLoadETL} from "./etl/fullLoadETL";

async function safeDestroy() {
    try {
        if (MySQLSource.isInitialized) await MySQLSource.destroy();
    } catch (err) {
        console.warn("MySQL destroy failed:", err);
    }
    try {
        if (SQLiteTarget.isInitialized) await SQLiteTarget.destroy();
    } catch (err) {
        console.warn("SQLite destroy failed:", err);
    }
}

async function main() {
    const command = process.argv[2];

    try {
        switch (command) {
            case "init":
                console.log("Running initialize...");
                await runInitETL();
                break;

            case "full-load":
                console.log("Running full load...");
                await fullLoadETL();
                break;

            case "incremental":
                console.log("Running incremental update...");
                await runIncrementalETL();
                break;

            case "validate":
                console.log("Optimizing and Validating data consistency...");
                await optimizeAndValidate();
                break;

            default:
                console.log("Unknown command.");
                console.log("Usage: ts-node etl-cli.ts [init|full-load|incremental|validate]");
        }
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await safeDestroy();
    }
}

main();
