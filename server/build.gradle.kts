import org.jetbrains.kotlin.gradle.tasks.KotlinCompile
import org.springframework.boot.gradle.tasks.bundling.BootBuildImage
import java.nio.file.Files.createDirectory

plugins {
    id("io.spring.dependency-management") version "1.0.13.RELEASE"
    id("org.springframework.boot") version "2.7.3"
    id("org.springframework.experimental.aot") version "0.12.1"
    kotlin("jvm") version "1.6.21"
    kotlin("plugin.spring") version "1.6.21"
}

springAot {
    removeSpelSupport.set(true)
}

group = "com.jakubspiewak.blog"
version = "0.0.1-SNAPSHOT"
java.sourceCompatibility = JavaVersion.VERSION_17

repositories {
    maven { url = uri("https://repo.spring.io/release") }
    mavenCentral()
}

extra["springCloudVersion"] = "2021.0.3"

dependencies {
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("io.projectreactor.kotlin:reactor-kotlin-extensions")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8")
    implementation("org.springframework.boot:spring-boot-starter-data-mongodb")
    implementation("org.springframework.boot:spring-boot-starter-webflux")
    implementation("org.mongodb:mongodb-driver-reactivestreams")
//    implementation("org.springframework.boot:spring-boot-configuration-processor")
//    implementation("org.springframework.experimental:spring-aot-gradle-plugin:0.9.1")
}

dependencyManagement {
    imports {
        mavenBom("org.springframework.cloud:spring-cloud-dependencies:${property("springCloudVersion")}")
    }
}

tasks.withType<KotlinCompile> {
    dependsOn("adjustErrorPages")
    kotlinOptions {
        freeCompilerArgs = listOf("-Xjsr305=strict")
        jvmTarget = "17"
    }
}

val publishImage: String? by project

tasks.named<BootBuildImage>("bootBuildImage") {
    isPublish = publishImage?.equals("true") ?: false
    imageName = "ghcr.io/jakub-spiewak/jakubspiewak-blog-server:latest"
//    TODO: support native builds: problem with the StatisticEntity constructor and reflection
//    builder = "paketobuildpacks/builder:tiny"
//    environment = mapOf("BP_NATIVE_IMAGE" to "true")
    docker {
        publishRegistry {
            username = "jakub-spiewak"
            password = System.getenv("GITHUB_TOKEN") ?: throw Exception("GITHUB_TOKEN env variable is undefined!")
            url = "https://ghcr.io"
        }
    }
}

tasks.register("buildFrontend") {
    doFirst {
        val forceBuildFrontend = project.properties["forceBuildFrontend"].toString() == "true"
        val frontendIsBuilt = File("${projectDir.absolutePath}/../frontend/dist").exists()
        if (!forceBuildFrontend && frontendIsBuilt) {
            println("Omitting building process!")
            return@doFirst
        }

        exec {
            workingDir("${projectDir.absolutePath}/../frontend")
            commandLine("bash", "-c", "yarn build")
        }
    }
}

tasks.register("copyFrontend") {
    dependsOn("buildFrontend")
    doFirst {
        val dist = File("${projectDir.absolutePath}/../frontend/dist")
        val target = File("${projectDir.absolutePath}/src/main/resources/public")

        if (dist.listFiles()?.isEmpty() != false) {
            println("There is no generated blog pages. Please build frontend project with `npm build`")
            return@doFirst
        }
        target.deleteRecursively()
        createDirectory(target.toPath())
        dist.copyRecursively(target, true)
    }
}

tasks.register("adjustErrorPages") {
    dependsOn("copyFrontend")

    doFirst {
        val errorPagesDir = File("${projectDir.absolutePath}/src/main/resources/public/error")

        errorPagesDir.listFiles()?.forEach { errorPageDir ->
            val name = errorPageDir.name
            val indexHtmlFile = File(errorPageDir, "index.html")
            val target = File(errorPagesDir, "$name.html")
            indexHtmlFile.copyTo(target, target.exists())

            errorPageDir.deleteRecursively()
        }
    }
}