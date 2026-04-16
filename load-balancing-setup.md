# Load Balancing Configuration Guide

## Running Multiple Instances for Load Balancing

### Option 1: Different Ports (Recommended for Development)
Run multiple instances of back-service on different ports:

1. **Instance 1** (default):
   - Port: 8200
   - Command: `mvn spring-boot:run`

2. **Instance 2**:
   - Port: 8201
   - Command: `mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=8201"`

3. **Instance 3**:
   - Port: 8202
   - Command: `mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=8202"`

### Option 2: Using Profiles
Create application-{profile}.properties files:

1. **application-instance1.properties**:
   ```properties
   server.port=8200
   eureka.instance.instance-id=back-service:instance1
   ```

2. **application-instance2.properties**:
   ```properties
   server.port=8201
   eureka.instance.instance-id=back-service:instance2
   ```

Run with profiles:
- `mvn spring-boot:run -Dspring-boot.run.profiles=instance1`
- `mvn spring-boot:run -Dspring-boot.run.profiles=instance2`

### Load Balancing Features Enabled:
- **Retry Mechanism**: 3 attempts with 1s backoff
- **Round Robin**: Default Spring Cloud LoadBalancer strategy
- **Health Checks**: Automatic unhealthy instance removal
- **Instance Discovery**: Dynamic service registration

### Testing Load Balancing:
1. Start multiple back-service instances
2. Check Eureka dashboard: `http://localhost:8150`
3. Make requests through gateway: `http://localhost:8100/api/your-endpoint`
4. Observe requests distributed across instances

### Monitoring Load Balancing:
- Gateway routes: `http://localhost:8100/actuator/gateway/routes`
- Service health: `http://localhost:8100/actuator/health`
- Metrics: `http://localhost:8100/actuator/metrics`
