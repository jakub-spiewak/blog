package com.jakubspiewak.blog.server.statistics

import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import org.springframework.stereotype.Repository

@Repository
interface StatisticsRepository : ReactiveMongoRepository<StatisticsEntity, String>