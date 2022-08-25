package com.jakubspiewak.blog.server.filter

import org.springframework.boot.web.reactive.filter.OrderedWebFilter
import org.springframework.stereotype.Component
import org.springframework.web.server.ServerWebExchange
import org.springframework.web.server.WebFilterChain
import reactor.core.publisher.Mono

@Component
class StaticFilesFilter : OrderedWebFilter {
    override fun filter(exchange: ServerWebExchange, chain: WebFilterChain): Mono<Void> {
        val request = exchange.request
        val requestBuilder = request.mutate()
        val pathElements = request.path.elements()
        val isMetaPath = request.path.value().startsWith("/_meta")

        if (!isMetaPath && !pathElements.last().value().contains(".")) {
            requestBuilder.path(request.uri.rawPath + "/index.html")
        }
        return chain.filter(exchange.mutate().request(requestBuilder.build()).build())
    }

    override fun getOrder() = 1
}