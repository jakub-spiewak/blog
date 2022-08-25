package com.jakubspiewak.blog.server.statistics

import org.springframework.data.domain.Example
import org.springframework.data.domain.ExampleMatcher
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Service
class StatisticsService(private val repository: StatisticsRepository) {
    fun StatisticsEntity.toResponse(): StatisticsResponse = StatisticsResponse(path = this.path, hits = this.hits)

    fun saveStatistics(entity: StatisticsEntity): Mono<StatisticsEntity> = repository.save(entity)

    fun getStatisticByPath(path: String): Mono<StatisticsEntity> =
        repository.findOne(
            Example.of(
                StatisticsEntity(path = path, hits = 0),
                ExampleMatcher.matchingAny()
                    .withMatcher(
                        "path",
                        ExampleMatcher.GenericPropertyMatcher()
                            .exact()
                            .caseSensitive()
                    )
                    .withIgnorePaths("id", "hits")
            )
        )

    fun getAllStatistics(): Flux<StatisticsResponse> = repository.findAll(
        Sort.by("hits").descending()
    )
        .map { statistic -> statistic.toResponse() }

    fun getAllStatisticsStartingWith(prefix: String): Flux<StatisticsResponse> =
        repository.findAll(
            Example.of(
                StatisticsEntity(path = prefix, hits = 0),
                ExampleMatcher.matchingAny()
                    .withMatcher(
                        "path",
                        ExampleMatcher.GenericPropertyMatcher()
                            .startsWith()
                            .caseSensitive()
                    )
                    .withIgnorePaths("id", "hits")
            ),
            Sort.by("hits").descending()
        )
            .map { statistic -> statistic.toResponse() }
}