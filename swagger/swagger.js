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
                url: "http://52.79.105.38:3000", //요청 URL
            },
        ],
    },
    apis: ["./routes/*.js"], //Swagger 파일 연동
}
const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };

// const swaggerAutogen = require('swagger-autogen')({ language: 'ko' });

// const doc = {
//   info: {
//     title: "타이틀 입력",
//     description: "설명 입력",
//   },
//   host: "host 주소 입력",
//   schemes: ["http"],
//   // schemes: ["https" ,"http"],
// };

// const outputFile = "./swagger-output.json";	// 같은 위치에 swagger-output.json을 만든다.
// const endpointsFiles = [
//   "../app.js"					// 라우터가 명시된 곳을 지정해준다.
// ];

// swaggerAutogen(outputFile, endpointsFiles, doc);