package com.jakubspiewak.blog.server.filter

import com.jakubspiewak.blog.server.statistics.StatisticsEntity
import com.jakubspiewak.blog.server.statistics.StatisticsService
import org.springframework.boot.web.reactive.filter.OrderedWebFilter
import org.springframework.stereotype.Component
import org.springframework.web.server.ServerWebExchange
import org.springframework.web.server.WebFilterChain
import reactor.core.publisher.Mono

@Component
class StatisticsFilter(private val service: StatisticsService) : OrderedWebFilter {
    override fun filter(exchange: ServerWebExchange, chain: WebFilterChain): Mono<Void> {
        val path = exchange.request.path.subPath(1).value()

        if (path.startsWith("_meta")) return chain.filter(exchange)

        return service.getStatisticByPath(path)
            .map { StatisticsEntity(id = it.id, path = it.path, hits = it.hits + 1) }
            .switchIfEmpty(Mono.fromSupplier { StatisticsEntity(path = path) })
            .flatMap { service.saveStatistics(it) }
            .and(chain.filter(exchange))
    }

    override fun getOrder() = 0
}