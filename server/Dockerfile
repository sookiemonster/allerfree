# Build JAR file
FROM maven:4.0.0-rc-5-amazoncorretto-25-al2023 AS builder
WORKDIR /build

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn package -DskipTests -B

FROM amazoncorretto:25.0.1-al2023-headless
WORKDIR /app
COPY --from=builder /build/target/*.jar app.jar
CMD ["java", "-jar", "app.jar"]