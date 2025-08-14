import swaggerJSDoc from "swagger-jsdoc";

const swaggerOptions = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Employee Management System API",
        version: "1.0.0",
        description: "API documentation for Employee Management System",
      },
      servers: [
        {
          url: "http://localhost:5000/api",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
    apis: ["./routes/*.js"], // Include all route files
  };

 // Generate the swagger specification
const swaggerSpec = swaggerJSDoc(swaggerOptions);
  
export default swaggerSpec;