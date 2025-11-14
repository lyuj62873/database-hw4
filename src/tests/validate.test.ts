import {optimizeAndValidate} from "../commands/etl/optimizeValidateETL";

describe("Validate Command", () => {


    it("should confirm data consistency between MySQL and SQLite", async () => {
        const result = await optimizeAndValidate();
        expect(result.success).toBe(true);
    });
});
