# Microservices Checklist

Current service layout:

- `discovery-service` on port `8150`
- `api-gateway` on port `8100`
- `training-certifications-service` on port `8300`
- `core-service` on port `8201`
- `Front` on port `4200`

Recommended startup order:

1. Start `discovery-service`
2. Start `api-gateway`
3. Start `training-certifications-service`
4. Start `core-service`
5. Start `Front`

Quick checks:

1. Open Eureka and confirm the registered services appear:
   - `http://localhost:8150`
2. Check gateway health:
   - `http://localhost:8100/actuator/health`
3. Check the learning service through the gateway:
   - `http://localhost:8100/api/trainings`
   - `http://localhost:8100/api/certifications`
   - `http://localhost:8100/api/titles`
4. Check the scaffolded core service directly:
   - `http://localhost:8201/api/core/health`
5. Check the Angular app:
   - open `http://localhost:4200`
   - navigate to the learning module
   - create, update, and delete one training
   - create, update, and delete one certification
   - open titles and verify loading still works

If Eureka is up but a service does not appear:

- confirm the service is running on the expected port
- confirm `spring.application.name` is unique
- confirm `eureka.client.service-url.defaultZone=http://localhost:8150/eureka/`

If the frontend opens but CRUD fails:

- verify `api-gateway` is running
- verify `training-certifications-service` is registered in Eureka
- retry `http://localhost:8100/api/trainings` directly in the browser or Postman
