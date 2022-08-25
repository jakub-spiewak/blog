package com.jakubspiewak.blog.server.statistics

import com.jakubspiewak.blog.server.statistics.StatisticsEntity.Companion.HITS_FIELD
import com.jakubspiewak.blog.server.statistics.StatisticsEntity.Companion.PATH_FIELD
import org.springframework.data.domain.Sort
import org.springframework.data.mongodb.core.ReactiveMongoOperations
import org.springframework.data.mongodb.core.query.Criteria.where
import org.springframework.data.mongodb.core.query.Query
import org.springframework.stereotype.Component
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Component
class StatisticsRepositoryImpl(private val operations: ReactiveMongoOperations) : StatisticsRepository {
    override fun findAll(): Flux<StatisticsEntity> = operations.find(
        Query().with(Sort.by(HITS_FIELD).descending()),
        StatisticsEntity::class.java
    )


    override fun findAllByPathStartingWith(path: String): Flux<StatisticsEntity> = operations.find(
        Query.query(where(PATH_FIELD).regex("^$path.*$")).with(Sort.by("hits").descending()),
        StatisticsEntity::class.java
    )

    override fun findFirstByPath(path: String): Mono<StatisticsEntity> = operations.findOne(
        Query.query(where(PATH_FIELD).`is`(path)).with(Sort.by("hits").descending()),
        StatisticsEntity::class.java
    )

    override fun save(entity: StatisticsEntity): Mono<StatisticsEntity> = operations.save(entity)
}