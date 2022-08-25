package com.jakubspiewak.blog.server.statistics

import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Service
class StatisticsService(private val repository: StatisticsRepository) {
    fun StatisticsEntity.toResponse(): StatisticsResponse = StatisticsResponse(path = this.path, hits = this.hits)

    fun saveStatistics(entity: StatisticsEntity): Mono<StatisticsEntity> = repository.save(entity)

    fun getStatisticByPath(path: String): Mono<StatisticsEntity> = repository.findFirstByPath(Mono.just(path))

    fun getAllStatistics(): Flux<StatisticsResponse> = repository.findAll()
        .map { statistic -> statistic.toResponse() }
        .sort { o1, o2 -> o2.hits - o1.hits }

    fun getAllStatisticsPrefixed(prefix: String): Flux<StatisticsResponse> =
        repository.findAllByPathIsStartingWith(Mono.just(prefix))
            .map { statistic -> statistic.toResponse() }
            .sort { o1, o2 -> o2.hits - o1.hits }
}