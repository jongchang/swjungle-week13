const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            version: "1.0.0",
            title: "Test API - Jonghyeon",
            description: "Test API with express"
        },
        servers: [
            {
                url: "http://localhost:8000", // Update the URL to include the protocol
            },
            // {
            //     url: "http://52.78.125.48",
            // }
        ],
    },
    apis: ["./routes/users.route.js", "./routes/posts.route.js", "./routes/comments.route.js"], // Swagger file integration
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
