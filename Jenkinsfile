pipeline {
    agent any

    tools {
        maven 'Maven3'
        jdk 'JDK17'
    }

    environment {
        SONAR_TOKEN    = credentials('sonar-token')
        SONAR_HOST_URL = 'http://localhost:9000'
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'blog+event',
                    url: 'https://github.com/ahmed-melki/Esprit-PIDEV-4SAE5-2026-SmartFreelancePlatform.git'
            }
        }

        stage('Build') {
            steps {
                sh 'mvn clean compile'
            }
        }

        stage('Run Unit Tests') {
            steps {
               sh 'mvn test -DskipTests=false'
            }
            post {
                always {
                    junit '**/target/surefire-reports/*.xml'
                    jacoco(
                        execPattern: '**/target/jacoco.exec',
                        classPattern: '**/target/classes',
                        sourcePattern: '**/src/main/java'
                    )
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                sh """
                mvn sonar:sonar ^
                -Dsonar.projectKey=event-project ^
                -Dsonar.host.url=%SONAR_HOST_URL% ^
                -Dsonar.login=%SONAR_TOKEN%
                """
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

    }

    post {
        success {
            echo 'CI SUCCESS ✔ Code is clean'
            build job: 'gestion-event-CD', wait: false
        }
        failure {
            echo 'CI FAILED ❌ Fix code before deploy'
        }
        always {
            cleanWs()
        }
    }
}