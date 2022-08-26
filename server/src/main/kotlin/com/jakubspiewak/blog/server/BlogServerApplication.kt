package com.jakubspiewak.blog.server

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.data.mongodb.config.EnableReactiveMongoAuditing

@SpringBootApplication
@EnableReactiveMongoAuditing
class BlogServerApplication

fun main(args: Array<String>) {
    runApplication<BlogServerApplication>(*args)
}
