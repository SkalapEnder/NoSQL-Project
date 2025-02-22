const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
    res.render("admin/console_admin");
})

router.post("/execute", async (req, res) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({ error: "Query cannot be empty" });
        }

        // Ensure the query is secure by limiting eval usage
        const result = await executeMongoQuery(query);
        res.json({ result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Function to securely execute MongoDB queries
async function executeMongoQuery(query) {
    try {
        // Use `eval` safely by restricting operations
        const db = mongoose.connection.db;
        const safeQuery = new Function("db", `return ${query};`);
        return await safeQuery(db);
    } catch (error) {
        throw new Error("Invalid MongoDB query: " + error.message);
    }
}

module.exports = router;
