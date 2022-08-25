package com.jakubspiewak.blog.server.statistics

import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import org.springframework.stereotype.Repository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Repository
interface StatisticsRepository : ReactiveMongoRepository<StatisticsEntity, String>  {
    fun findAllByPathIsStartingWith(path: Mono<String>): Flux<StatisticsEntity>
    fun findFirstByPath(path: Mono<String>): Mono<StatisticsEntity>
}