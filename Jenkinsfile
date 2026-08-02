pipeline {
    agent any

    environment {
        // We use credentials bindings for security; this keeps secrets out of the codebase.
        // Assuming Jenkins has a username/password credential stored as 'docker-hub-credentials'
        DOCKER_CREDS = credentials('docker-hub-credentials')
        
        // As requested, images uses 'rupal0912' username
        DOCKER_USERNAME = 'rupal0912'
        BACKEND_IMAGE = "${DOCKER_USERNAME}/smart-event-backend"
        FRONTEND_IMAGE = "${DOCKER_USERNAME}/smart-event-frontend"
        
        // We tag images uniquely per build using Jenkins build number and short Git SHA.
        // This is much safer than "latest" because it guarantees we know exactly what is running in k8s.
        IMAGE_TAG = "${env.BUILD_NUMBER}-${env.GIT_COMMIT.take(7)}"
    }

    stages {
        stage('Checkout') {
            steps {
                // 1. Checkout happens first to get the code. 
                // Implicitly Jenkins usually checks out code, but it's good practice to make it explicit
                checkout scm
            }
        }

        stage('Install & Test') {
            steps {
                // 2. We run basic checks and tests before building the image.
                // It is better to fail fast here rather than wasting time building Docker images for broken code.
                dir('backend') {
                    sh 'npm install'
                    withCredentials([
                        string(credentialsId: 'mongo-uri-secret', variable: 'MONGO_URI'),
                        string(credentialsId: 'jwt-secret', variable: 'JWT_SECRET')
                    ]) {
                        sh 'npm test'
                    }
                }
            }
        }

        stage('Docker Build && Tag') {
            steps {
                // 3. We build the Docker images directly applying the unique IMAGE_TAG we generated.
                script {
                    echo "Building images with tag: ${IMAGE_TAG}"
                    
                    // Build Backend
                    dir('backend') {
                        sh "docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} ."
                    }
                    
                    // Build Frontend
                    dir('frontend') {
                        sh "docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} ."
                    }
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                // 4. We push the images securely using the bound credentials. 
                // We do this before deployment so the Kubernetes nodes can pull the new images.
                script {
                    // Login to Docker Hub using the credential variables injected by Jenkins
                    sh 'echo $DOCKER_CREDS_PSW | docker login -u $DOCKER_CREDS_USR --password-stdin'
                    
                    // Push images
                    sh "docker push ${BACKEND_IMAGE}:${IMAGE_TAG}"
                    sh "docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}"
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                // 5. Apply the initial state (services, secrets structure) and then 
                // dynamically update the image in the deployment to use the new unique tag.
                script {
                    // Apply everything in k8s/ first (services, basic deployments)
                    sh 'kubectl apply -f k8s/'
                    
                    // Force the deployments to use the specific Docker image tags we just built
                    sh "kubectl set image deployment/backend backend=${BACKEND_IMAGE}:${IMAGE_TAG}"
                    sh "kubectl set image deployment/frontend frontend=${FRONTEND_IMAGE}:${IMAGE_TAG}"
                }
            }
        }

        stage('Verify Rollout') {
            steps {
                // 6. We actively wait for Kubernetes to seamlessly shift traffic to the new pods.
                // This command blocks until all new backend/frontend pods are healthy (readiness/liveness probes pass).
                script {
                    sh 'kubectl rollout status deployment/backend --timeout=180s'
                    sh 'kubectl rollout status deployment/frontend --timeout=180s'
                }
            }
        }
    }

    post {
        // 7. Rollback mechanism: if any stage fails (like tests or rollout verify timeframe),
        // we revert the Kubernetes deployment safely so users don't face extended downtime.
        failure {
            echo "Deployment failed! Rolling back changes to previous successful release."
            script {
                sh 'kubectl rollout undo deployment/backend || true'
                sh 'kubectl rollout undo deployment/frontend || true'
            }
        }
        always {
            // Clean up basic docker logout
            sh 'docker logout || true'
        }
    }
}
