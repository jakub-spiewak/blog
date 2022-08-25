package com.jakubspiewak.blog.server.statistics

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Flux

@RestController
@RequestMapping("/_meta")
class StatisticsController(private val service: StatisticsService) {
    @GetMapping()
    fun getStatistics(@RequestParam(name = "prefix", required = false) prefix: List<String>?): Flux<StatisticsResponse> {
        println(prefix)
        if (prefix.isNullOrEmpty()) return service.getAllStatistics()

        return service.getAllStatisticsStartingWith(prefix.joinToString("/"))
    }

}