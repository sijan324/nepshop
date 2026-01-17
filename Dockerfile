# Stage 1: Build the Frontend
FROM node:20-alpine AS frontend
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Build the Backend
FROM maven:3.9.6-eclipse-temurin-17 AS backend
WORKDIR /app
COPY backend/pom.xml .
COPY backend/src ./src
# Create static directory if it doesn't exist (though src/ copy usually handles it)
# Copy the built frontend assets to Spring Boot's static resources folder
COPY --from=frontend /app/dist/public ./src/main/resources/static

# Build the JAR
RUN mvn clean package -DskipTests

# Stage 3: Run the Application
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=backend /app/target/*.jar app.jar
EXPOSE 5000
ENTRYPOINT ["java", "-jar", "app.jar"]
