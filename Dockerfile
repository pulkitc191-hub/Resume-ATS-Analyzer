# ===== Frontend build stage =====
FROM node:22-alpine AS frontend-build

WORKDIR /frontend
COPY ["frontend src/package.json", "frontend src/package-lock.json", "./"]
RUN npm ci
COPY ["frontend src/", "./"]
RUN if [ -d src/Home ]; then mv src/Home src/home; fi \
 && if [ -d src/Login ]; then mv src/Login src/login; fi \
 && if [ -d src/Upload ]; then mv src/Upload src/upload; fi \
 && if [ -f src/appcontext.jsx ]; then true; elif [ -f src/AppContext.jsx ]; then mv src/AppContext.jsx src/appcontext.jsx; fi \
 && if [ -f src/home/Home.module.css ]; then mv src/home/Home.module.css src/home/home.module.css; fi \
 && if [ -f src/login/Login.module.css ]; then mv src/login/Login.module.css src/login/login.module.css; fi \
 && if [ -f src/upload/Upload.module.css ]; then mv src/upload/Upload.module.css src/upload/upload.module.css; fi
RUN npm run build

# ===== Backend build stage =====
FROM maven:3.9.9-eclipse-temurin-21 AS backend-build

WORKDIR /app
COPY pom.xml mvnw mvnw.cmd ./
COPY .mvn .mvn
RUN ./mvnw -B dependency:go-offline
COPY src src
COPY --from=frontend-build /src/main/resources/static src/main/resources/static
RUN ./mvnw -B clean package -DskipTests

# ===== Runtime stage =====
FROM eclipse-temurin:21-jre AS runtime

WORKDIR /app
COPY --from=backend-build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
