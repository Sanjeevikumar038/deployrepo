# --------------------------------------------------------------------------
# STAGE 1: Build the Java application using Maven
# --------------------------------------------------------------------------
FROM maven:3.8.6-eclipse-temurin-17 AS build

# Set the working directory inside the container
WORKDIR /app

# Copy the build file (pom.xml) first to cache the dependencies
COPY pom.xml .

# Copy the source code (now in the root directory)
COPY src ./src

# Build the application, creating a JAR file
RUN mvn clean package -DskipTests


# --------------------------------------------------------------------------
# STAGE 2: Create the final, lightweight runtime image
# --------------------------------------------------------------------------
FROM eclipse-temurin:17-jdk-focal

# Set the working directory for the runtime
WORKDIR /app

# Copy the built JAR file from the 'build' stage
COPY --from=build /app/target/*.jar app.jar

# Expose the standard port for Spring Boot
EXPOSE 8080

# Command to run the JAR file when the container starts
CMD ["java", "-jar", "app.jar"]