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
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-reactor")
    implementation("org.springframework.boot:spring-boot-starter-data-mongodb-reactive")
    implementation("org.springframework.boot:spring-boot-starter-webflux")
    implementation("org.springframework.cloud:spring-cloud-starter-gateway")
    implementation("org.springframework.data:spring-data-commons")
}

dependencyManagement {
    imports {
        mavenBom("org.springframework.cloud:spring-cloud-dependencies:${property("springCloudVersion")}")
    }
}

tasks.withType<KotlinCompile> {
    kotlinOptions {
        freeCompilerArgs = listOf("-Xjsr305=strict")
        jvmTarget = "17"
    }
}

tasks.withType<BootBuildImage> {
    builder = "paketobuildpacks/builder:tiny"
    environment = mapOf("BP_NATIVE_IMAGE" to "true")
}

tasks.named("compileKotlin") {
    dependsOn("adjustErrorPages")
}

tasks.named<BootBuildImage>("bootBuildImage") {
    imageName = "jakubspiewak-blog-server"
}

tasks.register("buildFrontend") {
    doFirst {
        val forceBuildFrontend = project.properties["forceBuildFrontend"].toString() == "true"
        val frontendIsBuilt = File("${projectDir.absolutePath}/../frontend/dist").exists()
        if (!forceBuildFrontend && frontendIsBuilt) {
            println("Build frontend folder exist. Omitting building process!")
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