const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            version: "1.0.0",
            title: "Test API - Jonghyeon",
            description: 
                "Test API with express"
        },
        servers: [
            {
                url: "52.78.125.48", //요청 URL
            },
        ],
    },
    apis: ["./routes/users.route.js", "./routes/posts.route.js", "./routes/users.route.js"], //Swagger 파일 연동
}
const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
