# Student Management System

A Spring Boot-based RESTful API for managing student records with authentication and domain management capabilities.

## Features

- Student CRUD operations
- Domain management
- JWT-based authentication
- Role-based access control
- OpenAPI (Swagger) documentation
- MySQL database integration
- RESTful API endpoints

## Tech Stack

- **Backend**: Spring Boot 3.2.0
- **Database**: MySQL
- **Security**: Spring Security with JWT
- **Documentation**: SpringDoc OpenAPI
- **Build Tool**: Maven
- **Java Version**: 17

## Prerequisites

- Java 17 or higher
- MySQL Server
- Maven 3.6.3 or higher

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd demo
   ```

2. **Configure Database**
   - Create a MySQL database
   - Update `application.properties` with your database credentials

3. **Build and Run**
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

4. **Access the API**
   - API Documentation: http://localhost:8080/swagger-ui.html
   - Base URL: http://localhost:8080/api

## API Endpoints

### Authentication
- `POST /api/auth/signin` - Authenticate user
- `POST /api/auth/signup` - Register new user

### Students
- `GET /api/students` - Get all students
- `GET /api/students/{id}` - Get student by ID
- `POST /api/students` - Create new student
- `PUT /api/students/{id}` - Update student
- `DELETE /api/students/{id}` - Delete student

### Domains
- `GET /api/domains` - Get all domains
- `POST /api/domains` - Create new domain

## Security

- JWT-based authentication
- Role-based access control (Admin/User roles)
- Password encryption using BCrypt

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
