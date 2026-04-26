pipeline {
    agent any

    tools {
        maven 'Maven3'
        jdk 'JDK17'
    }

    environment {
        SONAR_TOKEN = credentials('sonar-token')
        SONAR_HOST_URL = 'http://localhost:9000'
    }

    stages {

        // ======================
        // 1. Checkout
        // ======================
        stage('Checkout Code') {
            steps {
                git branch: 'blog+event',
                url: 'https://github.com/ahmed-melki/Esprit-PIDEV-4SAE5-2026-SmartFreelancePlatform.git'
            }
        }

        // ======================
        // 2. Build
        // ======================
        stage('Build') {
            steps {
                sh 'mvn clean compile'
            }
        }

        // ======================
        // 3. Tests
        // ======================
        stage('Run Unit Tests') {
            steps {
                sh 'mvn test'
            }
            post {
                always {
                    junit '**/target/surefire-reports/*.xml'
                }
            }
        }

        // ======================
        // 4. SonarQube Analysis
        // ======================
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh """
                    mvn sonar:sonar \
                    -Dsonar.projectKey=event-project \
                    -Dsonar.host.url=$SONAR_HOST_URL \
                    -Dsonar.login=$SONAR_TOKEN
                    """
                }
            }
        }

        // ======================
        // 5. Quality Gate
        // ======================
        stage('Quality Gate') {
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
    }

    // ======================
    // POST ACTIONS
    // ======================
    post {
        success {
            echo 'CI SUCCESS ✔ Build OK'
        }
        failure {
            echo 'CI FAILED ❌ Check logs'
        }
        always {
            cleanWs()
        }
    }
}