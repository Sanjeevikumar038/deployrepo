FROM maven:3.8.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY springapp/pom.xml ./
COPY springapp/src ./src
RUN mvn clean package -DskipTests
FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
CMD ["java", "-jar", "app.jar"]