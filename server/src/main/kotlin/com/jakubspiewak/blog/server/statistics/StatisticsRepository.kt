package com.jakubspiewak.blog.server.statistics

import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface StatisticsRepository {
    fun findAll(): Flux<StatisticsEntity>
    fun findAllByPathStartingWith(path: String): Flux<StatisticsEntity>
    fun findFirstByPath(path: String): Mono<StatisticsEntity>
    fun save(entity: StatisticsEntity): Mono<StatisticsEntity>
}