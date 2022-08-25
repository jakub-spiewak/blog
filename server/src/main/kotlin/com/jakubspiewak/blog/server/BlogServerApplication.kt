package com.jakubspiewak.blog.server

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.data.mongodb.repository.config.EnableReactiveMongoRepositories

@EnableReactiveMongoRepositories
@SpringBootApplication
class BlogServerApplication

fun main(args: Array<String>) {
    runApplication<BlogServerApplication>(*args)
}
