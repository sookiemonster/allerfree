# Build JAR file
FROM eclipse-temurin:25-jdk-maven AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests -B
ARG JAR_FILE=target/AllerFree-0.0.1-SNAPSHOT.jar

# Run
FROM eclipse-temurin:25-jdk-alpine
WORKDIR /app
COPY target/AllerFree-0.0.1-SNAPSHOT.jar /app/AllerFree-0.0.1-SNAPSHOT.jar
EXPOSE 8081
CMD ["java", "-jar", "/app/AllerFree-0.0.1-SNAPSHOT.jar"]